import { SaleItem, ExpenseItem, TimeSeriesData, CategoryData, DayOfWeekData, AggregationPeriod } from '../types';
import { format, parseISO, startOfWeek, getISOWeek, startOfMonth } from 'date-fns';
import { ptBR, Locale } from 'date-fns/locale';

export const processSalesOverTime = (data: SaleItem[], aggregationPeriod: AggregationPeriod): TimeSeriesData[] => {
  const aggregated: { [dateKey: string]: TimeSeriesData } = {};

  data.forEach(item => {
    let periodStartDate: Date;
    const saleDate = item.saleDate;

    switch (aggregationPeriod) {
      case 'week':
        periodStartDate = startOfWeek(saleDate, { weekStartsOn: 1 /* Monday */ });
        break;
      case 'bi-week':
        const dayOfMonth = saleDate.getDate();
        if (dayOfMonth <= 15) {
          periodStartDate = new Date(saleDate.getFullYear(), saleDate.getMonth(), 1);
        } else {
          periodStartDate = new Date(saleDate.getFullYear(), saleDate.getMonth(), 16);
        }
        break;
      case 'month':
        periodStartDate = startOfMonth(saleDate);
        break;
      case 'day':
      default:
        periodStartDate = new Date(saleDate.getFullYear(), saleDate.getMonth(), saleDate.getDate());
        break;
    }
    
    const dateKey = format(periodStartDate, 'yyyy-MM-dd');

    if (!aggregated[dateKey]) {
      aggregated[dateKey] = { date: dateKey, quantity: 0, grossValue: 0, netValue: 0 };
    }
    aggregated[dateKey].quantity! += item.quantity;
    aggregated[dateKey].grossValue! += item.grossValue;
    aggregated[dateKey].netValue! += item.netValue;
  });

  return Object.values(aggregated).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

export const processPurchaseDataOverTime = (data: ExpenseItem[], aggregationPeriod: AggregationPeriod): TimeSeriesData[] => {
  const aggregated: { [dateKey: string]: TimeSeriesData } = {};

  data.forEach(item => {
    if (!item.purchaseDate) return; // Skip if no purchase date

    let periodStartDate: Date;
    const purchaseDate = item.purchaseDate;

    switch (aggregationPeriod) {
      case 'week':
        periodStartDate = startOfWeek(purchaseDate, { weekStartsOn: 1 });
        break;
      case 'bi-week':
        const dayOfMonth = purchaseDate.getDate();
        periodStartDate = dayOfMonth <= 15 
            ? new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 1)
            : new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), 16);
        break;
      case 'month':
        periodStartDate = startOfMonth(purchaseDate);
        break;
      case 'day':
      default:
        periodStartDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
        break;
    }
    
    const dateKey = format(periodStartDate, 'yyyy-MM-dd');

    if (!aggregated[dateKey]) {
      aggregated[dateKey] = { date: dateKey, costValue: 0, itemCount: 0 };
    }
    aggregated[dateKey].costValue! += (item.finalPurchaseValue || 0);
    aggregated[dateKey].itemCount! += (item.quantity || 0); // Summing quantity of items purchased
  });

  return Object.values(aggregated).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};


export const processTopItems = (
    data: any[], // Can be SaleItem[] or ExpenseItem[] or other
    itemKey: string, // e.g., 'productName', 'flavor'
    metricKey: string, // e.g., 'quantity', 'grossValue', 'finalPurchaseValue'
    topN: number = 5
): CategoryData[] => {
    const aggregated: { [name: string]: number } = {};

    data.forEach(item => {
        const key = item[itemKey];
        if (!key) return; 
        if (!aggregated[key]) {
            aggregated[key] = 0;
        }
        aggregated[key] += (item[metricKey] || 0);
    });
    
    return Object.entries(aggregated)
        .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
        .sort((a, b) => b.value - a.value)
        .slice(0, topN);
};


