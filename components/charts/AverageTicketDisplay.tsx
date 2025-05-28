
import React from 'react';
import { SaleItem, Theme } from '../../types';
import { calculateAverageTicket } from '../../utils/chartUtils';

interface AverageTicketDisplayProps {
  data: SaleItem[];
  theme: Theme;
  className?: string; // Added for positioning (e.g. mt-6)
}

const DollarSignIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


const AverageTicketDisplay: React.FC<AverageTicketDisplayProps> = ({ data, theme, className = '' }) => {
  const averageTicket = calculateAverageTicket(data);

  // Panel styling is now handled by the parent sticky div in DashboardLayout
  // This component just provides its content.
  // const panelBgClasses = theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200';
  const titleColorClass = theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
  const valueColorClass = theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600';
  const textColorClass = theme === 'dark' ? 'text-gray-400' : 'text-gray-600';
  const subTextColorClass = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';


  return (
    // Removed panelBgClasses, p-4, rounded-xl, shadow-2xl from here. mt-6 is passed via className.
    <div className={className}> 
      <h3 className={`text-lg font-semibold ${titleColorClass} mb-2 flex items-center`}>
        <DollarSignIcon className={`h-6 w-6 mr-2 ${valueColorClass}`}/>
        Ticket Médio por Venda
      </h3>
      {data.length > 0 ? (
        <p className={`text-3xl font-bold ${valueColorClass}`}>
          R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      ) : (
        <p className={`${textColorClass} text-lg`}>N/A</p>
      )}
      <p className={`text-xs ${subTextColorClass} mt-1`}>Baseado nos filtros atuais ({data.length} vendas).</p>
    </div>
  );
};

export default AverageTicketDisplay;
