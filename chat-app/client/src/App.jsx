import { ChatProvider, useChat } from './context/ChatContext.jsx';
import AppLayout from './components/AppLayout/AppLayout.jsx';

function ChatAppContent() {
  const {
    state,
    activeChannel,
    activeMessages,
    sendMessage,
    likeMessage,
    selectChannel,
    addChannel,
  } = useChat();

  return (
    <AppLayout
      channels={state.channels}
      activeChannelId={activeChannel?.id}
      messages={activeMessages}
      onlineCount={state.onlineCount}
      connection={state.connection}
      onSelectChannel={selectChannel}
      onAddChannel={addChannel}
      onSendMessage={sendMessage}
      onLikeMessage={likeMessage}
    />
  );
}

export default function App() {
  return (
    <ChatProvider>
      <ChatAppContent />
    </ChatProvider>
  );
}