export const processSalesByDayOfWeek = (data: SaleItem[], metric: 'quantity' | 'grossValue'): DayOfWeekData[] => {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const aggregated: { [day: string]: number } = days.reduce((acc, day) => {
    acc[day] = 0;
    return acc;
  }, {} as { [day: string]: number });

  data.forEach(item => {
    const dayIndex = item.saleDate.getDay();
    const dayName = days[dayIndex];
    aggregated[dayName] += item[metric === 'quantity' ? 'quantity' : 'grossValue'];
  });

  return days.map(day => ({
    day,
    [metric === 'quantity' ? 'sales' : 'revenue']: parseFloat(aggregated[day].toFixed(2))
  }));
};


export const processMarginByItem = (
    data: SaleItem[], 
    itemKey: 'productName' | 'flavor',
    topN: number = 10
): CategoryData[] => {
  const aggregated: { [name: string]: { totalNetValue: number; count: number } } = {};

  data.forEach(item => {
    const key = item[itemKey];
    if (!key) return; 
    if (!aggregated[key]) {
      aggregated[key] = { totalNetValue: 0, count: 0 };
    }
    aggregated[key].totalNetValue += item.netValue;
    aggregated[key].count += 1; 
  });

  return Object.entries(aggregated)
    .map(([name, { totalNetValue }]) => ({
      name,
      margin: parseFloat(totalNetValue.toFixed(2)), 
    }))
    .sort((a, b) => b.margin! - a.margin!)
    .slice(0, topN);
};

export const processDistributionData = (
  data: any[], // Can be SaleItem[], ExpenseItem[], etc.
  groupKey: string, // e.g., 'clientType', 'nota', 'category'
  metricKey: string // e.g., 'grossValue', 'finalPurchaseValue', 'quantity'
): CategoryData[] => {
  const aggregated: { [key: string]: number } = {};
  
  data.forEach(item => {
    const key = item[groupKey];
    if (!key) return; 
    if (!aggregated[key]) {
      aggregated[key] = 0;
    }
    aggregated[key] += (item[metricKey] || 0);
  });

  return Object.entries(aggregated)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .filter(item => item.value > 0)
    .sort((a,b) => b.value - a.value); // Sort for potentially better color consistency in Pie
};


export const calculateAverageTicket = (data: SaleItem[]): number => {
  if (data.length === 0) return 0;
  const totalGrossValue = data.reduce((sum, item) => sum + item.grossValue, 0);
  return parseFloat((totalGrossValue / data.length).toFixed(2));
};

export const formatDateForDisplay = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  try {
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    return String(dateString); 
  }
};

export const formatDateForChartAxis = (dateString: string, aggregationPeriod: AggregationPeriod, locale: Locale = ptBR): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    switch (aggregationPeriod) {
      case 'day':
        return format(date, 'dd/MM/yy', { locale });
      case 'week':
        return `Sem ${getISOWeek(date)} (${format(date, 'dd/MM', { locale })})`;
      case 'bi-week':
        const day = date.getDate();
        const period = day === 1 ? '1ª' : '2ª';
        return `${period} Quinz ${format(date, 'MMM', { locale })}`;
      case 'month':
        return format(date, 'MMM/yy', { locale });
      default:
        return format(date, 'dd/MM/yyyy', { locale });
    }
  } catch (error) {
    console.error("Error formatting date for chart axis:", dateString, error);
    return dateString; 
  }
};


export const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#6366f1', '#f43f5e', '#d946ef', '#22d3ee'];

export const formatValueToAbbreviated = (value: number): string => {
  if (value === 0) return "0";
  
  const absValue = Math.abs(value);

  if (absValue < 1000) {
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: (value % 1 === 0 ? 0 : 2) });
  }

  const suffixes = ["", "K", "M", "B", "T"]; 
  const tier = Math.floor(Math.log10(absValue) / 3);

  if (tier === 0) { 
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: (value % 1 === 0 ? 0 : 2) });
  }

  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaledValue = value / scale;
  
  const fractionDigits = scaledValue % 1 === 0 ? 0 : 1;

  return scaledValue.toLocaleString('pt-BR', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }) + suffix;
};