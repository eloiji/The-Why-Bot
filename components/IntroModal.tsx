import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon, BotIcon } from './Icons';

interface IntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const introSlides = [
  { text: "Hey there! I'm the Why Bot. 👋", className: "font-bold text-purple-600" },
  { text: "When your child's \'why\' questions catch you off guard, it's totally okay to hit pause. ⏸️", className: "text-blue-600" },
  { text: "Just pop their question in here, and I'll help you find a simple answer to share with them.", className: "text-green-600" },
  { text: "A little heads-up: I'm not always perfect. 😅 ", className: "text-orange-600 font-semibold" },
  { text: "Remember to always give my response a quick check for accuracy.", className: "text-red-600 font-semibold" },
  { text: "Think of it as a great opportunity to teach your little one about critical thinking! 🧠", className: "text-pink-600 font-semibold" },
  { text: "Ready to start? Type your question below and let's get the conversation rolling! 👇", className: "text-teal-600 font-semibold" }
];

const IntroModal: React.FC<IntroModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRoot = document.getElementById('modal-root');

  useEffect(() => {
    // Reset to the first slide when the modal is opened
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen || !modalRoot) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, introSlides.length - 1));
  };

  const handlePrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  };
  
  const isLastSlide = currentIndex === introSlides.length - 1;

  return ReactDOM.createPortal(
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-auto relative transform transition-all animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close introduction"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <div className="text-center pt-8 pb-4">
            <BotIcon className="h-16 w-16 text-sky-400 mx-auto mb-4" />
            <div className="h-32 flex items-center justify-center px-4">
                 <p className={`text-lg transition-opacity duration-300 ${introSlides[currentIndex].className}`}>
                    {introSlides[currentIndex].text}
                 </p>
            </div>
        </div>
        
        <div className="flex justify-center items-center space-x-2 my-4">
            {introSlides.map((_, index) => (
                <button 
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-3 w-3 rounded-full transition-all ${currentIndex === index ? 'bg-sky-500 w-6' : 'bg-gray-300 hover:bg-gray-400'}`}
                    aria-label={`Go to slide ${index + 1}`}
                />
            ))}
        </div>

        <div className="flex items-center justify-between mt-6">
            <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Prev
            </button>
            {isLastSlide ? (
                 <button
                    onClick={onClose}
                    className="px-6 py-2 bg-sky-500 text-white font-bold rounded-lg hover:bg-sky-600 transition-transform transform hover:scale-105"
                >
                    Got it!
                </button>
            ) : (
                <button
                    onClick={handleNext}
                    disabled={isLastSlide}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                >
                    Next
                </button>
            )}
        </div>

        <style>{`
          @keyframes fade-in-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.3s ease-out forwards;
          }
        `}</style>

      </div>
    </div>,
    modalRoot
  );
};

export default IntroModal;
