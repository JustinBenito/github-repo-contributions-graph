import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12">
      <div className="relative w-20 h-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="w-full h-full rounded-full border-4 border-[#30363d] opacity-25"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="w-full h-full rounded-full border-4 border-t-[#2ea043] animate-spin"></div>
        </div>
      </div>
      <p className="mt-4 text-[#f0f6fc] text-lg">{message}</p>
    </div>
  );
};

export default Loading;