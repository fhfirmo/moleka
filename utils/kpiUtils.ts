import { SaleItem, ExpenseItem } from '../types';

export const calculateTotalRevenue = (data: SaleItem[]): number => {
  return data.reduce((sum, item) => sum + item.grossValue, 0);
};

export interface RevenueByClientType {
  name: string;
  value: number;
}

export const calculateRevenueByClientType = (data: SaleItem[], topN: number = 3): RevenueByClientType[] => {
  const revenueMap: { [key: string]: number } = {};
  data.forEach(item => {
    if (!item.clientType) return;
    if (!revenueMap[item.clientType]) {
      revenueMap[item.clientType] = 0;
    }
    revenueMap[item.clientType] += item.grossValue;
  });

  const sortedByRevenue = Object.entries(revenueMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (sortedByRevenue.length <= topN) { 
    return sortedByRevenue;
  }
  
  if (sortedByRevenue.length > topN && topN > 0) { 
    const topItems = sortedByRevenue.slice(0, topN);
    const otherItemsValue = sortedByRevenue.slice(topN).reduce((sum, item) => sum + item.value, 0);
    
    if (otherItemsValue > 0) {
      return [...topItems, { name: 'Outros', value: otherItemsValue }];
    }
    return topItems;
  }

  return sortedByRevenue; 
};

// Renamed and updated to use finalPurchaseValue
export const calculateTotalPurchaseCost = (data: ExpenseItem[]): number => {
  if (!data) return 0;
  return data.reduce((sum, item) => sum + (item.finalPurchaseValue || 0), 0);
};

export const calculateTotalItemsPurchased = (data: ExpenseItem[]): number => {
  if (!data) return 0;
  return data.reduce((sum, item) => sum + (item.quantity || 0), 0);
};

export const calculateAverageCostPerItem = (data: ExpenseItem[]): number => {
  if (!data || data.length === 0) return 0;
  const totalCost = calculateTotalPurchaseCost(data);
  const totalQuantity = calculateTotalItemsPurchased(data);
  if (totalQuantity === 0) return 0;
  return parseFloat((totalCost / totalQuantity).toFixed(2));
};

export interface TopPurchasedProductInfo {
  name: string;
  value: number;
}

export const getTopPurchasedProductByMetric = (
  data: ExpenseItem[],
  metric: 'quantity' | 'finalPurchaseValue',
  topN: number = 1
): TopPurchasedProductInfo[] => {
  if (!data) return [];

  const productMap: { [productName: string]: number } = {};

  data.forEach(item => {
    if (item.productName) {
      if (!productMap[item.productName]) {
        productMap[item.productName] = 0;
      }
      productMap[item.productName] += item[metric] || 0;
    }
  });

  return Object.entries(productMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, topN);
};

export const getTopPurchasedProductByQuantity = (items: ExpenseItem[], topN: number = 1): TopPurchasedProductInfo[] => {
  return getTopPurchasedProductByMetric(items, 'quantity', topN);
};

export const getTopPurchasedProductByCost = (items: ExpenseItem[], topN: number = 1): TopPurchasedProductInfo[] => {
  return getTopPurchasedProductByMetric(items, 'finalPurchaseValue', topN);
};