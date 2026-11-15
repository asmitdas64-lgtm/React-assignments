import { useState, useRef, useEffect } from 'react';
import { MAX_CHANNEL_NAME_LENGTH, slugify } from '../../constants/users.js';
import { channelNameSchema, firstError } from '../../validation/schemas.js';
import './AddChannelForm.css';

export default function AddChannelForm({
  existingChannels = [],
  onAddChannel,
  onCancel,
}) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const parseResult = channelNameSchema.safeParse(name);
    if (!parseResult.success) {
      setError(firstError(parseResult));
      return;
    }

    const cleanName = parseResult.data;
    const cleanId = slugify(cleanName);

    // Uniqueness validation (by name and slug)
    const exists = existingChannels.some(
      (ch) =>
        ch.id === cleanId ||
        ch.name.toLowerCase() === cleanName.toLowerCase()
    );

    if (exists) {
      setError('Channel already exists');
      return;
    }

    const res = onAddChannel?.(cleanName);
    if (res && !res.ok) {
      setError(res.error || 'Failed to create channel');
      return;
    }

    setName('');
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  const handleChange = (e) => {
    setName(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <form
      className="add-channel-form"
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      aria-label="Create new channel"
    >
      <div className="add-channel-form__input-wrapper">
        <label htmlFor="new-channel-name-input" className="sr-only">
          New channel name
        </label>
        <input
          id="new-channel-name-input"
          ref={inputRef}
          type="text"
          className={`add-channel-form__input ${error ? 'add-channel-form__input--error' : ''}`}
          placeholder="New channel name"
          value={name}
          onChange={handleChange}
          maxLength={MAX_CHANNEL_NAME_LENGTH}
        />
        <div className="add-channel-form__actions">
          <button
            type="submit"
            className="add-channel-form__btn add-channel-form__btn--submit"
            aria-label="Create channel"
            title="Create channel"
          >
            ✓
          </button>
          <button
            type="button"
            className="add-channel-form__btn add-channel-form__btn--cancel"
            onClick={onCancel}
            aria-label="Cancel"
            title="Cancel"
          >
            ✕
          </button>
        </div>
      </div>
      {error && (
        <div className="add-channel-form__error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
