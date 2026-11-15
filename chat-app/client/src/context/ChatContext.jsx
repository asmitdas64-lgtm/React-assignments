import {
  createContext,
  useContext,
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useState,
  useRef,
} from 'react';
import { chatReducer, initialState } from './chatReducer.js';
import {
  messageTextSchema,
  channelNameSchema,
  firstError,
} from '../validation/schemas.js';
import {
  slugify,
  NEW_CHANNEL_DESCRIPTION,
  MAX_CHANNELS,
} from '../constants/users.js';
import { socket } from '../socket/socket.js';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [serverError, setServerError] = useState('');
  const activeChannelRef = useRef(state.activeChannelId);

  useEffect(() => {
    activeChannelRef.current = state.activeChannelId;
  }, [state.activeChannelId]);

  const activeChannel = useMemo(
    () =>
      state.channels.find((ch) => ch.id === state.activeChannelId) ||
      state.channels[0],
    [state.channels, state.activeChannelId]
  );

  const activeMessages = useMemo(
    () => state.messagesByChannel[state.activeChannelId] || [],
    [state.messagesByChannel, state.activeChannelId]
  );

  // Setup Socket.io real-time connection lifecycle (Strict-mode safe)
  useEffect(() => {
    dispatch({ type: 'CONNECTION_CHANGED', payload: { status: 'connecting' } });

    socket.connect();

    const onConnect = () => {
      dispatch({ type: 'CONNECTION_CHANGED', payload: { status: 'connected' } });
      // Join active channel on connect
      socket.emit('channel:join', { channelId: activeChannelRef.current });
    };

    const onDisconnect = () => {
      dispatch({ type: 'CONNECTION_CHANGED', payload: { status: 'offline' } });
    };

    const onConnectError = () => {
      dispatch({ type: 'CONNECTION_CHANGED', payload: { status: 'offline' } });
    };

    const onChannelsList = (channels) => {
      dispatch({ type: 'CHANNELS_SET', payload: { channels } });
    };

    const onChannelsUpdated = (channels) => {
      dispatch({ type: 'CHANNELS_SET', payload: { channels } });
    };

    const onPresenceCount = (count) => {
      dispatch({ type: 'ONLINE_COUNT_SET', payload: { count } });
    };

    const onMessagesHistory = ({ channelId, messages }) => {
      dispatch({ type: 'HISTORY_SET', payload: { channelId, messages } });
    };

    const onMessageNew = (message) => {
      dispatch({ type: 'MESSAGE_ADDED', payload: message });
    };

    const onMessageUpdated = ({ channelId, messageId, likes }) => {
      dispatch({
        type: 'MESSAGE_UPDATED',
        payload: { channelId, messageId, likes },
      });
    };

    const onChatError = (err) => {
      setServerError(err.message || 'Server error occurred');
      const timer = setTimeout(() => setServerError(''), 4000);
      return () => clearTimeout(timer);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('channels:list', onChannelsList);
    socket.on('channels:updated', onChannelsUpdated);
    socket.on('presence:count', onPresenceCount);
    socket.on('messages:history', onMessagesHistory);
    socket.on('message:new', onMessageNew);
    socket.on('message:updated', onMessageUpdated);
    socket.on('chat:error', onChatError);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('channels:list', onChannelsList);
      socket.off('channels:updated', onChannelsUpdated);
      socket.off('presence:count', onPresenceCount);
      socket.off('messages:history', onMessagesHistory);
      socket.off('message:new', onMessageNew);
      socket.off('message:updated', onMessageUpdated);
      socket.off('chat:error', onChatError);
      socket.disconnect();
    };
  }, []); // Run once on mount

  // Sync active channel changes with socket room
  useEffect(() => {
    if (socket.connected) {
      socket.emit('channel:join', { channelId: state.activeChannelId });
    }
  }, [state.activeChannelId]);

  // Actions
  const sendMessage = useCallback(
    (rawText) => {
      const parseResult = messageTextSchema.safeParse(rawText);
      if (!parseResult.success) {
        return { ok: false, error: firstError(parseResult) };
      }

      const text = parseResult.data;

      if (socket.connected) {
        // Emit to server
        socket.emit('message:send', {
          channelId: state.activeChannelId,
          text,
        });
      } else {
        // Local offline fallback
        dispatch({
          type: 'MESSAGE_ADDED',
          payload: { text },
        });
      }

      return { ok: true };
    },
    [state.activeChannelId]
  );

  const likeMessage = useCallback(
    (messageId) => {
      if (socket.connected) {
        socket.emit('message:like', {
          channelId: state.activeChannelId,
          messageId,
        });
      } else {
        dispatch({
          type: 'MESSAGE_LIKED',
          payload: {
            channelId: state.activeChannelId,
            messageId,
          },
        });
      }
    },
    [state.activeChannelId]
  );

  const selectChannel = useCallback((channelId) => {
    dispatch({
      type: 'CHANNEL_SELECTED',
      payload: { channelId },
    });
  }, []);

  const addChannel = useCallback(
    (rawName) => {
      const parseResult = channelNameSchema.safeParse(rawName);
      if (!parseResult.success) {
        return { ok: false, error: firstError(parseResult) };
      }

      if (state.channels.length >= MAX_CHANNELS) {
        return {
          ok: false,
          error: `Maximum channel limit (${MAX_CHANNELS}) reached`,
        };
      }

      const name = parseResult.data;
      const id = slugify(name);

      const exists = state.channels.some(
        (c) => c.id === id || c.name.toLowerCase() === name.toLowerCase()
      );

      if (exists) {
        return { ok: false, error: 'Channel already exists' };
      }

      if (socket.connected) {
        return new Promise((resolve) => {
          socket.emit('channel:create', { name }, (ack) => {
            if (ack && ack.ok) {
              dispatch({
                type: 'CHANNEL_SELECTED',
                payload: { channelId: ack.channel.id },
              });
              resolve({ ok: true, channel: ack.channel });
            } else {
              resolve({ ok: false, error: ack?.error || 'Failed to create channel' });
            }
          });
        });
      } else {
        const newChannel = {
          id,
          name,
          description: NEW_CHANNEL_DESCRIPTION,
        };

        dispatch({
          type: 'CHANNEL_ADDED',
          payload: { channel: newChannel },
        });

        return { ok: true, channel: newChannel };
      }
    },
    [state.channels]
  );

  const contextValue = useMemo(
    () => ({
      state,
      activeChannel,
      activeMessages,
      serverError,
      sendMessage,
      likeMessage,
      selectChannel,
      addChannel,
    }),
    [
      state,
      activeChannel,
      activeMessages,
      serverError,
      sendMessage,
      likeMessage,
      selectChannel,
      addChannel,
    ]
  );

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
