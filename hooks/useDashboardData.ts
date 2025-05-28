import { useState, useEffect, useMemo, useCallback } from 'react';
import { SaleItem, ExpenseItem, Filters, Season, MonthKey } from '../types';
import { loadDashboardDataFromExcel } from '../utils/excelUtils'; // Updated import
import { getBrazilianSeason } from '../utils/dateUtils'; 

const INITIAL_FILTER_STATE: Filters = {
  clientTypes: [],
  productNames: [],
  flavors: [],
  seasons: [],
  months: [], 
  startDate: undefined,
  endDate: undefined,
};

const EXCEL_FILE_PATH = '/Dados/dados_moleka_2022.xlsx';

export const useDashboardData = () => { // Renamed hook
  const [allSalesData, setAllSalesData] = useState<SaleItem[]>([]);
  const [allExpenseData, setAllExpenseData] = useState<ExpenseItem[]>([]); // New state for expenses
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTER_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log(`Tentando carregar dados de: ${EXCEL_FILE_PATH}`);
        const { salesData, expenseData } = await loadDashboardDataFromExcel(EXCEL_FILE_PATH); // Updated function call
        
        console.log(`Dados de vendas carregados: ${salesData.length} itens.`);
        console.log(`Dados de despesas carregados: ${expenseData.length} itens.`);

        const sortedSalesData = salesData.sort((a,b) => a.saleDate.getTime() - b.saleDate.getTime());
        setAllSalesData(sortedSalesData);
        
        // Expenses might also be sorted by date if needed for future charts
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

  const filteredSalesData = useMemo(() => {
    if (isLoading || error || !allSalesData.length) return [];

    return allSalesData.filter(item => {
      const saleDate = new Date(item.saleDate);
      const saleDateForDayComparison = new Date(item.saleDate);
      saleDateForDayComparison.setHours(0, 0, 0, 0);

      const startDateFilter = filters.startDate ? new Date(filters.startDate + 'T00:00:00') : null;
      const endDateFilter = filters.endDate ? new Date(filters.endDate + 'T23:59:59') : null;
      
      if (startDateFilter && saleDateForDayComparison < startDateFilter) return false;
      if (endDateFilter && saleDateForDayComparison > endDateFilter) return false;
      
      if (filters.seasons.length > 0) {
        const itemSeason = getBrazilianSeason(saleDate);
        if (!filters.seasons.includes(itemSeason)) return false;
      }

      if (filters.months.length > 0) {
        const itemMonthKey = saleDate.getMonth().toString() as MonthKey;
        if (!filters.months.includes(itemMonthKey)) return false;
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
    allExpenseData, // Provide expense data
    filters,
    setFilters,
    filteredSalesData,
    uniqueClientTypes,
    uniqueProductNames,
    uniqueFlavors,
    resetFilters,
  };
};