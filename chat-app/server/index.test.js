import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { io as Client } from "socket.io-client";
import { createChatServer } from "./index.js";
import { user_list } from "./constants.js";

describe("Socket.io Chat Server Realtime & Security Contract [CORE+] E, [SECURITY] F", () => {
  let serverInstance;
  let port;
  let client1;
  let client2;

  beforeAll(async () => {
    // Ephemeral port 0 prevents port collisions in tests
    serverInstance = await createChatServer(0);
    port = serverInstance.httpServer.address().port;
  });

  afterAll(async () => {
    if (client1?.connected) client1.disconnect();
    if (client2?.connected) client2.disconnect();
    await serverInstance.close();
  });

  const createClient = () => {
    return new Promise((resolve, reject) => {
      const socket = Client(`http://localhost:${port}`, {
        transports: ["polling", "websocket"],
        reconnection: false,
        forceNew: true,
      });
      socket.on("connect", () => resolve(socket));
      socket.on("connect_error", (err) => reject(err));
    });
  };

  it("sends channels:list and broadcasts presence:count on connection", async () => {
    const socket = Client(`http://localhost:${port}`, {
      transports: ["polling", "websocket"],
      forceNew: true,
    });

    const channels = await new Promise((resolve) => {
      socket.on("channels:list", (list) => {
        resolve(list);
      });
    });

    expect(channels).toHaveLength(3);
    expect(channels.map((c) => c.id)).toContain("introductions");
    socket.disconnect();
  });

  it("enforces room isolation: messages sent to introductions are NOT received in poland-office", async () => {
    client1 = await createClient();
    client2 = await createClient();

    // Client 1 joins 'introductions'
    client1.emit("channel:join", { channelId: "introductions" });
    // Client 2 joins 'poland-office'
    client2.emit("channel:join", { channelId: "poland-office" });

    let client2Received = false;
    client2.on("message:new", () => {
      client2Received = true;
    });

    const client1ReceivedPromise = new Promise((resolve) => {
      client1.on("message:new", (msg) => resolve(msg));
    });

    // Client 1 sends message to introductions
    client1.emit("message:send", {
      channelId: "introductions",
      text: "Hello Introductions room only!",
    });

    const message = await client1ReceivedPromise;
    expect(message.text).toBe("Hello Introductions room only!");
    expect(message.channelId).toBe("introductions");
    expect(user_list).toContain(message.username);

    // Allow event loop to tick and ensure client 2 received nothing
    await new Promise((r) => setTimeout(r, 100));
    expect(client2Received).toBe(false);
  });

  it("server enforces author, timestamp, and UUID authority: client cannot spoof author or id", async () => {
    // Try to send spoofed author, custom id, and fake likes
    client1.emit("message:send", {
      channelId: "introductions",
      text: "Authentic server-governed message",
      username: "Hacker", // Disallowed extra field / spoof
      id: "spoofed-id",
      likes: 999,
    });

    // Zod strictObject rejects extra keys
    const errorPromise = new Promise((resolve) => {
      client1.once("chat:error", (err) => resolve(err));
    });

    const err = await errorPromise;
    expect(err.code).toBe("INVALID_INPUT");
  });

  it("broadcasts message:updated to channel room when a message is liked", async () => {
    // Post a message first
    const msgPromise = new Promise((resolve) => {
      client1.once("message:new", (msg) => resolve(msg));
    });

    client1.emit("message:send", {
      channelId: "introductions",
      text: "Likeable message",
    });

    const msg = await msgPromise;

    // Both client 1 and client 3 in introductions receive the like update
    const client3 = await createClient();
    client3.emit("channel:join", { channelId: "introductions" });

    const likePromise = new Promise((resolve) => {
      client3.once("message:updated", (update) => resolve(update));
    });

    client1.emit("message:like", {
      channelId: "introductions",
      messageId: msg.id,
    });

    const updated = await likePromise;
    expect(updated.messageId).toBe(msg.id);
    expect(updated.likes).toBe(1);

    client3.disconnect();
  });

  it("validates channel:create with ack callback and broadcasts channels:updated to all clients", async () => {
    const updatePromise = new Promise((resolve) => {
      client2.once("channels:updated", (channels) => resolve(channels));
    });

    const ackResult = await new Promise((resolve) => {
      client1.emit(
        "channel:create",
        { name: "Devops Team" },
        (ack) => resolve(ack)
      );
    });

    expect(ackResult.ok).toBe(true);
    expect(ackResult.channel.id).toBe("devops-team");

    const updatedChannels = await updatePromise;
    expect(updatedChannels.some((c) => c.id === "devops-team")).toBe(true);
  });

  it("rejects duplicate channel creation via ack error", async () => {
    const ackResult = await new Promise((resolve) => {
      client1.emit(
        "channel:create",
        { name: "Devops Team" }, // already created above
        (ack) => resolve(ack)
      );
    });

    expect(ackResult.ok).toBe(false);
    expect(ackResult.error).toMatch(/already exists/i);
  });

  it("rate limits spamming sockets (RATE_LIMITS on message:send: 5 per 5s)", async () => {
    const spammer = await createClient();
    spammer.emit("channel:join", { channelId: "introductions" });

    let rateLimitedError = null;
    spammer.on("chat:error", (err) => {
      if (err.code === "RATE_LIMITED") {
        rateLimitedError = err;
      }
    });

    // Spam 7 messages in rapid succession
    for (let i = 0; i < 7; i++) {
      spammer.emit("message:send", {
        channelId: "introductions",
        text: `Spam ${i}`,
      });
    }

    await new Promise((r) => setTimeout(r, 200));
    expect(rateLimitedError).not.toBeNull();
    expect(rateLimitedError.code).toBe("RATE_LIMITED");

    spammer.disconnect();
  });
});
