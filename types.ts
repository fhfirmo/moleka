// ClientType será derivado dinamicamente dos dados carregados.
// export enum ClientType {
//   Varejo = 'Varejo',
//   Atacado = 'Atacado',
//   Ecommerce = 'E-commerce',
//   Representante = 'Representante',
// }

export type Theme = 'light' | 'dark';

export type Season = 'Verão' | 'Outono' | 'Inverno' | 'Primavera';
export const ALL_SEASONS: Season[] = ['Verão', 'Outono', 'Inverno', 'Primavera'];

export type MonthKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11';
export const ALL_MONTHS: { key: MonthKey; name: string }[] = [
  { key: '0', name: 'Janeiro' }, { key: '1', name: 'Fevereiro' }, { key: '2', name: 'Março' },
  { key: '3', name: 'Abril' }, { key: '4', name: 'Maio' }, { key: '5', name: 'Junho' },
  { key: '6', name: 'Julho' }, { key: '7', name: 'Agosto' }, { key: '8', name: 'Setembro' },
  { key: '9', name: 'Outubro' }, { key: '10', name: 'Novembro' }, { key: '11', name: 'Dezembro' }
];

export type AggregationPeriod = 'day' | 'week' | 'bi-week' | 'month';


export interface SaleItem {
  id: string;
  clientType: string; 
  saleDate: Date;
  productName: string;
  sku: string;
  flavor: string;
  size?: string;
  quantity: number;
  grossValue: number; // Valor Bruto da Venda
  purchaseValue: number; // Valor de Compra (custo da mercadoria vendida individualmente)
  netValue: number; // Valor Líquido da Venda (grossValue - purchaseValue da venda)
}

export interface ExpenseItem {
  id: string;
  nota?: string; // Nota fiscal ou identificador do fornecedor/estabelecimento
  purchaseDate: Date; // Data da Compra/Despesa
  productName?: string; // Nome do Produto Comprado (se aplicável)
  flavor?: string; // Sabor (se aplicável)
  size?: string; // Tamanho (se aplicável)
  quantity?: number; // Quantidade comprada (se aplicável)
  grossPurchaseValue?: number; // Valor bruto da compra (antes de descontos, se houver)
  finalPurchaseValue: number; // Valor final da compra/despesa (este será o 'amount' principal)
  unitPurchaseValue?: number; // Valor unitário do produto comprado
  category: string; // Categoria da Despesa (e.g., "Compra de Mercadoria", "Aluguel")
  description?: string; // Descrição adicional
}


export interface Filters {
  startDate?: string; 
  endDate?: string;   
  clientTypes: string[]; 
  productNames: string[];
  flavors: string[];
  seasons: Season[];
  months: MonthKey[]; 
  years: string[]; // Added for year filter
}

// For chart data structures
export interface TimeSeriesData {
  date: string; 
  // From sales
  quantity?: number; // Sales quantity
  grossValue?: number; // For Sales revenue calculation
  netValue?: number; // For Sales net revenue calculation
  // From purchases/expenses
  costValue?: number; // This is finalPurchaseValue from ExpenseItem, represents total cost for a period
  itemCount?: number; // For Purchases quantity over time
  // For new profit chart
  revenueValue?: number; // Aggregated revenue for the period (e.g., from sales grossValue)
  expenseValue?: number; // Aggregated expenses for the period (e.g., from expense finalPurchaseValue)
  profitValue?: number;  // Calculated as revenueValue - expenseValue
}

export interface CategoryData {
  name: string;
  quantity?: number;
  revenue?: number;
  margin?: number;
  value?: number; // Generic value for pie charts or bar charts (can be cost, quantity, etc.)
}

export interface DayOfWeekData {
  day: string;
  sales?: number;
  revenue?: number;
}

export interface KPIData {
  title: string;
  value: string | number;
  currency?: boolean;
  previousValue?: string | number;
  change?: string; 
  icon?: React.ReactNode;
  description?: string;
}