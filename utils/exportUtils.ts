
import { SaleItem } from '../types';
import { format } from 'date-fns';

export const exportToCSV = (data: SaleItem[], filename: string = 'sales_report.csv'): void => {
  if (!data || data.length === 0) {
    alert('Não há dados para exportar.');
    return;
  }

  const headers = [
    'ID', 'Tipo de Cliente', 'Data da Venda', 'Produto', 'SKU', 
    'Sabor', 'Tamanho', 'Quantidade', 'Valor Bruto (R$)', 
    'Valor de Compra (R$)', 'Valor Líquido (R$)'
  ];
  
  const csvRows = [
    headers.join(','), 
    ...data.map(row => {
      const rowValues = [
        row.id,
        row.clientType,
        format(row.saleDate, 'yyyy-MM-dd HH:mm:ss'),
        row.productName,
        row.sku,
        row.flavor,
        row.size || '',
        row.quantity,
        row.grossValue.toFixed(2),
        row.purchaseValue.toFixed(2),
        row.netValue.toFixed(2)
      ];
      return rowValues.map(value => {
        const stringValue = String(value === undefined || value === null ? '' : value);
        // Escape double quotes and wrap in double quotes if it contains comma, newline or double quote
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',');
    })
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' }); // Adding BOM for Excel
  const link = document.createElement('a');

  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
