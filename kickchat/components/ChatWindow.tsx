
import React from 'react';

interface ChatWindowProps {
  username: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ username }) => {
  const chatUrl = `https://kick.com/popout/${username}/chat`;

  return (
    <div className="flex flex-col h-full bg-[#000000]">
      <div className="flex-1 w-full relative">
        <iframe
          src={chatUrl}
          className="absolute inset-0 w-full h-full border-none"
          title={`${username} Chat`}
          sandbox="allow-scripts allow-same-origin allow-popups"
        ></iframe>
      </div>
    </div>
  );
};

export default ChatWindow;
