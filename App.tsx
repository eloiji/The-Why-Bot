
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from './types';
import { fetchAnswerAndImage } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import InputForm from './components/InputForm';
import Spinner from './components/Spinner';
import { BotIcon, SparklesIcon } from './components/Icons';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);

  const handleAsk = async (question: string) => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: 'user',
      text: question,
    };
    setChatHistory(prev => [...prev, userMessage]);

    try {
      const { answer, imageUrl } = await fetchAnswerAndImage(question, chatHistory);
      const botMessage: ChatMessage = {
        id: Date.now() + 1,
        role: 'bot',
        text: answer,
        imageUrl: imageUrl,
      };
      setChatHistory(prev => [...prev, botMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Oops! Something went wrong. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWhy = () => {
    handleAsk("Why?");
  };
  
  const handleStartOver = () => {
    setChatHistory([]);
    setError(null);
  };
  
  const canAskWhy = chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'bot' && !isLoading;

  return (
    <div className="bg-sky-100 min-h-screen flex flex-col font-sans">
      <header className="bg-white shadow-md w-full p-4 flex items-center justify-center sticky top-0 z-10">
        <BotIcon className="h-8 w-8 text-sky-500 mr-3" />
        <h1 className="text-3xl font-bold text-gray-700">The Why Bot</h1>
      </header>

      <main className="flex-grow flex flex-col p-4 md:p-6 lg:p-8">
        <div className="flex-grow w-full max-w-3xl mx-auto overflow-y-auto pr-2">
          {chatHistory.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-10">
              <p className="text-xl">Hello! I'm the Why Bot.</p>
              <p>Ask me anything, and I'll explain it for a 5-year-old!</p>
            </div>
          )}

          {chatHistory.map(message => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex items-center space-x-3 p-4">
              <BotIcon className="h-10 w-10 text-sky-500 flex-shrink-0" />
              <div className="bg-white rounded-2xl p-4 shadow-md flex items-center justify-center">
                 <Spinner />
                 <span className="ml-3 text-gray-600 animate-pulse">Thinking of a simple answer...</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative my-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        
        <div className="w-full max-w-3xl mx-auto pt-4 flex flex-col sm:flex-row items-center gap-3">
          {canAskWhy && (
              <button
                onClick={handleWhy}
                className="w-full sm:w-auto flex-shrink-0 bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                Why?
              </button>
          )}
          {chatHistory.length > 0 && (
             <button
                onClick={handleStartOver}
                disabled={isLoading}
                className="w-full sm:w-auto flex-shrink-0 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50"
             >
                Start Over
             </button>
          )}
        </div>
        
        <div className="sticky bottom-0 w-full max-w-3xl mx-auto bg-sky-100 pt-4 pb-2">
           <InputForm onAsk={handleAsk} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
};

export default App;
