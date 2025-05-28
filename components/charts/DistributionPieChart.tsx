import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Text } from 'recharts';
import { CategoryData, Theme } from '../../types'; // CategoryData is generic enough
import { processDistributionData, CHART_COLORS, formatValueToAbbreviated } from '../../utils/chartUtils'; // Updated util

interface DistributionPieChartProps {
  data: any[]; // Generic data
  groupKey: string; // Key to group by (e.g., 'clientType', 'nota', 'category')
  metricKey: string; // Key for the value to aggregate (e.g., 'grossValue', 'finalPurchaseValue')
  theme: Theme;
  chartTitle: string; // e.g., "Distribuição por Tipo de Cliente", "Compras por Fornecedor"
  valuePrefix?: string; // e.g., "R$ "
  valueSuffix?: string; // e.g., " un"
}

// Default Legend Icon (simple colored square)
const DefaultLegendIcon: React.FC<{ color: string }> = ({ color }) => (
    <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: color, marginRight: '6px', borderRadius: '3px', verticalAlign: 'middle' }}></span>
);

// Custom Legend Component - Simplified without specific icons for now
const CustomLegend = (props: any) => {
  const { payload, theme } = props;
  const legendTextColor = theme === 'dark' ? '#E5E7EB' : '#374151';

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '5px 15px' }}>
      {payload.map((entry: any, index: number) => {
        const { value, color } = entry; // value here is the groupKey's value (e.g., client type name, nota name)
        return (
          <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', color: legendTextColor, fontSize: '13px' }}>
            <DefaultLegendIcon color={color} />
            <span style={{ verticalAlign: 'middle' }}>{String(value)}</span>
          </li>
        );
      })}
    </ul>
  );
};

const DistributionPieChart: React.FC<DistributionPieChartProps> = ({ 
    data, 
    groupKey, 
    metricKey, 
    theme, 
    chartTitle,
    valuePrefix = '',
    valueSuffix = ''
}) => {
  const processedData = processDistributionData(data, groupKey, metricKey);

  const tooltipBgColor = theme === 'dark' ? '#2D3748' : '#FFFFFF';
  const tooltipLabelColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const legendColor = theme === 'dark' ? '#E5E7EB' : '#374151';
  const centerTextSubColor = theme === 'dark' ? '#A0AEC0' : '#718096';

  if (!processedData || processedData.length === 0) {
    return <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} py-10`}>Não há dados para exibir a distribuição.</p>;
  }
  
  const totalValue = processedData.reduce((sum, entry) => sum + (entry.value || 0), 0);
  const formattedTotalValue = `${valuePrefix}${formatValueToAbbreviated(totalValue)}${valueSuffix}`.trim();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
    if (percent < 0.05) return null; 
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Basic contrast check for label color
    const hexColor = fill.startsWith('#') ? fill.substring(1) : fill;
    const r = parseInt(hexColor.substring(0,2), 16);
    const g = parseInt(hexColor.substring(2,4), 16);
    const b = parseInt(hexColor.substring(4,6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const dynamicLabelTextColor = brightness > 125 ? '#000000' : '#FFFFFF';


    return (
      <text x={x} y={y} fill={dynamicLabelTextColor} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11px" fontWeight="medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const pieCyPosition = '45%';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Tooltip
          contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem', color: tooltipLabelColor }}
          labelStyle={{ color: tooltipLabelColor, fontWeight: 'bold' }}
          itemStyle={{ color: legendColor }}
          formatter={(value: number, name: string) // name is the groupKey value
            => [`${valuePrefix}${value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}${valueSuffix} (${(value / totalValue * 100).toFixed(1)}%)`, name]}
        />
        <Legend 
          content={<CustomLegend theme={theme} />} // Pass theme to CustomLegend
          layout="horizontal" 
          verticalAlign="bottom" 
          align="center" 
        />
        <Pie
          data={processedData}
          cx="50%"
          cy={pieCyPosition} 
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius="80%"
          innerRadius="45%"
          fill="#8884d8"
          dataKey="value"
          nameKey="name" // This 'name' comes from CategoryData, which is the value of groupKey
          paddingAngle={1} 
        >
          {processedData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke={tooltipBgColor} strokeWidth={1}/>
          ))}
        </Pie>
        <text x="50%" y={pieCyPosition} textAnchor="middle" dominantBaseline="middle" fill={legendColor} fontSize="20px" fontWeight="bold">
          {formattedTotalValue}
        </text>
         <text x="50%" y={`calc(${pieCyPosition} + 20px)`} textAnchor="middle" dominantBaseline="middle" fill={centerTextSubColor} fontSize="12px">
          Total {chartTitle}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DistributionPieChart;