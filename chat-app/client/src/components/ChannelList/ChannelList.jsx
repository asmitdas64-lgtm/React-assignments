import './ChannelList.css';

export default function ChannelList({
  channels = [],
  activeChannelId,
  onSelectChannel,
  onAddClick,
}) {
  return (
    <nav className="channel-nav" aria-label="Conversations">
      <div className="channel-nav__header">
        <span className="channel-nav__title">Conversations</span>
        <button
          type="button"
          className="channel-nav__add-btn"
          onClick={onAddClick}
          aria-label="Add channel"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      <ul className="channel-list">
        {channels.map((channel) => {
          const isActive = channel.id === activeChannelId;
          return (
            <li key={channel.id}>
              <button
                type="button"
                className={`channel-item ${isActive ? 'channel-item--active' : ''}`}
                onClick={() => onSelectChannel?.(channel.id)}
                aria-current={isActive ? 'true' : undefined}
              >
                <span className="channel-item__tile" aria-hidden="true">
                  #
                </span>
                <span className="channel-item__name">{channel.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
