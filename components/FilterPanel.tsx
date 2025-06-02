
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { Filters, SaleItem, Theme, Season, ALL_SEASONS, MonthKey, ALL_MONTHS } from '../types.ts';

type FilterSectionName = 'estacao' | 'mes' | 'ano' | 'tipoCliente' | 'produto' | 'sabor';

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  resetFilters: () => void;
  uniqueClientTypes: string[];
  uniqueProductNames: string[];
  uniqueFlavors: string[];
  uniqueYears: string[]; // Added
  allSalesData: SaleItem[]; 
  theme: Theme;
}

// Icons
const FilterIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
    </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.288.257m-11.054 0c.084.016.168.033.253.05M4.772 5.79l-.045-.381c-.083-.707.146-1.408.598-1.963a2.25 2.25 0 012.244-1.077H16.25a2.25 2.25 0 012.244 1.077c.451.555.682 1.256.597 1.963l-.045.381m0 0A48.097 48.097 0 0112 5.25c-2.206 0-4.33-.162-6.347-.473M12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 15.75h.008v.008H12v-.008zm0-2.25h.008v.008H12v-.008zm3.75 2.25h.008v.008H15.75v-.008zm0-2.25h.008v.008H15.75v-.008zm-7.5 2.25h.008v.008H8.25v-.008zm0-2.25h.008v.008H8.25v-.008z" />
  </svg>
);

const LeafIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M5.382 3.272a.75.75 0 01.474.998l-2.006 6.518a.75.75 0 01-1.47-.454L4.384 3.754a.75.75 0 01.998-.482zM13.94 1.19a.75.75 0 01.416 1.016l-2.89 8.983a.75.75 0 01-1.434-.46l2.89-8.983a.75.75 0 011.018-.556zM8.57 2.39A.75.75 0 019.5 2.08l5.166 2.214a.75.75 0 01-.416 1.382L8.738 3.462a.75.75 0 01-.168-1.072zM16.25 7.75a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM6.25 10.75a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3.25 15.75a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM8.75 17.75a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM13.25 14.75a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
    </svg>
);

const ClientIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 8a2 2 0 11-4 0 2 2 0 014 0zM1.49 15.326C1.477 14.031 2.482 13 3.774 13h5.452c1.292 0 2.297 1.031 2.284 2.326A8.003 8.003 0 0110 16c-1.32 0-2.555-.34-3.635-.935Q6.944 16 8 17c-2.273 0-3.893-1.08-4.51-2.674zM16 8a2 2 0 11-4 0 2 2 0 014 0zm-3.49 5.326c-.013 1.295.992 2.326 2.284 2.326h.002a8.003 8.003 0 011.706-.935C17.056 16 16 17 13.727 17c-1.627 0-3.247-1.08-3.862-2.674A4.523 4.523 0 0112.51 13h.002c1.292 0 2.297 1.031 2.284 2.326z" />
    </svg>
);
const ProductIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M6.672 1.902A.75.75 0 006.25 2.5v1.5H5.25a.75.75 0 000 1.5h.002v.002a3.002 3.002 0 005.494 2.004h.508a3.002 3.002 0 005.494-2.004V5.5h.002a.75.75 0 000-1.5H15.5v-1.5a.75.75 0 00-1.172-.648L13.5 2.19l-.828-.736A.75.75 0 0011.5 2.19l-.828.736-1.144-1.016zM4.5 7.5A.75.75 0 005.25 8h9.5a.75.75 0 000-1.5h-9.5A.75.75 0 004.5 7.5zm0 3A.75.75 0 005.25 11h9.5a.75.75 0 000-1.5h-9.5A.75.75 0 004.5 10.5zm.75 2.25a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);
const FlavorIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path d="M5.25 12.232C6.114 11.493 7.26 11 8.5 11s2.386.493 3.25 1.232L12 11.75l-.75.482C10.386 12.97 9.24 13.46 8 13.46A4.462 4.462 0 014.502 11c.811-.652 1.888-1 3.004-1a3.014 3.014 0 012.03 4.787l.117.134-.476.306A1.959 1.959 0 008.5 16a1.958 1.958 0 00-1.673-1.002L10.5 5.5l-5.25 6.732z" />
        <path d="M12.25 12.232C13.114 11.493 14.26 11 15.5 11s2.386.493 3.25 1.232L19 11.75l-.75.482C17.386 12.97 16.24 13.46 15 13.46a4.462 4.462 0 01-3.498-2.46c.811-.652 1.888-1 3.004-1a3.014 3.014 0 012.03 4.787l.117.134-.476.306A1.959 1.959 0 0015.5 16a1.958 1.958 0 00-1.673-1.002L17.5 5.5l-5.25 6.732z" />
    </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);


