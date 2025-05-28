
import React from 'react';
import { Theme } from '../types';

// Existing Icons
const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const SunIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

type ActiveDashboard = 'main' | 'secondary';

interface DashboardHeaderProps {
  onExport: () => void;
  theme: Theme;
  toggleTheme: () => void;
  activeDashboard: ActiveDashboard;
  setActiveDashboard: (dashboard: ActiveDashboard) => void;
  className?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  onExport, 
  theme, 
  toggleTheme, 
  activeDashboard,
  setActiveDashboard,
  className 
}) => {
  const baseClasses = "flex flex-col sm:flex-row justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4";
  
  const navButtonBaseClass = "px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-opacity-50 whitespace-nowrap";
  const navButtonActiveClass = theme === 'dark' ? "bg-blue-600 text-white focus:ring-blue-500" : "bg-blue-500 text-white focus:ring-blue-400";
  const navButtonInactiveClass = theme === 'dark'
      ? "text-gray-300 hover:bg-gray-600 focus:ring-gray-500"
      : "text-gray-600 hover:bg-gray-300 focus:ring-gray-400";

  return (
    <div className={`${className} ${baseClasses}`}>
      <h1 className="text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-500 dark:from-blue-400 dark:to-emerald-400 mb-2 sm:mb-0">
        Painel de Vendas
      </h1>
      
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Navigation Buttons Group */}
        <div className={`flex items-center p-0.5 rounded-lg ${theme === 'dark' ? 'bg-gray-750 border border-gray-700' : 'bg-gray-200 border border-gray-300'}`}>
          <button
            onClick={() => setActiveDashboard('main')}
            className={`${navButtonBaseClass} ${activeDashboard === 'main' ? navButtonActiveClass : navButtonInactiveClass}`}
            aria-pressed={activeDashboard === 'main'}
          >
            Painel Principal
          </button>
          <button
            onClick={() => setActiveDashboard('secondary')}
            className={`${navButtonBaseClass} ${activeDashboard === 'secondary' ? navButtonActiveClass : navButtonInactiveClass}`}
            aria-pressed={activeDashboard === 'secondary'}
          >
            Painel Secundário
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 
                      ${theme === 'dark' 
                        ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 focus:ring-yellow-400 focus:ring-offset-gray-900' 
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 focus:ring-offset-gray-100'
                      } transition-colors duration-300`}
          aria-label={theme === 'dark' ? "Mudar para tema claro" : "Mudar para tema escuro"}
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>

        {/* Export Button */}
        <button
          onClick={onExport}
          className="flex items-center bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out text-xs sm:text-sm"
        >
          <DownloadIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          Exportar (CSV)
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
