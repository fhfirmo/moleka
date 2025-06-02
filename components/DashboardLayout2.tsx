
import React, { useMemo } from 'react';
import { Filters, SaleItem, ExpenseItem, Theme, MonthKey } from '../types.ts'; 
import FilterPanel from './FilterPanel.tsx';
import PurchaseDataOverTimeChart from './charts/PurchaseDataOverTimeChart.tsx'; 
import ProfitOverTimeChart from './charts/ProfitOverTimeChart.tsx'; // New import
import TopItemsChart from './charts/TopItemsChart.tsx';
// import DistributionPieChart from './charts/DistributionPieChart.tsx'; // No longer used here
import AverageTicketDisplay from './charts/AverageTicketDisplay.tsx';
import ChartCard from './ChartCard.tsx';
import KPICard from './ui/KPICard.tsx';
import { 
  calculateTotalRevenue, 
  calculateTotalPurchaseCost, 
  calculateTotalItemsPurchased,
  getTopPurchasedProductByQuantity,
} from '../utils/kpiUtils.ts'; 
import { getBrazilianSeason } from '../utils/dateUtils.ts';

// Ícones para KPIs
const DollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" />
  </svg>
);

const ArrowDownCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( 
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);


interface DashboardLayout2Props { 
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
  filteredData: SaleItem[]; // This is filteredSalesData
  allSalesData: SaleItem[];
  allExpenseData: ExpenseItem[]; 
  uniqueClientTypes: string[];
  uniqueProductNames: string[]; 
  uniqueFlavors: string[]; 
  uniqueYears: string[]; // Added
  theme: Theme;
  headerHeight: number;
}