const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  setFilters,
  resetFilters,
  uniqueClientTypes,
  uniqueProductNames,
  uniqueFlavors,
  uniqueYears,
  theme,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [openSections, setOpenSections] = useState<Record<FilterSectionName, boolean>>({
    estacao: false,
    mes: false,
    ano: false,
    tipoCliente: false,
    produto: true, // Open by default IF showAdvanced is true
    sabor: false,
  });

  const toggleSection = (sectionName: FilterSectionName) => {
    setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMultiSelectChange = (
    field: 'clientTypes' | 'productNames' | 'flavors' | 'years',
    value: string
  ) => {
    setFilters(prev => {
      const currentValues = prev[field] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [field]: newValues };
    });
  };

  const handleSeasonChange = (season: Season) => {
    setFilters(prev => {
      const currentSeasons = prev.seasons;
      const newSeasons = currentSeasons.includes(season)
        ? currentSeasons.filter(s => s !== season)
        : [...currentSeasons, season];
      return { ...prev, seasons: newSeasons };
    });
  };

  const handleMonthChange = (monthKey: MonthKey) => {
    setFilters(prev => {
      const currentMonths = prev.months;
      const newMonths = currentMonths.includes(monthKey)
        ? currentMonths.filter(m => m !== monthKey)
        : [...currentMonths, monthKey];
      return { ...prev, months: newMonths };
    });
  };
  
  const baseInputClasses = "w-full p-2 rounded-md focus:ring-2 focus:border-blue-500 outline-none";
  const darkInputClasses = "bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 placeholder-gray-400";
  const lightInputClasses = "bg-white border-gray-300 text-gray-900 focus:ring-blue-500 placeholder-gray-500";
  const commonInputClasses = `${baseInputClasses} ${theme === 'dark' ? darkInputClasses : lightInputClasses}`;

  const baseCheckboxClasses = "form-checkbox h-5 w-5 text-blue-500 rounded focus:ring-blue-500 transition duration-150 ease-in-out";
  const darkCheckboxClasses = "bg-gray-700 border-gray-600 focus:ring-offset-gray-800";
  const lightCheckboxClasses = "bg-gray-100 border-gray-300 focus:ring-offset-white";
  const commonCheckboxClasses = `${baseCheckboxClasses} ${theme === 'dark' ? darkCheckboxClasses : lightCheckboxClasses}`;
  
  const commonLabelClasses = `ml-2 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`;
  const subLabelTextClasses = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';
  
  const hoverBgClasses = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50';
  const sectionGridClasses = "grid grid-cols-2 gap-x-3 gap-y-1.5"; // For seasons, months, years, products, flavors
  const scrollableListClasses = `max-h-32 overflow-y-auto pr-2 rounded scrollbar-thin ${theme === 'dark' ? 'dark-scrollbar' : 'light-scrollbar'}`;
  const scrollableMonthYearListClasses = `max-h-40 overflow-y-auto pr-2 rounded scrollbar-thin ${theme === 'dark' ? 'dark-scrollbar' : 'light-scrollbar'}`;


  const AccordionItem: React.FC<{
    title: string;
    sectionKey: FilterSectionName;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }> = ({ title, sectionKey, icon: SectionIcon, children }) => {
    const isOpen = openSections[sectionKey];
    const headerHoverBg = theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-100';
    const legendTextClasses = theme === 'dark' ? 'text-gray-200' : 'text-gray-700';

    return (
      <div>
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className={`w-full flex items-center justify-between py-2 px-1 text-left font-medium ${legendTextClasses} ${headerHoverBg} rounded-md transition-colors duration-150`}
          aria-expanded={isOpen}
          aria-controls={`section-content-${sectionKey}`}
        >
          <span className="flex items-center">
            <span className={`mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{SectionIcon}</span>
            {title}
          </span>
          {isOpen ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
        </button>
        {isOpen && (
          <div id={`section-content-${sectionKey}`} className="pt-2 pb-1 pl-1 pr-1">
            {children}
          </div>
        )}
      </div>
    );
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold text-blue-500 dark:text-blue-400 flex items-center">
          <FilterIcon className="h-6 w-6 mr-2 text-blue-500 dark:text-blue-400" />
          Filtros
        </h3>
        <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`text-sm ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
        >
            {showAdvanced ? 'Menos Opções' : 'Mais Opções'}
        </button>
      </div>

      <form onSubmit={(e: FormEvent) => e.preventDefault()} className="space-y-3">
          {/* Date Filters - Always Visible */}
          <fieldset className="border-t pt-3 mt-3 first:border-t-0 first:mt-0 first:pt-0">
            <legend className={`text-md font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} mb-2 flex items-center`}>
              <CalendarDaysIcon className={`h-5 w-5 mr-1.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}/>
              Período
            </legend>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="startDate" className={`block text-xs font-medium ${subLabelTextClasses} mb-0.5`}>De:</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={filters.startDate || ''}
                  onChange={handleDateChange}
                  className={commonInputClasses + " text-sm"}
                  style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                />
              </div>
              <div>
                <label htmlFor="endDate" className={`block text-xs font-medium ${subLabelTextClasses} mb-0.5`}>Até:</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={filters.endDate || ''}
                  onChange={handleDateChange}
                  className={commonInputClasses + " text-sm"}
                  style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
                />
              </div>
            </div>
          </fieldset>

          <AccordionItem title="Estação do Ano" sectionKey="estacao" icon={<LeafIcon className="h-5 w-5"/>}>
            <div className={`${sectionGridClasses} ${scrollableListClasses}`}>
              {ALL_SEASONS.map(season => (
                <label key={season} className={`flex items-center cursor-pointer ${hoverBgClasses} p-1 rounded`}>
                  <input type="checkbox" className={commonCheckboxClasses} checked={filters.seasons.includes(season)} onChange={() => handleSeasonChange(season)} aria-label={season}/>
                  <span className={commonLabelClasses}>{season}</span>
                </label>
              ))}
            </div>
          </AccordionItem>

          <AccordionItem title="Mês do Ano" sectionKey="mes" icon={<CalendarDaysIcon className="h-5 w-5"/>}>
            <div className={`${sectionGridClasses} ${scrollableMonthYearListClasses}`}>
              {ALL_MONTHS.map(month => (
                <label key={month.key} className={`flex items-center cursor-pointer ${hoverBgClasses} p-1 rounded`}>
                  <input type="checkbox" className={commonCheckboxClasses} checked={filters.months.includes(month.key)} onChange={() => handleMonthChange(month.key)} aria-label={month.name}/>
                  <span className={commonLabelClasses}>{month.name}</span>
                </label>
              ))}
            </div>
          </AccordionItem>
          
          <AccordionItem title="Ano" sectionKey="ano" icon={<CalendarDaysIcon className="h-5 w-5"/>}>
            <div className={`${sectionGridClasses} ${scrollableMonthYearListClasses}`}>
              {uniqueYears.map(year => (
                <label key={year} className={`flex items-center cursor-pointer ${hoverBgClasses} p-1 rounded`}>
                  <input type="checkbox" className={commonCheckboxClasses} checked={filters.years.includes(year)} onChange={() => handleMultiSelectChange('years', year)} aria-label={year}/>
                  <span className={commonLabelClasses}>{year}</span>
                </label>
              ))}
            </div>
          </AccordionItem>

          <AccordionItem title="Tipo de Cliente" sectionKey="tipoCliente" icon={<ClientIcon className="h-5 w-5"/>}>
            <div className={`${scrollableListClasses} space-y-1.5`}>
              {uniqueClientTypes.map(type => (
                <label key={type} className={`flex items-center cursor-pointer ${hoverBgClasses} p-1 rounded`}>
                  <input type="checkbox" className={commonCheckboxClasses} checked={filters.clientTypes.includes(type)} onChange={() => handleMultiSelectChange('clientTypes', type)}/>
                  <span className={commonLabelClasses}>{type}</span>
                </label>
              ))}
            </div>
          </AccordionItem>

          {showAdvanced && (
            <>
              {/* Produto - always open if showAdvanced is true */}
              <div className="border-t pt-3 mt-3">
                 <button
                    type="button"
                    onClick={() => toggleSection('produto')}
                    className={`w-full flex items-center justify-between py-2 px-1 text-left font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} ${theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-100'} rounded-md transition-colors duration-150`}
                    aria-expanded={openSections['produto']}
                 >
                    <span className="flex items-center">
                        <ProductIcon className={`h-5 w-5 mr-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}/>
                        Produto
                    </span>
                    {openSections['produto'] ? <ChevronDownIcon className="h-5 w-5" /> : <ChevronRightIcon className="h-5 w-5" />}
                </button>
                {openSections['produto'] && (
                    <div className={`pt-2 pb-1 pl-1 pr-1 ${sectionGridClasses} ${scrollableListClasses} max-h-40`}>
                      {uniqueProductNames.map(name => (
                        <label key={name} className={`flex items-center cursor-pointer ${hoverBgClasses} p-1 rounded`}>
                          <input type="checkbox" className={commonCheckboxClasses} checked={filters.productNames.includes(name)} onChange={() => handleMultiSelectChange('productNames', name)}/>
                          <span className={commonLabelClasses}>{name}</span>
                        </label>
                      ))}
                    </div>
                )}
              </div>

              <AccordionItem title="Sabor" sectionKey="sabor" icon={<FlavorIcon className="h-5 w-5"/>}>
                <div className={`${sectionGridClasses} ${scrollableListClasses} max-h-40`}>
                  {uniqueFlavors.map(flavor => (
                    <label key={flavor} className={`flex items-center cursor-pointer ${hoverBgClasses} p-1 rounded`}>
                      <input type="checkbox" className={commonCheckboxClasses} checked={filters.flavors.includes(flavor)} onChange={() => handleMultiSelectChange('flavors', flavor)}/>
                      <span className={commonLabelClasses}>{flavor}</span>
                    </label>
                  ))}
                </div>
              </AccordionItem>
            </>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="w-full mt-4 flex items-center justify-center text-sm bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out"
          >
            <TrashIcon className="h-4 w-4 mr-2"/>
            Limpar Filtros
          </button>
        
      </form>
    </div>
  );
};

export default FilterPanel;
