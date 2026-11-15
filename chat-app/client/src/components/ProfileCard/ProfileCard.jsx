import { CURRENT_USER } from '../../constants/users.js';
import Avatar from '../Avatar/Avatar.jsx';
import './ProfileCard.css';

const STATUS_LABELS = {
  connected: 'Connected',
  connecting: 'Connecting',
  offline: 'Offline (local mode)',
};

export default function ProfileCard({ connection = 'offline' }) {
  const statusLabel = STATUS_LABELS[connection] || STATUS_LABELS.offline;

  return (
    <div className="profile-card">
      <div className="profile-card__avatar-wrap">
        <Avatar
          name={CURRENT_USER.name}
          color={CURRENT_USER.color}
          size="lg"
        />
        <span
          className={`profile-card__status profile-card__status--${connection}`}
          title={statusLabel}
          aria-label={statusLabel}
        />
      </div>
      <div className="profile-card__info">
        <div className="profile-card__name">{CURRENT_USER.name}</div>
        <div className="profile-card__role">{CURRENT_USER.role}</div>
      </div>
    </div>
  );
}
