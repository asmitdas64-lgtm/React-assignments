import { useState, useEffect } from 'react';
import Sidebar from '../Sidebar/Sidebar.jsx';
import ChatHeader from '../ChatHeader/ChatHeader.jsx';
import MessageList from '../MessageList/MessageList.jsx';
import ChatInput from '../ChatInput/ChatInput.jsx';
import './AppLayout.css';

export default function AppLayout({
  channels = [],
  activeChannelId,
  messages = [],
  onlineCount = 1,
  connection = 'offline',
  onSelectChannel,
  onAddChannel,
  onSendMessage,
  onLikeMessage,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeChannel =
    channels.find((ch) => ch.id === activeChannelId) || channels[0];

  const handleSelectChannel = (id) => {
    onSelectChannel?.(id);
    setIsSidebarOpen(false);
  };

  // Keyboard navigation: Escape key closes mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <div
          className="app-layout__backdrop"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar
        channels={channels}
        activeChannelId={activeChannel?.id}
        onSelectChannel={handleSelectChannel}
        onAddChannel={onAddChannel}
        connection={connection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="chat-panel">
        <ChatHeader
          channel={activeChannel}
          onlineCount={onlineCount}
          onOpenSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarOpen={isSidebarOpen}
        />
        <MessageList messages={messages} onLike={onLikeMessage} />
        <ChatInput
          channelName={activeChannel?.name}
          onSend={onSendMessage}
        />
      </main>
    </div>
  );
}
