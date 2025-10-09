import React from "react";
import { BsClock } from "react-icons/bs";

const ComingSoon: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-800 px-4">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <BsClock className="w-16 h-16 text-blue-500 animate-pulse" />
        </div>
        <h1 className="text-4xl font-bold mb-2">🚀 Coming Soon</h1>
        <p className="text-lg text-gray-600 mb-6">
          We’re working hard to bring something amazing! Stay tuned.
        </p>
       
      </div>
    </div>
  );
};

export default ComingSoon;
