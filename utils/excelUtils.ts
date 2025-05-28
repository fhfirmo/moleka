import * as XLSX from 'xlsx';
import { SaleItem, ExpenseItem } from '../types';

// Função auxiliar para converter data do Excel para objeto Date do JS
function excelDateToJSDate(excelDate: number | string | Date): Date {
  if (excelDate instanceof Date && !isNaN(excelDate.getTime())) {
    return excelDate;
  }
  if (typeof excelDate === 'string') {
    // Try ISO format first
    const isoParsed = new Date(excelDate);
    if (!isNaN(isoParsed.getTime()) && excelDate.includes('-') && excelDate.includes('T')) { // Basic check for ISO-like string
        return isoParsed;
    }
    // Try dd/mm/yyyy or mm/dd/yyyy (less reliable without knowing exact format)
    // For now, relying on cellDates: true or direct number parsing for robustness
    const parts = excelDate.split(/[/.-]/);
    if (parts.length === 3) {
        const year = parseInt(parts[2], 10);
        const month = parseInt(parts[1], 10) -1; // JS months are 0-indexed
        const day = parseInt(parts[0], 10);
        if (year > 1900 && year < 2100 && month >=0 && month <=11 && day >=1 && day <=31) {
            const manualDate = new Date(year, month, day);
            if(!isNaN(manualDate.getTime())) return manualDate;
        }
    }


    const numDate = parseFloat(excelDate);
    if (!isNaN(numDate)) {
      excelDate = numDate;
    } else {
      // console.warn(`Could not parse date string to number: ${excelDate}`);
      // Fallback for strings like "YYYY-MM-DD" or other common date formats not caught by new Date() directly
      const stringDate = new Date(excelDate);
      if (!isNaN(stringDate.getTime())) return stringDate;
      throw new Error(`Invalid date string for Excel conversion: ${excelDate}`);
    }
  }
  if (typeof excelDate === 'number') {
    const jsDate = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
    return jsDate;
  }
  throw new Error(`Invalid date value for Excel conversion: ${excelDate}`);
}

// Função para parse de números que podem ter R$ ou vírgula como decimal
function parseCurrencyValue(value: any): number {
    if (typeof value === 'number') {
        return parseFloat(value.toFixed(2)); 
    }
    if (typeof value === 'string') {
        const cleanedValue = value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const num = parseFloat(cleanedValue);
        return isNaN(num) ? 0 : parseFloat(num.toFixed(2));
    }
    return 0; 
}


const COLUMN_MAPPINGS_SALES: { [key: string]: keyof SaleItem | 'rawDate' } = {
  'tipodecliente': 'clientType',
  'clientetype': 'clientType', 
  'data da venda': 'rawDate', 
  'datadavenda': 'rawDate',
  'data': 'rawDate', 
  'produtos': 'productName',
  'produto': 'productName',
  'sku': 'sku',
  'sabor': 'flavor',
  'tamanho': 'size',
  'quantidade': 'quantity',
  'qtd': 'quantity',
  'valor bruto': 'grossValue',
  'valorbruto': 'grossValue',
  'receitabruta': 'grossValue',
  'valor de compra': 'purchaseValue',
  'valordecompra': 'purchaseValue',
  'custo': 'purchaseValue',
  'valor liquido': 'netValue', 
  'valorlíquido': 'netValue',
};

const COLUMN_MAPPINGS_EXPENSE: { [key: string]: keyof ExpenseItem | 'rawPurchaseDate' } = {
  'nota': 'nota',
  'estabelecimento': 'nota', // Alias for 'nota'
  'fornecedor': 'nota', // Alias for 'nota'
  'data da compra': 'rawPurchaseDate',
  'datadacompra': 'rawPurchaseDate',
  'data despesa': 'rawPurchaseDate',
  'datadespesa': 'rawPurchaseDate',
  'data': 'rawPurchaseDate', // If 'data' column exists in Expense sheet
  'produtos': 'productName',
  'produto': 'productName',
  'item': 'productName',
  'sabor': 'flavor',
  'tamanho': 'size',
  'quantidade': 'quantity',
  'qtd': 'quantity',
  'valor bruto': 'grossPurchaseValue', // Valor bruto da compra
  'valorbruto': 'grossPurchaseValue',
  'valor final de compra': 'finalPurchaseValue',
  'valorfinaldecompra': 'finalPurchaseValue',
  'valor despesa': 'finalPurchaseValue',
  'valordespesa': 'finalPurchaseValue',
  'valor': 'finalPurchaseValue', // General 'valor' maps to final purchase value
  'custo total': 'finalPurchaseValue',
  'custototal': 'finalPurchaseValue',
  'valor unitário': 'unitPurchaseValue',
  'valorunitario': 'unitPurchaseValue',
  'preco unitario': 'unitPurchaseValue',
  'categoria': 'category',
  'descrição': 'description', 
  'descricao': 'description',
};


