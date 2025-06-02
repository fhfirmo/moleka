
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { CategoryData, Theme } from '../../types.ts'; 
import { processTopItems, CHART_COLORS } from '../../utils/chartUtils.ts';

interface TopItemsChartProps {
  data?: any[]; 
  itemKey?: string; 
  metricKey?: string; 
  topN?: number;
  theme: Theme;
  valuePrefix?: string; 
  valueSuffix?: string; 
  metricNameLabel: string; 
  preProcessedData?: CategoryData[]; 
  yAxisWidthOverride?: number; 
}

const TopItemsChart: React.FC<TopItemsChartProps> = ({ 
  data, 
  itemKey, 
  metricKey, 
  topN = 5, 
  theme,
  valuePrefix = '',
  valueSuffix = '',
  metricNameLabel,
  preProcessedData,
  yAxisWidthOverride,
}) => {
  const chartData = useMemo(() => {
    if (preProcessedData && preProcessedData.length > 0) {
      return preProcessedData;
    }
    if (data && itemKey && metricKey) {
      return processTopItems(data, itemKey, metricKey, topN);
    }
    return [];
  }, [preProcessedData, data, itemKey, metricKey, topN]);

  const axisStrokeColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridStrokeColor = theme === 'dark' ? '#4A5568' : '#E5E7EB';
  const legendColor = theme === 'dark' ? '#E5E7EB' : '#374151';
  const tooltipBgColor = theme === 'dark' ? '#2D3748' : '#FFFFFF';
  const tooltipLabelColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const tickFillColor = theme === 'dark' ? '#CBD5E0' : '#4B5563';

  if (!chartData || chartData.length === 0) {
    return <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} py-10`}>Não há dados suficientes para exibir o ranking.</p>;
  }
  
  let yAxisWidth = 120; 
  if (yAxisWidthOverride !== undefined) {
    yAxisWidth = yAxisWidthOverride;
  } else if (itemKey) { 
     yAxisWidth = itemKey.toLowerCase().includes('produto') || itemKey.toLowerCase().includes('product') ? 150 : 120;
  }


  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: yAxisWidth > 120 ? 70 : 50, bottom: 5 }}>
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
          formatter={(value: number) => {
             const isCurrencyLike = metricNameLabel.toLowerCase().includes('receita') || metricNameLabel.toLowerCase().includes('custo') || metricNameLabel.toLowerCase().includes('valor') || (valuePrefix && valuePrefix.includes('R$'));
             const minimumFractionDigits = isCurrencyLike ? 2 : 0;
             return [`${valuePrefix}${value.toLocaleString('pt-BR', {minimumFractionDigits: minimumFractionDigits, maximumFractionDigits: 2})}${valueSuffix}`, metricNameLabel];
          }}
        />
        <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px', fontSize: '12px' }} formatter={() => metricNameLabel} />
        <Bar dataKey="value" name={metricNameLabel} barSize={20}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopItemsChart;
