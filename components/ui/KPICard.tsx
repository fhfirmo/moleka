
import React from 'react';
import { Theme } from '../../types';

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  theme: Theme;
  className?: string;
  valueColorClass?: string; // e.g., "text-emerald-500 dark:text-emerald-400"
}

const KPICard: React.FC<KPICardProps> = ({ title, value, description, icon, theme, className = '', valueColorClass }) => {
  const cardClasses = `
    p-4 sm:p-5 rounded-xl shadow-lg
    ${theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200'}
    ${className}
  `;

  const titleClasses = `
    text-sm font-medium 
    ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
  `;

  const valueClasses = `
    mt-1 text-2xl sm:text-3xl font-semibold
    ${valueColorClass ? valueColorClass : (theme === 'dark' ? 'text-white' : 'text-gray-900')}
  `;

  const descriptionClasses = `
    mt-1 text-xs
    ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}
  `;

  return (
    <div className={cardClasses}>
      <div className="flex items-center justify-between">
        <p className={titleClasses}>{title}</p>
        {icon && <span className={`${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>{icon}</span>}
      </div>
      <p className={valueClasses}>{value}</p>
      {description && <p className={descriptionClasses}>{description}</p>}
    </div>
  );
};

export default KPICard;