const normalizeHeader = (header: string): string => {
  return String(header).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '').trim();
};


export const loadDashboardDataFromExcel = async (filePath: string): Promise<{ salesData: SaleItem[], expenseData: ExpenseItem[] }> => {
  let salesData: SaleItem[] = [];
  let expenseData: ExpenseItem[] = [];

  try {
    const response = await fetch(filePath);
    if (!response.ok) {
      throw new Error(`Falha ao buscar o arquivo Excel: ${response.statusText} (caminho: ${filePath})`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

    // Processar aba "Receita" (Vendas)
    const salesSheetName = workbook.SheetNames.find(name => normalizeHeader(name) === 'receita') || workbook.SheetNames[0];
    if (salesSheetName) {
      const worksheetSales = workbook.Sheets[salesSheetName];
      const jsonDataSales = XLSX.utils.sheet_to_json<any>(worksheetSales, { header: 1, defval: "" });

      if (jsonDataSales.length >= 2) {
        const headers = (jsonDataSales[0] as string[]).map(normalizeHeader);
        const dataRows = jsonDataSales.slice(1);

        salesData = dataRows.map((rowArray: any[], index) => {
          const row: any = {};
          headers.forEach((header, i) => {
            row[header] = rowArray[i];
          });
          
          const saleItem: Partial<SaleItem> = { id: `sale-${index}-${Date.now()}` };

          for (const rawHeaderKey in COLUMN_MAPPINGS_SALES) {
             const normalizedHeaderKey = normalizeHeader(rawHeaderKey);
             const targetKey = COLUMN_MAPPINGS_SALES[normalizedHeaderKey as keyof typeof COLUMN_MAPPINGS_SALES] || COLUMN_MAPPINGS_SALES[rawHeaderKey as keyof typeof COLUMN_MAPPINGS_SALES];
             const excelValue = row[normalizedHeaderKey] ?? row[rawHeaderKey];

            if (excelValue === undefined || excelValue === "") continue;

            if (targetKey === 'rawDate') {
              try {
                saleItem.saleDate = excelDateToJSDate(excelValue);
              } catch (e) {
                console.warn(`Erro ao converter data da venda na linha ${index + 2}, valor '${excelValue}':`, e);
                saleItem.saleDate = new Date(0);
              }
            } else if (targetKey === 'quantity') {
              saleItem.quantity = parseInt(String(excelValue), 10) || 0;
            } else if (targetKey === 'grossValue' || targetKey === 'purchaseValue' || targetKey === 'netValue') {
              saleItem[targetKey as 'grossValue' | 'purchaseValue' | 'netValue'] = parseCurrencyValue(excelValue);
            } else if (targetKey) {
              (saleItem as any)[targetKey] = String(excelValue).trim();
            }
          }
          saleItem.clientType = saleItem.clientType || "N/A";
          saleItem.productName = saleItem.productName || "Produto Desconhecido";
          saleItem.flavor = saleItem.flavor || "Sabor Desconhecido";
          saleItem.sku = saleItem.sku || "SKU Desconhecido";
          saleItem.quantity = saleItem.quantity || 0;
          saleItem.grossValue = saleItem.grossValue || 0;
          saleItem.purchaseValue = saleItem.purchaseValue || 0;
          // Calculate netValue if not provided, assuming it's grossValue - purchaseValue (COGS for that sale)
          if(saleItem.netValue === undefined && saleItem.grossValue !== undefined && saleItem.purchaseValue !== undefined) {
            saleItem.netValue = parseFloat(((saleItem.grossValue || 0) - (saleItem.purchaseValue || 0)).toFixed(2));
          } else {
            saleItem.netValue = saleItem.netValue || 0;
          }
          if (!saleItem.saleDate || isNaN(saleItem.saleDate.getTime())) saleItem.saleDate = new Date(0);
          
          return saleItem as SaleItem;
        }).filter(item => item.saleDate && item.saleDate.getTime() !== new Date(0).getTime());
        console.log(`Processados ${salesData.length} itens de venda da aba "${salesSheetName}".`);
      } else {
        console.warn(`Aba "${salesSheetName}" (Vendas) vazia ou contém apenas cabeçalhos.`);
      }
    } else {
        console.warn("Aba de Receitas (Vendas) não encontrada ou não foi a primeira. Nenhuma venda carregada.");
    }

    // Processar aba "Despesa" (agora interpretada como Compras)
    const expenseSheetName = workbook.SheetNames.find(name => normalizeHeader(name) === 'despesa');
    if (expenseSheetName) {
      const worksheetExpenses = workbook.Sheets[expenseSheetName];
      const jsonDataExpenses = XLSX.utils.sheet_to_json<any>(worksheetExpenses, { header: 1, defval: "" });

      if (jsonDataExpenses.length >= 2) {
        const headers = (jsonDataExpenses[0] as string[]).map(normalizeHeader);
        const dataRows = jsonDataExpenses.slice(1);

        expenseData = dataRows.map((rowArray: any[], index) => {
          const row: any = {};
          headers.forEach((header, i) => {
            row[header] = rowArray[i];
          });

          const expenseItem: Partial<ExpenseItem> = { id: `expense-${index}-${Date.now()}` };
          
          for (const rawHeaderKey in COLUMN_MAPPINGS_EXPENSE) {
            const normalizedHeaderKey = normalizeHeader(rawHeaderKey);
            const targetKey = COLUMN_MAPPINGS_EXPENSE[normalizedHeaderKey as keyof typeof COLUMN_MAPPINGS_EXPENSE] || COLUMN_MAPPINGS_EXPENSE[rawHeaderKey as keyof typeof COLUMN_MAPPINGS_EXPENSE];
            const excelValue = row[normalizedHeaderKey] ?? row[rawHeaderKey];


            if (excelValue === undefined || excelValue === null || String(excelValue).trim() === "") continue;

            if (targetKey === 'rawPurchaseDate') {
              try {
                expenseItem.purchaseDate = excelDateToJSDate(excelValue);
              } catch (e) {
                console.warn(`Erro ao converter data da despesa/compra na linha ${index + 2}, valor '${excelValue}':`, e);
                expenseItem.purchaseDate = new Date(0);
              }
            } else if (targetKey === 'quantity') {
              expenseItem.quantity = parseInt(String(excelValue), 10) || 0;
            } else if (['grossPurchaseValue', 'finalPurchaseValue', 'unitPurchaseValue'].includes(targetKey as string) ) {
               (expenseItem as any)[targetKey] = parseCurrencyValue(excelValue);
            } else if (targetKey) { 
              (expenseItem as any)[targetKey] = String(excelValue).trim();
            }
          }
          
          // Default values and checks
          expenseItem.category = expenseItem.category || (expenseItem.productName ? "Compra de Mercadoria" : "Despesa Geral");
          expenseItem.finalPurchaseValue = expenseItem.finalPurchaseValue || 0; // This is the primary amount
          if (!expenseItem.purchaseDate || isNaN(expenseItem.purchaseDate.getTime())) expenseItem.purchaseDate = new Date(0);
          expenseItem.productName = expenseItem.productName || undefined; // Explicitly undefined if not a product purchase
          expenseItem.quantity = expenseItem.quantity || undefined;

          return expenseItem as ExpenseItem;
        }).filter(item => item.purchaseDate && item.purchaseDate.getTime() !== new Date(0).getTime() && item.finalPurchaseValue !== undefined); // Ensure essential fields are present
        console.log(`Processados ${expenseData.length} itens de despesa/compra da aba "${expenseSheetName}".`);
      } else {
        console.warn(`Aba "${expenseSheetName}" (Despesas/Compras) vazia ou contém apenas cabeçalhos.`);
      }
    } else {
      console.warn("Aba de Despesas/Compras não encontrada. Nenhuma despesa/compra carregada.");
    }
    
    return { salesData, expenseData };

  } catch (error) {
    console.error("Erro detalhado ao carregar/processar o arquivo Excel:", error);
    throw new Error(`Não foi possível processar o arquivo Excel: ${error instanceof Error ? error.message : String(error)}`);
  }
};