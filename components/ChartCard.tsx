
import React from 'react';
import { Theme } from '../types';

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  theme: Theme;
}

const ChartCard: React.FC<ChartCardProps> = ({ title, children, className = '', isLoading = false, theme }) => {
  const cardBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200';
  const titleColorClass = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const spinnerHTMLClass = theme === 'dark' ? 'border-blue-500' : 'border-blue-600';
  const spinnerBgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';

  return (
    <div className={`${cardBgClass} p-4 sm:p-6 rounded-xl shadow-2xl flex flex-col ${className}`}>
      <h3 className={`text-lg sm:text-xl font-semibold ${titleColorClass} mb-4`}>{title}</h3>
      <div className="flex-grow h-72 sm:h-80 md:h-96 relative">
        {isLoading ? (
          <div className={`absolute inset-0 flex items-center justify-center ${spinnerBgClass} bg-opacity-50`}>
            <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${spinnerHTMLClass}`}></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

export default ChartCard;
