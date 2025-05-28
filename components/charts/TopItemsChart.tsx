import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CategoryData, Theme } from '../../types'; // CategoryData is generic enough
import { processTopItems, CHART_COLORS } from '../../utils/chartUtils';

interface TopItemsChartProps {
  data: any[]; // Generic data array
  itemKey: string; // Key for the item name/category (e.g., 'productName', 'flavor')
  metricKey: string; // Key for the value to be aggregated (e.g., 'quantity', 'grossValue', 'finalPurchaseValue')
  topN?: number;
  theme: Theme;
  valuePrefix?: string; // e.g., "R$ "
  valueSuffix?: string; // e.g., " un"
  metricNameLabel: string; // e.g., "Receita", "Quantidade Comprada", "Custo Total"
}

const TopItemsChart: React.FC<TopItemsChartProps> = ({ 
  data, 
  itemKey, 
  metricKey, 
  topN = 5, 
  theme,
  valuePrefix = '',
  valueSuffix = '',
  metricNameLabel
}) => {
  const processedData = processTopItems(data, itemKey, metricKey, topN);

  const axisStrokeColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridStrokeColor = theme === 'dark' ? '#4A5568' : '#E5E7EB';
  const legendColor = theme === 'dark' ? '#E5E7EB' : '#374151';
  const tooltipBgColor = theme === 'dark' ? '#2D3748' : '#FFFFFF';
  const tooltipLabelColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const tickFillColor = theme === 'dark' ? '#CBD5E0' : '#4B5563';

  if (!processedData || processedData.length === 0) {
    return <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} py-10`}>Não há dados suficientes para exibir o ranking.</p>;
  }
  
  const yAxisWidth = itemKey.toLowerCase().includes('produto') || itemKey.toLowerCase().includes('product') ? 150 : 120;


  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} layout="vertical" margin={{ top: 5, right: 30, left: yAxisWidth > 120 ? 70 : 50, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} horizontal={false} />
        <XAxis 
            type="number" 
            stroke={axisStrokeColor} 
            tickFormatter={(value) => `${valuePrefix}${value.toLocaleString('pt-BR')}${valueSuffix}`}
            tick={{ fontSize: 10, fill: tickFillColor }}
        />
        <YAxis 
            dataKey="name" 
            type="category" 
            stroke={axisStrokeColor} 
            width={yAxisWidth} 
            tick={{ fontSize: 11, fill: tickFillColor }}
            interval={0}
        />
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem', color: tooltipLabelColor }}
          labelStyle={{ color: tooltipLabelColor, fontWeight: 'bold' }}
          itemStyle={{ color: legendColor }}
          formatter={(value: number) => [`${valuePrefix}${value.toLocaleString('pt-BR', {minimumFractionDigits: metricKey.toLowerCase().includes('value') || metricKey.toLowerCase().includes('cost') ? 2 : 0, maximumFractionDigits: 2})}${valueSuffix}`, metricNameLabel]}
        />
        <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px', fontSize: '12px' }} formatter={() => metricNameLabel} />
        <Bar dataKey="value" name={metricNameLabel} barSize={20}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopItemsChart;