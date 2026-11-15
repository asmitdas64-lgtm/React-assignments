import { user_list } from '../../constants/users.js';
import './ChatHeader.css';

export default function ChatHeader({
  channel,
  onlineCount = 1,
  onOpenSidebar,
  isSidebarOpen = false,
}) {
  const memberCount = user_list.length;

  return (
    <header className="chat-header">
      <div className="chat-header__left">
        <button
          type="button"
          className="chat-header__menu-btn"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
          aria-expanded={isSidebarOpen ? 'true' : 'false'}
          aria-controls="app-sidebar"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="chat-header__info">
          <h1 className="chat-header__title">{channel?.name || 'Chat'}</h1>
          {channel?.description && (
            <p className="chat-header__subtitle">{channel.description}</p>
          )}
        </div>
      </div>

      <div
        className="chat-header__presence"
        aria-label={`${onlineCount} online of ${memberCount} members`}
      >
        <span>{`${onlineCount} | ${memberCount}`}</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="8" r="4" />
          <path d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
          <path d="M16 4a4 4 0 0 1 0 8" />
          <path d="M19 14.5a6 6 0 0 1 3 5.5v1" />
        </svg>
      </div>
    </header>
  );
}
