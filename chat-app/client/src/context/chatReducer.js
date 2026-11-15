import {
  SEED_CHANNELS,
  DEFAULT_CHANNEL_ID,
  MAX_CHANNELS,
  getRandomUser,
} from '../constants/users.js';

export const initialState = {
  channels: SEED_CHANNELS,
  activeChannelId: DEFAULT_CHANNEL_ID,
  messagesByChannel: {
    'poland-office': [],
    introductions: [],
    'india-office': [],
  },
  connection: 'offline', // 'connecting' | 'connected' | 'offline'
  onlineCount: 1,
};

export function chatReducer(state, action) {
  switch (action.type) {
    case 'CHANNEL_SELECTED':
      return {
        ...state,
        activeChannelId: action.payload.channelId,
      };

    case 'CHANNEL_ADDED': {
      const channel = action.payload.channel;

      // Check max channel capacity and duplicate IDs
      if (
        state.channels.length >= MAX_CHANNELS ||
        state.channels.some((c) => c.id === channel.id)
      ) {
        return state;
      }

      return {
        ...state,
        channels: [...state.channels, channel],
        activeChannelId: channel.id,
        messagesByChannel: {
          ...state.messagesByChannel,
          [channel.id]: [],
        },
      };
    }

    case 'CHANNELS_SET': {
      const channels = action.payload.channels;
      const activeExists = channels.some((c) => c.id === state.activeChannelId);
      return {
        ...state,
        channels,
        activeChannelId: activeExists
          ? state.activeChannelId
          : DEFAULT_CHANNEL_ID,
      };
    }

    case 'MESSAGE_ADDED': {
      const payload = action.payload;
      const channelId = payload.channelId || state.activeChannelId;
      const currentMessages = state.messagesByChannel[channelId] || [];

      // Check deduplication
      if (payload.id && currentMessages.some((m) => m.id === payload.id)) {
        return state;
      }

      const newMessage = {
        id: payload.id || crypto.randomUUID(),
        channelId,
        text: payload.text,
        username: payload.username || getRandomUser(),
        timestamp: payload.timestamp || Date.now(),
        likes: typeof payload.likes === 'number' ? payload.likes : 0,
      };

      return {
        ...state,
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: [...currentMessages, newMessage],
        },
      };
    }

    case 'MESSAGE_LIKED': {
      const { channelId, messageId } = action.payload;
      const targetChannelId = channelId || state.activeChannelId;
      const currentMessages = state.messagesByChannel[targetChannelId];

      if (!currentMessages) return state;

      let changed = false;
      const updatedMessages = currentMessages.map((msg) => {
        if (msg.id === messageId) {
          changed = true;
          return { ...msg, likes: msg.likes + 1 };
        }
        return msg;
      });

      if (!changed) return state;

      return {
        ...state,
        messagesByChannel: {
          ...state.messagesByChannel,
          [targetChannelId]: updatedMessages,
        },
      };
    }

    case 'MESSAGE_UPDATED': {
      const { channelId, messageId, likes } = action.payload;
      const currentMessages = state.messagesByChannel[channelId];
      if (!currentMessages) return state;

      return {
        ...state,
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: currentMessages.map((msg) =>
            msg.id === messageId ? { ...msg, likes } : msg
          ),
        },
      };
    }

    case 'HISTORY_SET': {
      const { channelId, messages } = action.payload;
      return {
        ...state,
        messagesByChannel: {
          ...state.messagesByChannel,
          [channelId]: messages,
        },
      };
    }

    case 'CONNECTION_CHANGED':
      return {
        ...state,
        connection: action.payload.status,
      };

    case 'ONLINE_COUNT_SET':
      return {
        ...state,
        onlineCount: action.payload.count,
      };

    default:
      return state;
  }
}
