
import { useState, useEffect, useMemo, useCallback } from 'react';
import { SaleItem, ExpenseItem, Filters, Season, MonthKey } from '../types.ts';
import { loadDashboardDataFromExcel } from '../utils/excelUtils.ts'; 
import { getBrazilianSeason } from '../utils/dateUtils.ts'; 

const INITIAL_FILTER_STATE: Filters = {
  clientTypes: [],
  productNames: [],
  flavors: [],
  seasons: [],
  months: [], 
  years: [], // Added for year filter
  startDate: undefined,
  endDate: undefined,
};

const EXCEL_FILE_PATH = '/Dados/dados_moleka_2022.xlsx';

export const useDashboardData = () => { 
  const [allSalesData, setAllSalesData] = useState<SaleItem[]>([]);
  const [allExpenseData, setAllExpenseData] = useState<ExpenseItem[]>([]); 
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTER_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Tentando carregar dados de: ${EXCEL_FILE_PATH}`);
        const { salesData, expenseData } = await loadDashboardDataFromExcel(EXCEL_FILE_PATH); 
        
        console.log(`Dados de vendas carregados: ${salesData.length} itens.`);
        console.log(`Dados de despesas carregados: ${expenseData.length} itens.`);

        const sortedSalesData = salesData.sort((a,b) => a.saleDate.getTime() - b.saleDate.getTime());
        setAllSalesData(sortedSalesData);
        
        const sortedExpenseData = expenseData.sort((a,b) => a.purchaseDate.getTime() - b.purchaseDate.getTime());
        setAllExpenseData(sortedExpenseData);

      } catch (err) {
        console.error("Erro ao carregar ou processar o arquivo Excel:", err);
        setError(err instanceof Error ? err.message : String(err));
        setAllSalesData([]); 
        setAllExpenseData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const uniqueClientTypes = useMemo(() => {
    if (isLoading || error) return [];
    const types = new Set(allSalesData.map(item => item.clientType).filter(Boolean)); 
    return Array.from(types).sort();
  }, [allSalesData, isLoading, error]);

  const uniqueProductNames = useMemo(() => {
    if (isLoading || error) return [];
    const names = new Set(allSalesData.map(item => item.productName).filter(Boolean));
    return Array.from(names).sort();
  }, [allSalesData, isLoading, error]);

  const uniqueFlavors = useMemo(() => {
    if (isLoading || error) return [];
    const flavorsSet = new Set(allSalesData.map(item => item.flavor).filter(Boolean));
    return Array.from(flavorsSet).sort();
  }, [allSalesData, isLoading, error]);

  const uniqueYears = useMemo(() => {
    if (isLoading || error) return [];
    const yearsSet = new Set(allSalesData.map(item => item.saleDate.getFullYear().toString()).filter(Boolean));
    // Consider adding years from expenseData if filters apply to both dashboards with the same year filter
    // allExpenseData.forEach(item => yearsSet.add(item.purchaseDate.getFullYear().toString()));
    return Array.from(yearsSet).sort((a,b) => parseInt(b) - parseInt(a)); // Sort descending
  }, [allSalesData, isLoading, error]);

  const filteredSalesData = useMemo(() => {
    if (isLoading || error || !allSalesData.length) return [];

    return allSalesData.filter(item => {
      const saleDate = item.saleDate; 

      const startDateFilter = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      
      let endDateFilterExclusive = null;
      if (filters.endDate) {
          const tempEndDate = new Date(filters.endDate + 'T00:00:00');
          tempEndDate.setDate(tempEndDate.getDate() + 1);
          endDateFilterExclusive = tempEndDate;
      }
      
      if (startDateFilter && saleDate < startDateFilter) return false;
      if (endDateFilterExclusive && saleDate >= endDateFilterExclusive) return false;
      
      if (filters.seasons.length > 0) {
        const itemSeason = getBrazilianSeason(saleDate);
        if (!filters.seasons.includes(itemSeason)) return false;
      }

      if (filters.months.length > 0) {
        const itemMonthKey = saleDate.getMonth().toString() as MonthKey;
        if (!filters.months.includes(itemMonthKey)) return false;
      }

      if (filters.years.length > 0) {
        const itemYear = saleDate.getFullYear().toString();
        if (!filters.years.includes(itemYear)) return false;
      }
      
      if (filters.clientTypes.length > 0 && !filters.clientTypes.includes(item.clientType)) return false;
      if (filters.productNames.length > 0 && !filters.productNames.includes(item.productName)) return false;
      if (filters.flavors.length > 0 && !filters.flavors.includes(item.flavor)) return false;
      return true;
    });
  }, [allSalesData, filters, isLoading, error]);

  const resetFilters = useCallback(() => {
    setFilters(INITIAL_FILTER_STATE);
  }, []);

  return {
    isLoading,
    error,
    allSalesData,
    allExpenseData, 
    filters,
    setFilters,
    filteredSalesData,
    uniqueClientTypes,
    uniqueProductNames,
    uniqueFlavors,
    uniqueYears, // Added
    resetFilters,
  };
};