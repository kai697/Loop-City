import React from 'react';

interface ApiErrorDisplayProps {
  message: string;
  onRetry: () => void;
}

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({ message, onRetry }) => {
  return (
    <div className="text-center bg-red-900/50 p-6 rounded-lg border border-red-700 animate-fade-in">
      <h2 className="text-xl font-bold text-red-300">Oops!</h2>
      <p className="mt-2 text-red-200">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-full transition-colors duration-300"
      >
        Try Again
      </button>
    </div>
  );
};

export default ApiErrorDisplay;
