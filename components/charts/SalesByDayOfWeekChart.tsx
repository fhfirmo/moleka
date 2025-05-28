
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { SaleItem, DayOfWeekData, Theme } from '../../types';
import { processSalesByDayOfWeek, CHART_COLORS } from '../../utils/chartUtils';

interface SalesByDayOfWeekChartProps {
  data: SaleItem[];
  metric: 'quantity' | 'grossValue';
  theme: Theme;
}

const SalesByDayOfWeekChart: React.FC<SalesByDayOfWeekChartProps> = ({ data, metric, theme }) => {
  const processedData = processSalesByDayOfWeek(data, metric);

  const axisStrokeColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridStrokeColor = theme === 'dark' ? '#4A5568' : '#E5E7EB';
  const legendColor = theme === 'dark' ? '#E5E7EB' : '#374151';
  const tooltipBgColor = theme === 'dark' ? '#2D3748' : '#FFFFFF';
  const tooltipLabelColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const tickFillColor = theme === 'dark' ? '#CBD5E0' : '#4B5563';

  if (!data || data.length === 0) {
    return <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} py-10`}>Não há dados para exibir.</p>;
  }

  const dataKey = metric === 'quantity' ? 'sales' : 'revenue';
  const metricName = metric === 'quantity' ? 'Quantidade de Vendas' : 'Receita Total';
  const unit = metric === 'quantity' ? 'un' : 'R$';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={processedData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
        <XAxis dataKey="day" stroke={axisStrokeColor} tick={{ fontSize: 12, fill: tickFillColor }}/>
        <YAxis stroke={axisStrokeColor} tickFormatter={(value) => `${unit} ${value.toLocaleString('pt-BR')}`} tick={{ fontSize: 10, fill: tickFillColor }} />
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem', color: tooltipLabelColor }}
          labelStyle={{ color: tooltipLabelColor, fontWeight: 'bold' }}
          itemStyle={{ color: legendColor }}
          formatter={(value: number) => [`${unit} ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, metricName]}
        />
        <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px', fontSize: '12px' }} formatter={() => metricName} />
        <Bar dataKey={dataKey} name={metricName} barSize={30}>
           {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SalesByDayOfWeekChart;
