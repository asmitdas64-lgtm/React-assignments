import { AVATAR_COLORS } from '../../constants/users.js';
import { formatTime } from '../../utils/formatTime.js';
import { parseMentions } from '../../utils/parseMentions.js';
import Avatar from '../Avatar/Avatar.jsx';
import LikeButton from '../LikeButton/LikeButton.jsx';
import './MessageItem.css';

export default function MessageItem({ message, onLike }) {
  const avatarColor = AVATAR_COLORS[message.username] || 'var(--accent)';
  const parsedNodes = parseMentions(message.text);

  return (
    <li className="message-item">
      <Avatar name={message.username} color={avatarColor} size="md" />
      <div className="message-item__content">
        <div className="message-item__meta">
          <span className="message-item__author">{message.username}</span>
          <time
            className="message-item__time"
            dateTime={new Date(message.timestamp).toISOString()}
          >
            {formatTime(message.timestamp)}
          </time>
        </div>
        <div className="message-item__bubble">
          {parsedNodes.map((node, index) =>
            node.type === 'mention' ? (
              <span key={index} className="mention">
                {node.value}
              </span>
            ) : (
              <span key={index}>{node.value}</span>
            )
          )}
        </div>
      </div>
      <LikeButton
        count={message.likes}
        onLike={() => onLike?.(message.id)}
      />
    </li>
  );
}
