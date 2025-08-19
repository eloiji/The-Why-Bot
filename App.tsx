import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from './types';
import { fetchAnswerAndImage } from './services/geminiService';
import ChatBubble from './components/ChatBubble';
import InputForm from './components/InputForm';
import Spinner from './components/Spinner';
import { BotIcon } from './components/Icons';

// Add type definitions for Web Speech API to fix TypeScript errors.
// These interfaces describe the shape of the API for browsers that support it.
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}

// Browser compatibility check for Web Speech API
// Renamed to SpeechRecognitionAPI to avoid conflict with the SpeechRecognition interface type
const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  // recognitionRef now correctly uses the SpeechRecognition interface type
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const questionRef = useRef(currentQuestion);

  useEffect(() => {
    questionRef.current = currentQuestion;
  }, [currentQuestion]);


  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isLoading]);
  
  const speakText = (text: string) => {
    if (!text) return;
    window.speechSynthesis.cancel(); // Cancel any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    // Simple heuristic for a child-friendly voice
    const voices = window.speechSynthesis.getVoices();
    const friendlyVoice = voices.find(voice => voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Google') || voice.name.includes('Zoe')));
    if (friendlyVoice) {
      utterance.voice = friendlyVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  };

  // Effect for Text-to-Speech (Audio Output)
  useEffect(() => {
    const lastMessage = chatHistory[chatHistory.length - 1];
    if (lastMessage && lastMessage.role === 'bot' && lastMessage.text) {
      speakText(lastMessage.text);
    }
  }, [chatHistory]);


  const handleAsk = async (question: string) => {
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setCurrentQuestion('');
    
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
  
  const handleToggleRecording = () => {
    if (!isSpeechRecognitionSupported) {
      alert("Sorry, your browser doesn't support voice input.");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      // Use the renamed constant to create a new instance
      recognitionRef.current = new SpeechRecognitionAPI();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsRecording(true);
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => (result as SpeechRecognitionResult)[0])
          .map(result => result.transcript)
          .join('');
        setCurrentQuestion(transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
        if (questionRef.current.trim()) {
            handleAsk(questionRef.current.trim());
        }
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.start();
    }
  };
  
  const handleWhy = () => {
    handleAsk("Why?");
  };
  
  const handleStartOver = () => {
    window.speechSynthesis.cancel();
    setChatHistory([]);
    setError(null);
  };
  
  const handleReplayAudio = (text: string) => {
    speakText(text);
  };

  const canAskWhy = chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === 'bot' && !isLoading;

  return (
    <div className="bg-sky-100 min-h-screen flex flex-col font-sans">
      <header className="bg-white shadow-md w-full p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
            <BotIcon className="h-8 w-8 text-sky-500 mr-3" />
            <h1 className="text-3xl font-bold text-gray-700">The Why Bot</h1>
        </div>
      </header>

      <main className="flex-grow flex flex-col p-4 md:p-6 lg:p-8">
        <div className="flex-grow w-full max-w-3xl mx-auto overflow-y-auto pr-2">
          {chatHistory.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 mt-10">
              <p className="p-4 text-xl">Hello! I'm the Why Bot.</p>
              <p className="p-4">When your child's "why" questions catch you off guard, it's okay to hit pause. </p> 
              <p className="p-4">Just pop their question in here, and we'll help you find a simple, brilliant answer to share with them.</p>
              <p className="p-4"><em>Remember to always evaluate the AI's response for accuracy.</em></p>
            </div>
          )}

          {chatHistory.map(message => (
            <ChatBubble key={message.id} message={message} onReplayAudio={handleReplayAudio} />
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
           <InputForm
             onAsk={handleAsk}
             isLoading={isLoading}
             question={currentQuestion}
             setQuestion={setCurrentQuestion}
             isRecording={isRecording}
             onToggleRecording={handleToggleRecording}
             isSpeechSupported={isSpeechRecognitionSupported}
           />
        </div>
      </main>
    </div>
  );
};

export default App;