
import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface InputFormProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onAsk, isLoading }) => {
  const [currentQuestion, setCurrentQuestion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuestion.trim() && !isLoading) {
      onAsk(currentQuestion);
      setCurrentQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      <input
        type="text"
        value={currentQuestion}
        onChange={(e) => setCurrentQuestion(e.target.value)}
        placeholder={isLoading ? "Waiting for an answer..." : "Ask a question..."}
        disabled={isLoading}
        className="flex-grow p-4 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-shadow shadow-sm"
      />
      <button
        type="submit"
        disabled={isLoading || !currentQuestion.trim()}
        className="bg-sky-500 hover:bg-sky-600 text-white rounded-full p-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
        aria-label="Send question"
      >
        <SendIcon className="h-6 w-6" />
      </button>
    </form>
  );
};

export default InputForm;
