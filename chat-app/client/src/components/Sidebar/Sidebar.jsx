import { useState } from 'react';
import ProfileCard from '../ProfileCard/ProfileCard.jsx';
import ChannelList from '../ChannelList/ChannelList.jsx';
import AddChannelForm from './AddChannelForm.jsx';
import './Sidebar.css';

export default function Sidebar({
  channels = [],
  activeChannelId,
  onSelectChannel,
  onAddChannel,
  connection,
  isOpen = false,
}) {
  const [isAddingChannel, setIsAddingChannel] = useState(false);

  const handleAddChannel = (name) => {
    const res = onAddChannel?.(name);
    if (res && res.ok) {
      setIsAddingChannel(false);
    }
    return res;
  };

  return (
    <aside
      className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}
      aria-label="Sidebar"
    >
      <ProfileCard connection={connection} />

      {isAddingChannel && (
        <AddChannelForm
          existingChannels={channels}
          onAddChannel={handleAddChannel}
          onCancel={() => setIsAddingChannel(false)}
        />
      )}

      <ChannelList
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={onSelectChannel}
        onAddClick={() => setIsAddingChannel((prev) => !prev)}
      />
    </aside>
  );
}
