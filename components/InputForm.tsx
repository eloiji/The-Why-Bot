import React, { useRef, useEffect } from 'react';
import { SendIcon, MicrophoneIcon } from './Icons';

/**
 * Props for the InputForm component.
 *
 * @property onAsk - Callback function invoked when a question is submitted.
 * @property isLoading - Indicates whether a request is currently being processed.
 * @property question - The current value of the question input field.
 * @property setQuestion - Function to update the question input value.
 * @property isRecording - Indicates whether voice recording is active.
 * @property onToggleRecording - Callback to start or stop voice recording.
 * @property isSpeechSupported - Indicates if speech recognition is supported in the current environment.
 */
interface InputFormProps {
  onAsk: (question: string) => void;
  isLoading: boolean;
  question: string;
  setQuestion: (question: string) => void;
  isRecording: boolean;
  onToggleRecording: () => void;
  isSpeechSupported: boolean;
}

/**
 * InputForm component provides a user interface for submitting questions via text input or voice recording.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {(question: string) => void} props.onAsk - Callback invoked when a question is submitted.
 * @param {boolean} props.isLoading - Indicates if the app is currently processing a question.
 * @param {string} props.question - The current value of the question input.
 * @param {(value: string) => void} props.setQuestion - Function to update the question input value.
 * @param {boolean} props.isRecording - Indicates if voice recording is active.
 * @param {() => void} props.onToggleRecording - Callback to start or stop voice recording.
 * @param {boolean} props.isSpeechSupported - Indicates if speech recognition is supported in the browser.
 *
 * @returns {JSX.Element} The rendered input form with text and optional voice input controls.
 */
const InputForm: React.FC<InputFormProps> = ({ 
  onAsk, 
  isLoading, 
  question, 
  setQuestion, 
  isRecording, 
  onToggleRecording, 
  isSpeechSupported 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onAsk(question);
      setQuestion('');
    }
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset height to recalculate
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [question]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex items-center gap-2 bg-white rounded-full p-3 border-2 border-gray-300 focus-within:ring-2 focus-within:ring-sky-400 focus-within:border-transparent transition-shadow shadow-lg">
        {isSpeechSupported && (
          <button
            type="button"
            onClick={onToggleRecording}
            disabled={isLoading}
            className={`flex-shrink-0 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 disabled:text-gray-400 disabled:cursor-not-allowed ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-sky-600'}`}
            aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
          >
            <MicrophoneIcon className="h-7 w-7" />
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
              }
          }}
          placeholder={isLoading ? "Waiting for an answer..." : isRecording ? "Listening..." : "Ask a question..."}
          disabled={isLoading || isRecording}
          rows={1}
          className="flex-grow w-full bg-transparent text-lg py-1 border-none outline-none focus:ring-0 resize-none disabled:bg-transparent placeholder-gray-500 text-gray-800"
          style={{ maxHeight: '150px' }}
        />
        <button
          type="submit"
          disabled={isLoading || !question.trim() || isRecording}
          className="flex-shrink-0 bg-sky-500 hover:bg-sky-600 text-white rounded-full p-3 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-sky-300"
          aria-label="Send question"
        >
          <SendIcon className="h-6 w-6" />
        </button>
      </div>
    </form>
  );
};

export default InputForm;