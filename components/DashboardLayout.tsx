
import React from 'react';
import { Filters, SaleItem, Theme } from '../types';
import FilterPanel from './FilterPanel';
import SalesOverTimeChart from './charts/SalesOverTimeChart';
import TopItemsChart from './charts/TopItemsChart';
import SalesByDayOfWeekChart from './charts/SalesByDayOfWeekChart';
import MarginByItemChart from './charts/MarginByItemChart';
import ClientTypeDistributionChart from './charts/ClientTypeDistributionChart.tsx'; // This is actually DistributionPieChart
import AverageTicketDisplay from './charts/AverageTicketDisplay';
import ChartCard from './ChartCard';
import KPICard from './ui/KPICard';
import { calculateTotalRevenue, calculateRevenueByClientType } from '../utils/kpiUtils';

// Ícones para KPIs
const DollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0Z" />
  </svg>
);
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Fallback/General Client Icon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

// Specific Client Type Icons (similar to ClientTypeDistributionChart but w-6 h-6)
const StoreIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Varejo
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5A2.25 2.25 0 0011.25 11.25H6.75A2.25 2.25 0 004.5 13.5V21M6.75 21H21M21 21v-7.5A2.25 2.25 0 0018.75 11.25h-2.25m-10.5 0V4.875c0-.621.504-1.125 1.125-1.125h10.5c.621 0 1.125.504 1.125 1.125v6.375m-10.5 0h10.5" />
  </svg>
);

const PackageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Atacado
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10.5 11.25h3M10.5 15h3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125V5.25c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.125c0 .621.504 1.125 1.125 1.125z" />
  </svg>
);

const TruckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // Delivery/Ifood
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.139S14.48 4.25 14.25 4.25H8.25V18.75m0-10.5h6.75v6.75H8.25v-6.75z" />
  </svg>
);


interface DashboardLayoutProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
  filteredData: SaleItem[];
  allSalesData: SaleItem[];
  uniqueClientTypes: string[];
  uniqueProductNames: string[];
  uniqueFlavors: string[];
  theme: Theme;
  headerHeight: number; // Passed from App.tsx
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  filters,
  setFilters,
  resetFilters,
  filteredData,
  allSalesData,
  uniqueClientTypes,
  uniqueProductNames,
  uniqueFlavors,
  theme,
  headerHeight,
}) => {
  const totalRevenue = calculateTotalRevenue(filteredData);
  const revenueByClient = calculateRevenueByClientType(filteredData, 2); // Gets top 2 + Others

  const STICKY_TOP_OFFSET_PX = headerHeight + 24; 
  const STICKY_TOP_CLASS = `top-[${STICKY_TOP_OFFSET_PX}px]`;
  const SIDEBAR_HEIGHT_CLASS = `h-[calc(100vh-${STICKY_TOP_OFFSET_PX}px-24px)]`; 

  const sidebarBgClasses = theme === 'dark' ? 'bg-gray-800' : 'bg-white border border-gray-200';
  const kpiStickyBgClasses = theme === 'dark' ? 'dark:bg-gray-900' : 'bg-gray-100';

  return (
    <div className="flex gap-6 h-full"> {/* Main flex container for sidebar and content */}
      {/* Sidebar: Sticky Filter Panel + Average Ticket */}
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
            allSalesData={allSalesData}
          />
          <AverageTicketDisplay data={filteredData} theme={theme} className="mt-6" />
        </div>
      </aside>

      {/* Main scrollable content area: KPIs + Charts */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* KPI Cards Section: Sticky at the top of this scrollable area */}
        <section
          className={`
            ${STICKY_TOP_CLASS} sticky z-20 
            ${kpiStickyBgClasses} /* Match App.tsx content area BG */
            pt-0 pb-6 /* Add padding to create space when sticky, pb-6 was mb-6 */
            grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6
          `}
        >
          <KPICard
            theme={theme}
            title="Receita Total"
            value={`R$ ${totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={<DollarIcon />}
            description={`${filteredData.length} vendas filtradas`}
            valueColorClass={theme === 'dark' ? "text-emerald-400" : "text-emerald-600"}
          />
          {revenueByClient.map((client) => {
            let clientIcon: React.ReactNode = <UsersIcon />; // Default icon
            const clientNameLower = client.name.toLowerCase();

            if (clientNameLower.includes('atacado')) {
              clientIcon = <PackageIcon />;
            } else if (clientNameLower.includes('ifood') || clientNameLower.includes('delivery')) {
              clientIcon = <TruckIcon />;
            } else if (clientNameLower.includes('varejo')) {
              clientIcon = <StoreIcon />;
            }
            
            return (
              <KPICard
                key={client.name}
                theme={theme}
                title={`Receita: ${client.name}`}
                value={`R$ ${client.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={clientIcon}
                description={client.name !== "Outros" ? `Tipo: ${client.name}` : "Demais Clientes"}
                valueColorClass={theme === 'dark' ? "text-blue-400" : "text-blue-600"}
              />
            );
          })}
          {/* Placeholder KPIs if less than 3 client types are shown */}
          {Array.from({ length: Math.max(0, 3 - revenueByClient.length) }).map((_, i) => (
            <KPICard
              key={`placeholder-${i}`}
              theme={theme}
              title="Aguardando Dados"
              value="-"
              description="Mais métricas em breve"
            />
          ))}
        </section>

        {/* Charts Grid: Scrolls below sticky KPIs */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-0"> {/* mt-0 because KPI section now has pb-6 */}
          <ChartCard title="Vendas ao Longo do Tempo" className="md:col-span-2" theme={theme}>
            <SalesOverTimeChart data={filteredData} theme={theme} />
          </ChartCard>

          <ChartCard title="Top 5 Produtos (por Receita)" theme={theme}>
            <TopItemsChart data={filteredData} itemKey="productName" metricKey="grossValue" topN={5} theme={theme} metricNameLabel="Receita" valuePrefix="R$ " />
          </ChartCard>

          <ChartCard title="Top 5 Sabores (por Quantidade)" theme={theme}>
            <TopItemsChart data={filteredData} itemKey="flavor" metricKey="quantity" topN={5} theme={theme} metricNameLabel="Quantidade" valueSuffix=" un" />
          </ChartCard>
          
          <ChartCard title="Vendas por Dia da Semana (Receita)" theme={theme}>
            <SalesByDayOfWeekChart data={filteredData} metric="grossValue" theme={theme} />
          </ChartCard>

          <ChartCard title="Distribuição por Tipo de Cliente (Receita)" theme={theme}>
            <ClientTypeDistributionChart 
              data={filteredData} 
              groupKey="clientType" 
              metricKey="grossValue" 
              theme={theme} 
              chartTitle="Tipo de Cliente"
              valuePrefix="R$ "
            />
          </ChartCard>

          <ChartCard title="Top 10 Produtos (por Margem Líquida)" className="md:col-span-2" theme={theme}>
            <MarginByItemChart data={filteredData} itemKey="productName" topN={10} theme={theme} />
          </ChartCard>
        </main>
      </div>
       {/* Fallback for mobile/small screens: FilterPanel */}
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

export default DashboardLayout;