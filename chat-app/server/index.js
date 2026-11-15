import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import crypto from "crypto";
import {
  SEED_CHANNELS,
  DEFAULT_CHANNEL_ID,
  NEW_CHANNEL_DESCRIPTION,
  MAX_CHANNELS,
  MAX_MESSAGES_PER_CHANNEL,
  MAX_PAYLOAD_BYTES,
  RATE_LIMITS,
  getRandomUser,
  slugify,
} from "./constants.js";
import {
  channelJoinSchema,
  messageSendSchema,
  messageLikeSchema,
  channelCreateSchema,
  firstError,
} from "./schemas.js";

export function createChatServer(port = process.env.PORT || 3001) {
  const app = express();
  const httpServer = createServer(app);

  // In test mode, allow all origins; in production, use CLIENT_ORIGIN
  const isTest = process.env.NODE_ENV === "test" || port === 0;
  const clientOrigin = isTest ? "*" : (process.env.CLIENT_ORIGIN || "http://localhost:5173");

  // HTTP Security Hardening
  app.use(helmet());
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: "10kb" }));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

  // Socket.io Server Setup
  const io = new Server(httpServer, {
    cors: {
      origin: clientOrigin,
      methods: ["GET", "POST"],
    },
    maxHttpBufferSize: MAX_PAYLOAD_BYTES,
  });

  // In-Memory Storage using Map to prevent prototype pollution
  const channels = new Map(SEED_CHANNELS.map((ch) => [ch.id, { ...ch }]));
  const messagesByChannel = new Map(
    SEED_CHANNELS.map((ch) => [ch.id, []])
  );

  // Per-socket rate limiter: Map<socketId, Map<action, { timestamps: number[] }>>
  const rateLimiters = new Map();

  function checkRateLimit(socketId, action) {
    const rule = RATE_LIMITS[action];
    if (!rule) return true;

    if (!rateLimiters.has(socketId)) {
      rateLimiters.set(socketId, new Map());
    }

    const socketLimits = rateLimiters.get(socketId);
    if (!socketLimits.has(action)) {
      socketLimits.set(action, []);
    }

    const now = Date.now();
    const timestamps = socketLimits
      .get(action)
      .filter((time) => now - time < rule.windowMs);

    if (timestamps.length >= rule.max) {
      return false;
    }

    timestamps.push(now);
    socketLimits.set(action, timestamps);
    return true;
  }

  function getChannelList() {
    return Array.from(channels.values());
  }

  // Socket Connection Lifecycle
  io.on("connection", (socket) => {
    let currentChannelId = null;

    // Send initial channel list & broadcast updated presence count
    socket.emit("channels:list", getChannelList());
    io.emit("presence:count", io.engine.clientsCount);

    // 1. channel:join
    socket.on("channel:join", (rawPayload) => {
      try {
        if (!checkRateLimit(socket.id, "channel:join")) {
          socket.emit("chat:error", {
            code: "RATE_LIMITED",
            message: "Too many channel switch requests",
          });
          return;
        }

        const parseResult = channelJoinSchema.safeParse(rawPayload);
        if (!parseResult.success) {
          socket.emit("chat:error", {
            code: "INVALID_INPUT",
            message: firstError(parseResult),
          });
          return;
        }

        const { channelId } = parseResult.data;
        if (!channels.has(channelId)) {
          socket.emit("chat:error", {
            code: "NOT_FOUND",
            message: "Channel does not exist",
          });
          return;
        }

        if (currentChannelId) {
          socket.leave(currentChannelId);
        }

        socket.join(channelId);
        currentChannelId = channelId;

        const history = messagesByChannel.get(channelId) || [];
        socket.emit("messages:history", {
          channelId,
          messages: history,
        });
      } catch (err) {
        socket.emit("chat:error", {
          code: "SERVER_ERROR",
          message: "Unable to join channel",
        });
      }
    });

    // 2. message:send
    socket.on("message:send", (rawPayload) => {
      try {
        if (!checkRateLimit(socket.id, "message:send")) {
          socket.emit("chat:error", {
            code: "RATE_LIMITED",
            message: "You are sending messages too quickly. Please wait.",
          });
          return;
        }

        const parseResult = messageSendSchema.safeParse(rawPayload);
        if (!parseResult.success) {
          socket.emit("chat:error", {
            code: "INVALID_INPUT",
            message: firstError(parseResult),
          });
          return;
        }

        const { channelId, text } = parseResult.data;
        if (!channels.has(channelId)) {
          socket.emit("chat:error", {
            code: "NOT_FOUND",
            message: "Channel not found",
          });
          return;
        }

        // Server authority: generates ID, timestamp, and author
        const message = {
          id: crypto.randomUUID(),
          channelId,
          text,
          username: getRandomUser(),
          timestamp: Date.now(),
          likes: 0,
        };

        const channelMsgs = messagesByChannel.get(channelId) || [];
        channelMsgs.push(message);

        // Cap messages per channel (FIFO)
        if (channelMsgs.length > MAX_MESSAGES_PER_CHANNEL) {
          channelMsgs.shift();
        }
        messagesByChannel.set(channelId, channelMsgs);

        // Broadcast to channel room only
        io.to(channelId).emit("message:new", message);
      } catch (err) {
        socket.emit("chat:error", {
          code: "SERVER_ERROR",
          message: "Internal error processing message",
        });
      }
    });

    // 3. message:like
    socket.on("message:like", (rawPayload) => {
      try {
        if (!checkRateLimit(socket.id, "message:like")) {
          socket.emit("chat:error", {
            code: "RATE_LIMITED",
            message: "Liking too fast",
          });
          return;
        }

        const parseResult = messageLikeSchema.safeParse(rawPayload);
        if (!parseResult.success) {
          socket.emit("chat:error", {
            code: "INVALID_INPUT",
            message: firstError(parseResult),
          });
          return;
        }

        const { channelId, messageId } = parseResult.data;
        const channelMsgs = messagesByChannel.get(channelId);
        if (!channelMsgs) {
          socket.emit("chat:error", {
            code: "NOT_FOUND",
            message: "Channel not found",
          });
          return;
        }

        const targetMsg = channelMsgs.find((m) => m.id === messageId);
        if (!targetMsg) {
          socket.emit("chat:error", {
            code: "NOT_FOUND",
            message: "Message not found",
          });
          return;
        }

        targetMsg.likes += 1;

        io.to(channelId).emit("message:updated", {
          channelId,
          messageId,
          likes: targetMsg.likes,
        });
      } catch (err) {
        socket.emit("chat:error", {
          code: "SERVER_ERROR",
          message: "Error recording like",
        });
      }
    });

    // 4. channel:create
    socket.on("channel:create", (rawPayload, ack) => {
      try {
        if (!checkRateLimit(socket.id, "channel:create")) {
          ack?.({
            ok: false,
            error: "Too many channel creation attempts",
          });
          return;
        }

        const parseResult = channelCreateSchema.safeParse(rawPayload);
        if (!parseResult.success) {
          ack?.({ ok: false, error: firstError(parseResult) });
          return;
        }

        if (channels.size >= MAX_CHANNELS) {
          ack?.({
            ok: false,
            error: `Maximum channel capacity (${MAX_CHANNELS}) reached`,
          });
          return;
        }

        const name = parseResult.data.name;
        const id = slugify(name);

        const exists = Array.from(channels.values()).some(
          (c) => c.id === id || c.name.toLowerCase() === name.toLowerCase()
        );

        if (exists) {
          ack?.({ ok: false, error: "Channel already exists" });
          return;
        }

        const newChannel = {
          id,
          name,
          description: NEW_CHANNEL_DESCRIPTION,
        };

        channels.set(id, newChannel);
        messagesByChannel.set(id, []);

        ack?.({ ok: true, channel: newChannel });
        io.emit("channels:updated", getChannelList());
      } catch (err) {
        ack?.({ ok: false, error: "Failed to create channel" });
      }
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      rateLimiters.delete(socket.id);
      io.emit("presence:count", io.engine.clientsCount);
    });
  });

  return new Promise((resolve) => {
    httpServer.listen(port, () => {
      resolve({
        httpServer,
        io,
        close: () =>
          new Promise((done) => {
            io.close(() => {
              httpServer.close(done);
            });
          }),
      });
    });
  });
}

// Direct execution
if (process.env.NODE_ENV !== "test" && process.argv[1]?.endsWith("index.js")) {
  createChatServer().then(({ httpServer }) => {
    const address = httpServer.address();
    console.log(`Chat Server running on port ${address.port}`);
  });
}
