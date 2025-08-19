
import React from 'react';
import { SendIcon, MicrophoneIcon } from './Icons';

interface InputFormProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
  question: string;
  setQuestion: (question: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isSpeechSupported: boolean;
}

const InputForm: React.FC<InputFormProps> = ({ onAsk, isLoading, question, setQuestion, isRecording, onToggleRecording, isSpeechSupported }) => {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onAsk(question);
      setQuestion('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3">
      {isSpeechSupported && (
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={isLoading}
            className={`flex-shrink-0 p-4 rounded-full text-white transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-red-300' : 'bg-sky-500 hover:bg-sky-600'}`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            <MicrophoneIcon className="h-6 w-6" />
          </button>
      )}
      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder={isLoading ? "Waiting for an answer..." : isRecording ? "Listening..." : "Ask a question..."}
        disabled={isLoading || isRecording}
        className="flex-grow p-4 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent transition-shadow shadow-sm disabled:bg-gray-100"
      />
      <button
        type="submit"
        disabled={isLoading || !question.trim() || isRecording}
        className="bg-sky-500 hover:bg-sky-600 text-white rounded-full p-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-300 shadow-lg"
        aria-label="Send question"
      >
        <SendIcon className="h-6 w-6" />
      </button>
    </form>
  );
};

export default InputForm;