const DashboardLayout2: React.FC<DashboardLayout2Props> = ({ 
  filters,
  setFilters,
  resetFilters,
  filteredData, // This is filteredSalesData
  allSalesData,
  allExpenseData, 
  uniqueClientTypes,
  uniqueProductNames,
  uniqueFlavors,
  uniqueYears, // Added
  theme,
  headerHeight,
}) => {
  const totalRevenueFiltered = calculateTotalRevenue(filteredData);
  
  const filteredExpenseData = useMemo(() => {
    if (!allExpenseData || allExpenseData.length === 0) return [];

    return allExpenseData.filter(item => {
      const expenseDate = item.purchaseDate; 

      const startDateFilter = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      
      let endDateFilterExclusive = null;
      if (filters.endDate) {
          const tempEndDate = new Date(filters.endDate + 'T00:00:00');
          tempEndDate.setDate(tempEndDate.getDate() + 1);
          endDateFilterExclusive = tempEndDate;
      }
      
      if (startDateFilter && expenseDate < startDateFilter) return false;
      if (endDateFilterExclusive && expenseDate >= endDateFilterExclusive) return false;
      
      if (filters.seasons.length > 0) {
        const itemSeason = getBrazilianSeason(expenseDate);
        if (!filters.seasons.includes(itemSeason)) return false;
      }

      if (filters.months.length > 0) {
        const itemMonthKey = expenseDate.getMonth().toString() as MonthKey;
        if (!filters.months.includes(itemMonthKey)) return false;
      }
      
      if (filters.years.length > 0) {
        const itemYear = expenseDate.getFullYear().toString();
        if (!filters.years.includes(itemYear)) return false;
      }
      
      return true;
    });
  }, [allExpenseData, filters]);
  
  const totalPurchaseCostFiltered = calculateTotalPurchaseCost(filteredExpenseData);
  const totalItemsPurchasedFiltered = calculateTotalItemsPurchased(filteredExpenseData);
  const topProductByQtyFiltered = getTopPurchasedProductByQuantity(filteredExpenseData, 1)[0];

  const STICKY_TOP_OFFSET_PX = headerHeight + 24; 
  const STICKY_TOP_CLASS = `top-[${STICKY_TOP_OFFSET_PX}px]`;
  const SIDEBAR_HEIGHT_CLASS = `h-[calc(100vh-${STICKY_TOP_OFFSET_PX}px-24px)]`; 

  const sidebarBgClasses = theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200';
  const kpiStickyBgClasses = theme === 'dark' ? 'dark:bg-gray-900' : 'bg-gray-100';
  
  return (
    <div className="flex gap-6 h-full">
      <aside className={`lg:w-[320px] xl:w-[360px] flex-shrink-0 hidden lg:block`}>
        <div
          className={`
            ${STICKY_TOP_CLASS} sticky z-30 ${SIDEBAR_HEIGHT_CLASS} overflow-y-auto 
            ${sidebarBgClasses} rounded-xl shadow-2xl p-4 sm:p-6
            scrollbar-thin 
            ${theme === 'dark' ? 'dark-scrollbar' : 'light-scrollbar'}
          `}
        >
          <FilterPanel 
            theme={theme}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            uniqueClientTypes={uniqueClientTypes}
            uniqueProductNames={uniqueProductNames}
            uniqueFlavors={uniqueFlavors}
            uniqueYears={uniqueYears} // Added
            allSalesData={allSalesData}
          />
          <AverageTicketDisplay data={filteredData} theme={theme} className="mt-6" />
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <section
          className={`
            ${STICKY_TOP_CLASS} sticky z-20 
            ${kpiStickyBgClasses}
            pt-0 pb-6
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6
          `}
        >
          <KPICard
            theme={theme}
            title="Receita Total (Filtrada)"
            value={`R$ ${totalRevenueFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarIcon />}
            description={`${filteredData.length} vendas consideradas`}
            valueColorClass={theme === 'dark' ? "text-emerald-400" : "text-emerald-600"}
          />

          <KPICard
            theme={theme}
            title="Custo Compras (Filtrado)"
            value={`R$ ${totalPurchaseCostFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<ArrowDownCircleIcon />}
            description={`${filteredExpenseData.length} itens de compra filtrados`}
            valueColorClass={theme === 'dark' ? "text-orange-400" : "text-orange-600"}
          />
          
          <KPICard
            theme={theme}
            title="Itens Comprados (Filtrado)"
            value={`${totalItemsPurchasedFiltered.toLocaleString('pt-BR')} un`}
            icon={<ShoppingCartIcon />}
            description="Soma das quantidades compradas (filtrado)"
            valueColorClass={theme === 'dark' ? "text-sky-400" : "text-sky-600"}
          />

          <KPICard
            theme={theme}
            title="Prod. Mais Comprado (Filtrado)"
            value={topProductByQtyFiltered ? `${topProductByQtyFiltered.name}` : '-'}
            icon={<CubeIcon />}
            description={topProductByQtyFiltered ? `${topProductByQtyFiltered.value.toLocaleString('pt-BR')} un compradas (filtrado)` : "Nenhum produto (filtrado)"}
            valueColorClass={theme === 'dark' ? "text-violet-400" : "text-violet-600"}
          />
        </section>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0">
          <ChartCard title="Análise de Lucratividade (Receita vs. Despesa)" className="md:col-span-2" theme={theme}>
            <ProfitOverTimeChart 
              salesData={filteredData} 
              expenseData={filteredExpenseData} 
              theme={theme} 
            />
          </ChartCard>

          <ChartCard title="Histórico de Compras (Custo e Quantidade)" className="md:col-span-2" theme={theme}>
            <PurchaseDataOverTimeChart purchaseData={filteredExpenseData} theme={theme} />
          </ChartCard>

          <ChartCard title="Top 5 Produtos Comprados (por Custo Total)" theme={theme}>
            <TopItemsChart 
              data={filteredExpenseData.filter(item => item.productName)} 
              itemKey="productName" 
              metricKey="finalPurchaseValue" 
              topN={5} 
              theme={theme}
              valuePrefix="R$ "
              metricNameLabel="Custo Total"
            />
          </ChartCard>

          <ChartCard title="Top 5 Produtos Comprados (por Quantidade)" theme={theme}>
            <TopItemsChart 
              data={filteredExpenseData.filter(item => item.productName)}
              itemKey="productName" 
              metricKey="quantity" 
              topN={5} 
              theme={theme}
              valueSuffix=" un"
              metricNameLabel="Quantidade Comprada"
            />
          </ChartCard>
          
        </main>
      </div>
       <aside className="lg:hidden mt-6">
          <div className={`${sidebarBgClasses} rounded-xl shadow-2xl p-4 sm:p-6`}>
            <FilterPanel
                theme={theme}
                filters={filters}
                setFilters={setFilters}
                resetFilters={resetFilters}
                uniqueClientTypes={uniqueClientTypes}
                uniqueProductNames={uniqueProductNames}
                uniqueFlavors={uniqueFlavors}
                uniqueYears={uniqueYears} // Added
                allSalesData={allSalesData}
            />
            <AverageTicketDisplay data={filteredData} theme={theme} className="mt-6" />
          </div>
       </aside>
    </div>
  );
};

export default DashboardLayout2;