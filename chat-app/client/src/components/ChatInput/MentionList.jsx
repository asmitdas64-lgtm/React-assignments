import { AVATAR_COLORS } from '../../constants/users.js';
import Avatar from '../Avatar/Avatar.jsx';
import './MentionList.css';

export default function MentionList({
  matches = [],
  activeIndex = 0,
  onSelectMention,
}) {
  return (
    <div
      className="mention-list-popover"
      role="listbox"
      aria-label="User mentions"
    >
      {matches.length === 0 ? (
        <div className="mention-list__empty">No matching users</div>
      ) : (
        matches.map((username, index) => {
          const isSelected = index === activeIndex;
          const color = AVATAR_COLORS[username] || 'var(--accent)';

          return (
            <button
              key={username}
              type="button"
              role="option"
              aria-selected={isSelected ? 'true' : 'false'}
              className={`mention-item ${isSelected ? 'mention-item--active' : ''}`}
              onClick={() => onSelectMention(username)}
            >
              <Avatar name={username} color={color} size="sm" />
              <span className="mention-item__name">@{username}</span>
            </button>
          );
        })
      )}
    </div>
  );
}
