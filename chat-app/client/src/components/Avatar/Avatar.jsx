import { getInitials } from '../../constants/users.js';
import './Avatar.css';

export default function Avatar({ name, color, size = 'md' }) {
  return (
    <div
      className={`avatar avatar--${size}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
