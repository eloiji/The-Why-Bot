
import React from 'react';
import type { ChatMessage } from '../types';
import { UserIcon, BotIcon } from './Icons';

interface ChatBubbleProps {
  message: ChatMessage;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex items-start space-x-3 p-4 justify-end">
        <div className="bg-blue-500 text-white rounded-2xl rounded-br-none p-4 shadow-md max-w-md">
          <p>{message.text}</p>
        </div>
        <UserIcon className="h-10 w-10 text-blue-500 bg-white rounded-full p-1 flex-shrink-0" />
      </div>
    );
  }

  // Bot message
  return (
    <div className="flex items-start space-x-3 p-4">
      <BotIcon className="h-10 w-10 text-sky-500 flex-shrink-0" />
      <div className="bg-white rounded-2xl rounded-bl-none p-4 shadow-md max-w-md space-y-3">
        <p className="text-gray-800">{message.text}</p>
        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Generated illustration"
            className="rounded-lg w-full aspect-square object-cover border-2 border-sky-200"
          />
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
