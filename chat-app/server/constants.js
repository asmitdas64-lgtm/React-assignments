// Shared constants (Server Copy)
export const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"];

export const AVATAR_COLORS = {
  Alan: "#E0474C",
  Bob: "#D4DD5A",
  Carol: "#F08A8A",
  Dean: "#7FB8E8",
  Elin: "#B39DDB",
};

export const CURRENT_USER = {
  name: "User",
  role: "Member",
  color: "#F08A8A",
};

export const SEED_CHANNELS = [
  {
    id: "poland-office",
    name: "Poland Office",
    description: "Updates And Chatter From The Poland Team",
  },
  {
    id: "introductions",
    name: "Introductions",
    description: "This Channel Is For Company Wide Chatter",
  },
  {
    id: "india-office",
    name: "India Office",
    description: "Updates And Chatter From The India Team",
  },
];

export const DEFAULT_CHANNEL_ID = "introductions";
export const NEW_CHANNEL_DESCRIPTION = "Channel created by you";

export const MAX_MESSAGE_LENGTH = 500;
export const MAX_CHANNEL_NAME_LENGTH = 30;
export const MESSAGE_COUNTER_THRESHOLD = 450;

export const MAX_CHANNELS = 25;
export const MAX_MESSAGES_PER_CHANNEL = 200;
export const MAX_PAYLOAD_BYTES = 10_000;

export const RATE_LIMITS = {
  "message:send": { max: 5, windowMs: 5_000 },
  "message:like": { max: 20, windowMs: 10_000 },
  "channel:create": { max: 3, windowMs: 60_000 },
  "channel:join": { max: 20, windowMs: 10_000 },
};

export const getRandomUser = () =>
  user_list[Math.floor(Math.random() * user_list.length)];

export const getInitials = (name) => {
  const words = name.trim().split(/\s+/);
  const initials =
    words.length > 1 ? words[0][0] + words[1][0] : words[0].slice(0, 2);
  return initials.toUpperCase();
};

export const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
