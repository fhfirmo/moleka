
import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col justify-center items-center p-4">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
  </div>
);

export default LoadingSpinner;
