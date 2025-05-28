
import React, { useState, useEffect } from 'react';
import DashboardLayout from './components/DashboardLayout';
import DashboardLayout2 from './components/DashboardLayout2'; 
import { useDashboardData } from './hooks/useDashboardData'; // Updated import
import LoadingSpinner from './components/ui/LoadingSpinner';
import { exportToCSV } from './utils/exportUtils';
import DashboardHeader from './components/DashboardHeader';
import { Theme } from './types';

const HEADER_HEIGHT_PX = 76; 

type ActiveDashboard = 'main' | 'secondary';

const App: React.FC = () => {
  const {
    isLoading,
    error,
    filters,
    setFilters,
    filteredSalesData,
    allExpenseData, // Get expense data
    uniqueClientTypes,
    uniqueProductNames,
    uniqueFlavors,
    resetFilters,
    allSalesData,
  } = useDashboardData(); // Updated hook call

  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('dashboardTheme') as Theme | null;
    return savedTheme || 'dark'; 
  });

  const [activeDashboard, setActiveDashboard] = useState<ActiveDashboard>('main');

  useEffect(() => {
    const rootHtml = document.documentElement;
    if (theme === 'light') {
      rootHtml.classList.remove('dark');
      rootHtml.classList.add('light');
      document.body.classList.remove('bg-gray-900', 'text-gray-100');
      document.body.classList.add('bg-gray-100', 'text-gray-900');
    } else {
      rootHtml.classList.remove('light');
      rootHtml.classList.add('dark');
      document.body.classList.remove('bg-gray-100', 'text-gray-900');
      document.body.classList.add('bg-gray-900', 'text-gray-100');
    }
    localStorage.setItem('dashboardTheme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleExport = () => {
    if (filteredSalesData.length === 0) {
      alert("Não há dados filtrados para exportar.");
      return;
    }
    exportToCSV(filteredSalesData, 'relatorio_vendas_filtrado.csv');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <LoadingSpinner />
        <p className={`text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-4`}>Carregando Painel de Vendas...</p>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-1`}>Analisando dados do arquivo Excel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} p-8 text-center`}>
        <h2 className="text-2xl text-red-500 font-semibold mb-4">Erro ao Carregar Dados</h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>Não foi possível carregar os dados do arquivo Excel.</p>
        <p className={`text-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Detalhes: {error}</p>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          Por favor, verifique se o arquivo <code className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} px-1 rounded`}>/Dados/dados_moleka_2022.xlsx</code> está acessível e formatado corretamente.
        </p>
      </div>
    );
  }
  
  if (!allSalesData || allSalesData.length === 0 && !isLoading) {
     return (
      <div className={`min-h-screen flex flex-col justify-center items-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} p-8 text-center`}>
        <h2 className="text-2xl text-amber-500 font-semibold mb-4">Nenhum Dado de Venda Encontrado</h2>
        <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
          O arquivo Excel foi carregado, mas nenhum dado de venda foi encontrado ou processado.
        </p>
         <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
          Verifique o conteúdo da aba de receitas no arquivo <code className={`${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} px-1 rounded`}>/Dados/dados_moleka_2022.xlsx</code>.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <DashboardHeader 
        onExport={handleExport} 
        theme={theme} 
        toggleTheme={toggleTheme}
        activeDashboard={activeDashboard}
        setActiveDashboard={setActiveDashboard}
        className={`sticky top-0 z-50 h-[${HEADER_HEIGHT_PX}px] flex-shrink-0 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}
      />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {activeDashboard === 'main' ? (
          <DashboardLayout
            theme={theme}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            filteredData={filteredSalesData}
            allSalesData={allSalesData}
            uniqueClientTypes={uniqueClientTypes}
            uniqueProductNames={uniqueProductNames}
            uniqueFlavors={uniqueFlavors}
            headerHeight={HEADER_HEIGHT_PX}
          />
        ) : (
          <DashboardLayout2
            theme={theme}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            filteredData={filteredSalesData} // Corrected prop name here
            allSalesData={allSalesData}
            allExpenseData={allExpenseData} 
            uniqueClientTypes={uniqueClientTypes}
            uniqueProductNames={uniqueProductNames}
            uniqueFlavors={uniqueFlavors}
            headerHeight={HEADER_HEIGHT_PX}
          />
        )}
      </div>
    </div>
  );
};

export default App;
