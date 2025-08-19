import React from 'react';
import type { ChatMessage } from '../types';
import { UserIcon, BotIcon, PlayIcon } from './Icons';

interface ChatBubbleProps {
  message: ChatMessage;
  onReplayAudio: (text: string) => void;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onReplayAudio }) => {
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
        <div className="flex items-start justify-between gap-2">
            <p className="text-gray-800">{message.text}</p>
             <button
              onClick={() => onReplayAudio(message.text)}
              className="flex-shrink-0 text-sky-500 hover:text-sky-700 transition-colors p-1 -mt-1 -mr-1 rounded-full hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400"
              aria-label="Replay audio for this message"
            >
              <PlayIcon className="h-6 w-6" />
            </button>
        </div>
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