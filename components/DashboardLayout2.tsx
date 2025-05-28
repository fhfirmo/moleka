import React from 'react';
import { Filters, SaleItem, ExpenseItem, Theme } from '../types'; 
import FilterPanel from './FilterPanel';
// import SalesOverTimeChart from './charts/SalesOverTimeChart'; // Replaced
import PurchaseDataOverTimeChart from './charts/PurchaseDataOverTimeChart'; // New
import TopItemsChart from './charts/TopItemsChart';
// import SalesByDayOfWeekChart from './charts/SalesByDayOfWeekChart'; // To be replaced or repurposed if needed
// import MarginByItemChart from './charts/MarginByItemChart'; // To be replaced or repurposed
import DistributionPieChart from './charts/DistributionPieChart'; // Renamed from ClientTypeDistributionChart
import AverageTicketDisplay from './charts/AverageTicketDisplay';
import ChartCard from './ChartCard';
import KPICard from './ui/KPICard';
import { 
  calculateTotalRevenue, 
  calculateRevenueByClientType, 
  calculateTotalPurchaseCost, // Renamed
  calculateTotalItemsPurchased,
  getTopPurchasedProductByQuantity,
} from '../utils/kpiUtils'; 

// Ícones para KPIs
const DollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" />
  </svg>
);

const ArrowDownCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // For Expenses/Costs
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ShoppingCartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // For Total Items Purchased
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // For Top Product
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);


interface DashboardLayout2Props { 
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
  filteredData: SaleItem[]; // This is filteredSalesData for "Receita Total" KPI
  allSalesData: SaleItem[];
  allExpenseData: ExpenseItem[]; // This is now detailed purchase data
  uniqueClientTypes: string[];
  uniqueProductNames: string[]; // From sales data, for filter panel
  uniqueFlavors: string[]; // From sales data, for filter panel
  theme: Theme;
  headerHeight: number;
}

const DashboardLayout2: React.FC<DashboardLayout2Props> = ({ 
  filters,
  setFilters,
  resetFilters,
  filteredData, 
  allSalesData,
  allExpenseData, 
  uniqueClientTypes,
  uniqueProductNames,
  uniqueFlavors,
  theme,
  headerHeight,
}) => {
  // Sales-based KPIs
  const totalRevenueFiltered = calculateTotalRevenue(filteredData);
  
  // Purchase-based KPIs
  const totalPurchaseCost = calculateTotalPurchaseCost(allExpenseData);
  const totalItemsPurchased = calculateTotalItemsPurchased(allExpenseData);
  const topProductByQty = getTopPurchasedProductByQuantity(allExpenseData, 1)[0];

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
          <FilterPanel // Filter panel still operates on sales data context for now
            theme={theme}
            filters={filters}
            setFilters={setFilters}
            resetFilters={resetFilters}
            uniqueClientTypes={uniqueClientTypes}
            uniqueProductNames={uniqueProductNames}
            uniqueFlavors={uniqueFlavors}
            allSalesData={allSalesData}
          />
          {/* Average Ticket might be less relevant here, or we could have an Average Purchase Value */}
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
          {/* KPI Card 1: Total Revenue (Filtered Sales) - As per user request to keep this */}
          <KPICard
            theme={theme}
            title="Receita Total (Filtrada)"
            value={`R$ ${totalRevenueFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarIcon />}
            description={`${filteredData.length} vendas consideradas`}
            valueColorClass={theme === 'dark' ? "text-emerald-400" : "text-emerald-600"}
          />

          {/* KPI Card 2: Total Purchase Cost */}
          <KPICard
            theme={theme}
            title="Custo Total de Compras"
            value={`R$ ${totalPurchaseCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<ArrowDownCircleIcon />}
            description={`${allExpenseData.length} itens de compra`}
            valueColorClass={theme === 'dark' ? "text-orange-400" : "text-orange-600"}
          />
          
          {/* KPI Card 3: Total Items Purchased */}
          <KPICard
            theme={theme}
            title="Total Itens Comprados"
            value={`${totalItemsPurchased.toLocaleString('pt-BR')} un`}
            icon={<ShoppingCartIcon />}
            description="Soma das quantidades compradas"
            valueColorClass={theme === 'dark' ? "text-sky-400" : "text-sky-600"}
          />

          {/* KPI Card 4: Top Product Purchased by Quantity */}
          <KPICard
            theme={theme}
            title="Produto Mais Comprado (Qtd)"
            value={topProductByQty ? `${topProductByQty.name}` : '-'}
            icon={<CubeIcon />}
            description={topProductByQty ? `${topProductByQty.value.toLocaleString('pt-BR')} un compradas` : "Nenhum produto comprado"}
            valueColorClass={theme === 'dark' ? "text-violet-400" : "text-violet-600"}
          />
        </section>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0">
          <ChartCard title="Histórico de Compras (Custo e Quantidade)" className="md:col-span-2" theme={theme}>
            <PurchaseDataOverTimeChart purchaseData={allExpenseData} theme={theme} />
          </ChartCard>

          <ChartCard title="Top 5 Produtos Comprados (por Custo Total)" theme={theme}>
            <TopItemsChart 
              data={allExpenseData.filter(item => item.productName)} // Ensure we only pass items with product names
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
              data={allExpenseData.filter(item => item.productName)}
              itemKey="productName" 
              metricKey="quantity" 
              topN={5} 
              theme={theme}
              valueSuffix=" un"
              metricNameLabel="Quantidade Comprada"
            />
          </ChartCard>
          
          <ChartCard title="Distribuição de Compras por Fornecedor (Nota)" theme={theme}>
            <DistributionPieChart
              data={allExpenseData.filter(item => item.nota)} // Ensure 'nota' exists
              groupKey="nota"
              metricKey="finalPurchaseValue"
              theme={theme}
              chartTitle="Compras por Fornecedor"
              valuePrefix="R$ "
            />
          </ChartCard>

           {/* Placeholder for another chart if needed */}
          <ChartCard title="Análise Adicional de Compras" theme={theme}>
             <div className={`flex items-center justify-center h-full ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                Em breve mais análises de compras...
             </div>
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
                allSalesData={allSalesData}
            />
            <AverageTicketDisplay data={filteredData} theme={theme} className="mt-6" />
          </div>
       </aside>
    </div>
  );
};

export default DashboardLayout2;