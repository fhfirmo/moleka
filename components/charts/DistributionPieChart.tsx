
import React, { useState, useMemo } from 'react'; 
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'; 
import { CategoryData, Theme } from '../../types.ts';
import { processDistributionData, CHART_COLORS, formatValueToAbbreviated } from '../../utils/chartUtils.ts';

// Ícones para alternar Pizza/Rosca
const DonutChartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-5a4 4 0 100-8 4 4 0 000 8z" />
  </svg>
);

const PieChartIconUI: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
  </svg>
);


interface DistributionPieChartProps {
  data: any[]; 
  groupKey: string; 
  metricKey: string; 
  theme: Theme;
  valuePrefix?: string; 
  valueSuffix?: string; 
}

const DefaultLegendIcon: React.FC<{ color: string }> = ({ color }) => (
    <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: color, marginRight: '6px', borderRadius: '3px', verticalAlign: 'middle' }}></span>
);

const CustomLegend = (props: any) => {
  const { payload, theme } = props;
  const legendTextColor = theme === 'dark' ? '#E5E7EB' : '#374151';

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 0 0', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '5px 15px' }}>
      {payload.map((entry: any, index: number) => {
        const { value, color } = entry; 
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
    valuePrefix = '',
    valueSuffix = ''
}) => {
  const [displayAsDonut, setDisplayAsDonut] = useState<boolean>(true); 
  
  const processedData = useMemo(() => {
    return processDistributionData(data, groupKey, metricKey);
  }, [data, groupKey, metricKey]);

  // For debugging in the user's browser
  console.log(`DistributionPieChart (${groupKey} by ${metricKey}): Raw data length: ${data?.length}, Processed data:`, processedData);

  const tooltipBgColor = theme === 'dark' ? '#2D3748' : '#FFFFFF';
  const tooltipLabelColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const legendColor = theme === 'dark' ? '#E5E7EB' : '#374151';


  if (!processedData || processedData.length === 0) {
    return <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} py-10`} style={{minHeight: '50px'}}>Não há dados para exibir a distribuição.</p>;
  }
  
  const totalValue = processedData.reduce((sum, entry) => sum + (entry.value || 0), 0);
  const formattedTotalValue = `${valuePrefix}${formatValueToAbbreviated(totalValue)}${valueSuffix}`.trim();

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
    if (percent < 0.05 && displayAsDonut) return null; 
    if (percent < 0.03 && !displayAsDonut) return null; 

    const radiusFactor = displayAsDonut ? 0.6 : 0.5; 
    const radius = innerRadius + (outerRadius - innerRadius) * radiusFactor;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

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

  const pieCyPosition = displayAsDonut ? '45%' : '50%'; 
  const responsiveContainerHeight = displayAsDonut ? "calc(100% - 36px)" : "calc(100% - 36px)"; 

  const getButtonClass = (isActive: boolean) => {
    const base = "px-2 py-1 rounded-md transition-colors flex items-center text-xs sm:text-sm";
    if (isActive) {
      return `${base} ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`;
    }
    return `${base} ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-center items-center space-x-2 mb-3">
        <button
          onClick={() => setDisplayAsDonut(true)}
          className={getButtonClass(displayAsDonut)}
          aria-pressed={displayAsDonut}
          title="Visualizar como Rosca"
        >
          <DonutChartIcon className="w-4 h-4 mr-1 sm:mr-1.5" /> Rosca
        </button>
        <button
          onClick={() => setDisplayAsDonut(false)}
          className={getButtonClass(!displayAsDonut)}
          aria-pressed={!displayAsDonut}
          title="Visualizar como Pizza"
        >
          <PieChartIconUI className="w-4 h-4 mr-1 sm:mr-1.5" /> Pizza
        </button>
      </div>
      <ResponsiveContainer width="100%" height={responsiveContainerHeight}>
        <PieChart>
          <Tooltip
            contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem', color: tooltipLabelColor }}
            labelStyle={{ color: tooltipLabelColor, fontWeight: 'bold' }}
            itemStyle={{ color: legendColor }}
            formatter={(value: number, name: string) => {
              const percentage = totalValue > 0 ? (value / totalValue * 100).toFixed(1) : '0.0';
              return [`${valuePrefix}${value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}${valueSuffix} (${percentage}%)`, name];
            }}
          />
          <Legend 
            content={<CustomLegend theme={theme} />} 
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
            innerRadius={displayAsDonut ? "45%" : "0%"} 
            fill="#8884d8"
            dataKey="value"
            nameKey="name" 
            paddingAngle={1} 
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke={tooltipBgColor} strokeWidth={1}/>
            ))}
          </Pie>
          {displayAsDonut && ( 
            <text x="50%" y={pieCyPosition} textAnchor="middle" dominantBaseline="middle" fill={legendColor} fontSize="20px" fontWeight="bold">
              {formattedTotalValue}
            </text>
          )}
          
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DistributionPieChart;
