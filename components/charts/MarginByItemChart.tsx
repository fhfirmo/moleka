
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { SaleItem, CategoryData, Theme } from '../../types.ts';
import { processMarginByItem, CHART_COLORS } from '../../utils/chartUtils.ts';

interface MarginByItemChartProps {
  data: SaleItem[];
  itemKey: 'productName' | 'flavor';
  topN?: number;
  theme: Theme;
}

const MarginByItemChart: React.FC<MarginByItemChartProps> = ({ data, itemKey, topN = 10, theme }) => {
  const processedData = processMarginByItem(data, itemKey, topN);
  
  const axisStrokeColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridStrokeColor = theme === 'dark' ? '#4A5568' : '#E5E7EB';
  const legendColor = theme === 'dark' ? '#E5E7EB' : '#374151';
  const tooltipBgColor = theme === 'dark' ? '#2D3748' : '#FFFFFF';
  const tooltipLabelColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const tickFillColor = theme === 'dark' ? '#CBD5E0' : '#4B5563';

  if (!processedData || processedData.length === 0) {
    return <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} py-10`}>Não há dados de margem para exibir.</p>;
  }
  
  const itemTypeLabel = itemKey === 'productName' ? 'Produto' : 'Sabor';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} layout="vertical" margin={{ top: 5, right: 30, left: itemKey === 'productName' ? 70 : 50, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} horizontal={false}/>
        <XAxis 
            type="number" 
            stroke={axisStrokeColor} 
            tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
            tick={{ fontSize: 10, fill: tickFillColor }}
        />
        <YAxis 
            dataKey="name" 
            type="category" 
            stroke={axisStrokeColor} 
            width={itemKey === 'productName' ? 150 : 120}
            tick={{ fontSize: 11, fill: tickFillColor }}
            interval={0}
        />
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem', color: tooltipLabelColor }}
          labelStyle={{ color: tooltipLabelColor, fontWeight: 'bold' }}
          itemStyle={{ color: legendColor }}
          formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, `Margem Líquida (${itemTypeLabel})`]}
        />
        <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px', fontSize: '12px' }} formatter={() => `Margem Líquida (${itemTypeLabel})`} />
        <Bar dataKey="margin" name={`Margem Líquida (${itemTypeLabel})`} barSize={20}>
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MarginByItemChart;
