import MessageItem from '../MessageItem/MessageItem.jsx';
import { useAutoScroll } from '../../hooks/useAutoScroll.js';
import './MessageList.css';

export default function MessageList({ messages = [], onLike }) {
  const scrollRef = useAutoScroll(messages);

  return (
    <div className="message-list-scroll" ref={scrollRef}>
      <div
        className="message-list-inner"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.length === 0 ? (
          <p className="message-list__empty">No messages yet. Say hi! 👋</p>
        ) : (
          <ul className="message-list">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} onLike={onLike} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
