import { describe, it, expect } from 'vitest';
import { chatReducer, initialState } from './chatReducer.js';
import { user_list, MAX_CHANNELS } from '../constants/users.js';

describe('chatReducer', () => {
  it('returns initial state when action is unknown', () => {
    const state = chatReducer(initialState, { type: 'UNKNOWN' });
    expect(state).toEqual(initialState);
  });

  describe('MESSAGE_ADDED [CORE]', () => {
    it('appends a message to the active channel with random username, UUID, and 0 likes', () => {
      const state = chatReducer(initialState, {
        type: 'MESSAGE_ADDED',
        payload: { text: 'Hello team!' },
      });

      const messages = state.messagesByChannel[state.activeChannelId];
      expect(messages).toHaveLength(1);

      const msg = messages[0];
      expect(msg.text).toBe('Hello team!');
      expect(msg.channelId).toBe('introductions');
      expect(msg.likes).toBe(0);
      expect(typeof msg.id).toBe('string');
      expect(msg.id).toHaveLength(36); // UUID
      expect(user_list).toContain(msg.username);
      expect(typeof msg.timestamp).toBe('number');
    });

    it('rejects duplicate message IDs to prevent message duplication', () => {
      const existingMsg = {
        id: '11111111-1111-4111-8111-111111111111',
        channelId: 'introductions',
        text: 'Original',
        username: 'Alan',
        timestamp: Date.now(),
        likes: 0,
      };

      const startState = {
        ...initialState,
        messagesByChannel: {
          ...initialState.messagesByChannel,
          introductions: [existingMsg],
        },
      };

      const nextState = chatReducer(startState, {
        type: 'MESSAGE_ADDED',
        payload: existingMsg,
      });

      expect(nextState.messagesByChannel.introductions).toHaveLength(1);
    });
  });

  describe('MESSAGE_LIKED [CORE] A5', () => {
    it('increments likes count by +1 on targeted message in the active channel', () => {
      const msg1 = {
        id: 'msg-1',
        channelId: 'introductions',
        text: 'First',
        username: 'Alan',
        timestamp: 1000,
        likes: 0,
      };
      const msg2 = {
        id: 'msg-2',
        channelId: 'introductions',
        text: 'Second',
        username: 'Bob',
        timestamp: 2000,
        likes: 3,
      };

      const startState = {
        ...initialState,
        messagesByChannel: {
          ...initialState.messagesByChannel,
          introductions: [msg1, msg2],
        },
      };

      const nextState = chatReducer(startState, {
        type: 'MESSAGE_LIKED',
        payload: { channelId: 'introductions', messageId: 'msg-2' },
      });

      const updated = nextState.messagesByChannel.introductions;
      expect(updated[0].likes).toBe(0); // untouched
      expect(updated[1].likes).toBe(4); // incremented from 3 to 4
    });

    it('leaves other channels and state unchanged when liking a message', () => {
      const startState = {
        ...initialState,
        messagesByChannel: {
          ...initialState.messagesByChannel,
          'poland-office': [
            {
              id: 'msg-poland',
              channelId: 'poland-office',
              text: 'Poland update',
              username: 'Carol',
              timestamp: 1000,
              likes: 1,
            },
          ],
        },
      };

      const nextState = chatReducer(startState, {
        type: 'MESSAGE_LIKED',
        payload: { channelId: 'poland-office', messageId: 'msg-poland' },
      });

      expect(nextState.messagesByChannel['poland-office'][0].likes).toBe(2);
      expect(nextState.messagesByChannel.introductions).toEqual([]);
    });

    it('gracefully handles non-existent message ID without altering state', () => {
      const msg = {
        id: 'msg-1',
        channelId: 'introductions',
        text: 'Test',
        username: 'Dean',
        timestamp: 1000,
        likes: 0,
      };

      const startState = {
        ...initialState,
        messagesByChannel: {
          ...initialState.messagesByChannel,
          introductions: [msg],
        },
      };

      const nextState = chatReducer(startState, {
        type: 'MESSAGE_LIKED',
        payload: { channelId: 'introductions', messageId: 'non-existent' },
      });

      expect(nextState.messagesByChannel.introductions[0].likes).toBe(0);
    });
  });

  describe('CHANNEL_SELECTED & CHANNEL_ADDED [SIDEBAR] B1–B3', () => {
    it('CHANNEL_SELECTED updates activeChannelId cleanly', () => {
      const nextState = chatReducer(initialState, {
        type: 'CHANNEL_SELECTED',
        payload: { channelId: 'india-office' },
      });

      expect(nextState.activeChannelId).toBe('india-office');
    });

    it('CHANNEL_ADDED adds a new channel, selects it, and initializes an empty isolated message thread', () => {
      const newChannel = {
        id: 'design-team',
        name: 'Design Team',
        description: 'Channel created by you',
      };

      const nextState = chatReducer(initialState, {
        type: 'CHANNEL_ADDED',
        payload: { channel: newChannel },
      });

      expect(nextState.channels).toHaveLength(initialState.channels.length + 1);
      expect(nextState.channels.find((c) => c.id === 'design-team')).toEqual(newChannel);
      expect(nextState.activeChannelId).toBe('design-team');
      expect(nextState.messagesByChannel['design-team']).toEqual([]);
    });

    it('CHANNEL_ADDED rejects duplicate channel IDs (idempotent state)', () => {
      const existingChannel = initialState.channels[0]; // poland-office

      const nextState = chatReducer(initialState, {
        type: 'CHANNEL_ADDED',
        payload: { channel: existingChannel },
      });

      expect(nextState.channels).toHaveLength(initialState.channels.length);
      expect(nextState).toEqual(initialState);
    });

    it('CHANNEL_ADDED enforces max channels limit (MAX_CHANNELS = 25)', () => {
      // Create a state at max capacity
      const fullChannels = Array.from({ length: MAX_CHANNELS }, (_, i) => ({
        id: `channel-${i}`,
        name: `Channel ${i}`,
        description: 'Auto-generated',
      }));

      const fullState = {
        ...initialState,
        channels: fullChannels,
      };

      const nextState = chatReducer(fullState, {
        type: 'CHANNEL_ADDED',
        payload: {
          channel: {
            id: 'overflow-channel',
            name: 'Overflow Channel',
            description: 'Should be rejected',
          },
        },
      });

      expect(nextState.channels).toHaveLength(MAX_CHANNELS);
      expect(nextState.channels.some((c) => c.id === 'overflow-channel')).toBe(false);
    });
  });
});
