
import * as XLSX from 'xlsx';
import { SaleItem, ExpenseItem } from '../types';

// Função auxiliar para converter data do Excel para objeto Date do JS
// Garantindo que a data representa o dia do calendário local.
function excelDateToJSDate(excelDateValue: number | string | Date): Date {
  if (excelDateValue instanceof Date && !isNaN(excelDateValue.getTime())) {
    // Se já é um objeto Date (ex: de cellDates:true), ele pode ser meia-noite UTC.
    // Construímos uma nova data local usando os componentes UTC para evitar deslocamento de fuso.
    return new Date(excelDateValue.getUTCFullYear(), excelDateValue.getUTCMonth(), excelDateValue.getUTCDate());
  }

  if (typeof excelDateValue === 'string') {
    let year, month, day;

    // Tenta YYYY-MM-DD (pode ter T... mas pegamos só a parte da data)
    // new Date("YYYY-MM-DD") é interpretado como UTC pela especificação, então parseamos manualmente.
    const isoMatch = excelDateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
        year = parseInt(isoMatch[1], 10);
        month = parseInt(isoMatch[2], 10) - 1; // Mês JS é 0-indexado
        day = parseInt(isoMatch[3], 10);
        return new Date(year, month, day); // Cria data local
    }

    // Tenta formatos comuns como dd/mm/yyyy ou mm/dd/yyyy
    const parts = excelDateValue.split(/[/.-]/);
    if (parts.length === 3) {
        const p0 = parseInt(parts[0], 10);
        const p1 = parseInt(parts[1], 10);
        const p2 = parseInt(parts[2], 10);

        // Heurística para determinar o formato. Pode precisar de ajuste se os formatos variarem muito.
        if (p2 > 1900 && p2 < 2100) { // Ano é p2 (ex: 2022)
            if (p1 > 0 && p1 <= 12 && p0 > 0 && p0 <= 31) { // Assume dd/mm/yyyy
                day = p0; month = p1 - 1; year = p2;
            } else if (p0 > 0 && p0 <= 12 && p1 > 0 && p1 <= 31) { // Assume mm/dd/yyyy
                day = p1; month = p0 - 1; year = p2;
            }
        } else if (p0 > 1900 && p0 < 2100) { // Ano é p0
            year = p0;
            if (p1 > 0 && p1 <= 12 && p2 > 0 && p2 <= 31) { // Assume yyyy/mm/dd
                month = p1 - 1; day = p2;
            } else if (p2 > 0 && p2 <= 12 && p1 > 0 && p1 <= 31) { // Assume yyyy/dd/mm
                month = p2 - 1; day = p1;
            }
        }
        
        if (year !== undefined && month !== undefined && day !== undefined && month >=0 && month <=11 && day >=1 && day <=31) {
            return new Date(year, month, day); // Cria data local
        }
    }

    // Se for uma string representando um número serial do Excel
    const numSerial = parseFloat(excelDateValue);
    if (!isNaN(numSerial) && numSerial > 0 && numSerial < 2958466) { // Limites razoáveis para datas Excel
      const date_info_utc = new Date(Math.round((numSerial - 25569) * 86400 * 1000));
      return new Date(date_info_utc.getUTCFullYear(), date_info_utc.getUTCMonth(), date_info_utc.getUTCDate());
    }

    console.warn(`Não foi possível parsear a string de data: ${excelDateValue}. Retornando data epoch.`);
    return new Date(0); // Fallback para strings não parseáveis
  }

  if (typeof excelDateValue === 'number') {
    // Converte número serial do Excel para data UTC, depois pega componentes para data local
    if (excelDateValue > 0 && excelDateValue < 2958466) { // Limites razoáveis
        const date_info_utc = new Date(Math.round((excelDateValue - 25569) * 86400 * 1000));
        return new Date(date_info_utc.getUTCFullYear(), date_info_utc.getUTCMonth(), date_info_utc.getUTCDate());
    }
    console.warn(`Número serial de data Excel fora do esperado: ${excelDateValue}. Retornando data epoch.`);
    return new Date(0);
  }

  console.warn(`Tipo de data inválido: ${typeof excelDateValue}. Retornando data epoch.`);
  return new Date(0); // Fallback para outros tipos inválidos
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
