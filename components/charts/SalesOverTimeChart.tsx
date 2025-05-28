
import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea } from 'recharts';
import { SaleItem, TimeSeriesData, Theme, AggregationPeriod } from '../../types';
import { processSalesOverTime, formatDateForChartAxis, CHART_COLORS } from '../../utils/chartUtils';
import { ptBR } from 'date-fns/locale';

interface SalesOverTimeChartProps {
  data: SaleItem[];
  theme: Theme;
}

type MetricKey = 'quantity' | 'grossValue' | 'netValue';
type ChartDisplayType = 'line' | 'bar';

// Icons for chart type toggle
const TrendingUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const ChartBarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
);

// Simple Calendar Icon for "Mês"
const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // For "Dia"
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5M12 15.75h.008v.008H12v-.008zm0-2.25h.008v.008H12v-.008zm3.75 2.25h.008v.008H15.75v-.008zm0-2.25h.008v.008H15.75v-.008zm-7.5 2.25h.008v.008H8.25v-.008zm0-2.25h.008v.008H8.25v-.008z" />
    </svg>
);


const SalesOverTimeChart: React.FC<SalesOverTimeChartProps> = ({ data, theme }) => {
  const [activeMetric, setActiveMetric] = useState<MetricKey>('grossValue');
  const [chartDisplayType, setChartDisplayType] = useState<ChartDisplayType>('line');
  const [activeAggregationPeriod, setActiveAggregationPeriod] = useState<AggregationPeriod>('month');
  const [zoomArea, setZoomArea] = useState<{ left?: string; right?: string; refAreaLeft?: string; refAreaRight?: string }>({});

  const processedData = useMemo(() => processSalesOverTime(data, activeAggregationPeriod), [data, activeAggregationPeriod]);

  const axisStrokeColor = theme === 'dark' ? '#9CA3AF' : '#6B7280';
  const gridStrokeColor = theme === 'dark' ? '#4A5568' : '#E5E7EB';
  const legendColor = theme === 'dark' ? '#E5E7EB' : '#374151';
  const tooltipBgColor = theme === 'dark' ? '#2D3748' : '#FFFFFF';
  const tooltipLabelColor = theme === 'dark' ? '#E5E7EB' : '#1F2937';
  const tooltipItemColor = (metric: MetricKey) => metricConfig[metric].color;

  const getDomain = () => {
      if (!zoomArea.left || !zoomArea.right || zoomArea.left === zoomArea.right) {
          return ['auto', 'auto'] as [number | string, number | string];
      }
      const relevantData = processedData.filter(d => 
          new Date(d.date) >= new Date(zoomArea.left!) && new Date(d.date) <= new Date(zoomArea.right!)
      );
      if (relevantData.length === 0) return ['auto', 'auto'] as [number | string, number | string];
      
      const values = relevantData.map(d => d[activeMetric] || 0);
      const minVal = Math.min(0, ...values); // Ensure domain includes 0 or negative values
      const maxVal = Math.max(...values);
      return [minVal, maxVal] as [number | string, number | string];
  };
  
  const yDomain = getDomain();

  const handleZoom = () => {
    if (zoomArea.refAreaLeft && zoomArea.refAreaRight) {
        let { refAreaLeft, refAreaRight } = zoomArea;
        if (new Date(refAreaLeft!) > new Date(refAreaRight!)) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];
        
        setZoomArea({
            left: refAreaLeft,
            right: refAreaRight,
            refAreaLeft: undefined,
            refAreaRight: undefined
        });
    }
  };

  const resetZoom = () => {
      setZoomArea({});
  };

  if (!data || data.length === 0) {
    return <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} py-10`}>Não há dados para exibir no período selecionado.</p>;
  }

  const metricConfig = {
    quantity: { name: 'Quantidade', color: CHART_COLORS[0], unit: 'un', btnColor: 'blue' },
    grossValue: { name: 'Valor Bruto', color: CHART_COLORS[1], unit: 'R$', btnColor: 'emerald' },
    netValue: { name: 'Valor Líquido', color: CHART_COLORS[2], unit: 'R$', btnColor: 'amber' },
  };

  const aggregationPeriodConfig: Record<AggregationPeriod, { name: string; icon?: React.FC<React.SVGProps<SVGSVGElement>>, btnColor: string }> = {
    day: { name: 'Dia', icon: CalendarDaysIcon, btnColor: 'cyan' },
    week: { name: 'Semana', icon: undefined, btnColor: 'sky' }, // Using text for now
    'bi-week': { name: 'Quinzena', icon: undefined, btnColor: 'indigo'}, // Using text for now
    month: { name: 'Mês', icon: CalendarIcon, btnColor: 'violet' },
  };
  
  const getButtonClass = (key: MetricKey | ChartDisplayType | AggregationPeriod, type: 'metric' | 'display' | 'aggregation') => {
    let isActive = false;
    let colorName = 'gray';

    switch(type) {
        case 'metric':
            isActive = activeMetric === key;
            if (key in metricConfig) colorName = metricConfig[key as MetricKey].btnColor;
            break;
        case 'display':
            isActive = chartDisplayType === key;
            colorName = isActive ? (key === 'line' ? 'teal' : 'purple') : 'gray';
            break;
        case 'aggregation':
            isActive = activeAggregationPeriod === key;
            if (key in aggregationPeriodConfig) colorName = aggregationPeriodConfig[key as AggregationPeriod].btnColor;
            break;
    }

    if (isActive) {
      return `bg-${colorName}-500 text-white`;
    }
    return theme === 'dark'
      ? `bg-gray-700 hover:bg-gray-600 text-gray-300`
      : `bg-gray-200 hover:bg-gray-300 text-gray-700`;
  };

  const commonChartProps = {
    data: processedData,
    margin: { top: 5, right: 20, left: 20, bottom: 20 },
    onMouseDown: (e: any) => e && setZoomArea(prev => ({ ...prev, refAreaLeft: e.activeLabel })), // activeLabel is the dataKey of XAxis
    onMouseMove: (e: any) => e && zoomArea.refAreaLeft && setZoomArea(prev => ({ ...prev, refAreaRight: e.activeLabel })),
    onMouseUp: handleZoom,
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-center items-center flex-wrap gap-x-2 gap-y-2 mb-4 text-xs">
            {/* Aggregation Period Toggles */}
            <div className="flex flex-wrap justify-center space-x-1 sm:space-x-2">
                {(['day', 'week', 'bi-week', 'month'] as AggregationPeriod[]).map(period => {
                    const config = aggregationPeriodConfig[period];
                    const Icon = config.icon;
                    return (
                        <button
                            key={period}
                            onClick={() => setActiveAggregationPeriod(period)}
                            className={`px-2 py-1 rounded-md transition-colors flex items-center ${getButtonClass(period, 'aggregation')}`}
                            aria-pressed={activeAggregationPeriod === period}
                            title={`Agregar por ${config.name.toLowerCase()}`}
                        >
                           {Icon && <Icon className="w-3 h-3 sm:w-4 sm:h-4 mr-1"/>} {config.name}
                        </button>
                    );
                })}
            </div>
            
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} mx-1 hidden md:block`}></div>

            {/* Metric Toggles */}
            <div className="flex flex-wrap justify-center space-x-1 sm:space-x-2">
                {(['grossValue', 'netValue', 'quantity'] as MetricKey[]).map(metric => (
                <button
                    key={metric}
                    onClick={() => { setActiveMetric(metric); resetZoom();}}
                    className={`px-2 py-1 rounded-md transition-colors ${getButtonClass(metric, 'metric')}`}
                    aria-pressed={activeMetric === metric}
                >
                    {metricConfig[metric].name}
                </button>
                ))}
            </div>
            
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'} mx-1 hidden md:block`}></div>

            {/* Chart Type Toggles */}
            <div className="flex flex-wrap justify-center space-x-1 sm:space-x-2">
                {(['line', 'bar'] as ChartDisplayType[]).map(type => (
                    <button
                        key={type}
                        onClick={() => setChartDisplayType(type)}
                        className={`px-2 py-1 rounded-md transition-colors flex items-center ${getButtonClass(type, 'display')}`}
                        aria-pressed={chartDisplayType === type}
                        title={type === 'line' ? 'Gráfico de Linha' : 'Gráfico de Barras'}
                    >
                        {type === 'line' ? <TrendingUpIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1"/> : <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1"/>}
                        {type === 'line' ? 'Linha' : 'Barras'}
                    </button>
                ))}
            </div>

            {(zoomArea.left || zoomArea.right) && (
                <button 
                    onClick={resetZoom} 
                    className={`px-2 py-1 rounded-md ${theme === 'dark' ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white ml-1 sm:ml-2`}
                    title="Resetar Zoom"
                >
                    Resetar Zoom
                </button>
            )}
        </div>
      <ResponsiveContainer width="100%" height="100%">
        {chartDisplayType === 'line' ? (
            <LineChart {...commonChartProps} >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                <XAxis 
                    dataKey="date" // This is 'yyyy-MM-dd' start of period
                    stroke={axisStrokeColor} 
                    tickFormatter={(tick) => formatDateForChartAxis(tick, activeAggregationPeriod, ptBR)}
                    domain={zoomArea.left && zoomArea.right ? [zoomArea.left, zoomArea.right] : ['auto', 'auto']}
                    allowDataOverflow
                    type="category" // Important for zoom with string dates
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd" // Show first and last, auto hide others if too many
                />
                <YAxis 
                    stroke={axisStrokeColor} 
                    tickFormatter={(value) => `${metricConfig[activeMetric].unit} ${value.toLocaleString('pt-BR')}`}
                    domain={yDomain}
                    allowDataOverflow
                    tick={{ fontSize: 10 }}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: tooltipLabelColor, fontWeight: 'bold' }}
                    itemStyle={{ color: tooltipItemColor(activeMetric) }}
                    formatter={(value: number) => [`${metricConfig[activeMetric].unit} ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, metricConfig[activeMetric].name]}
                    labelFormatter={(label) => formatDateForChartAxis(label, activeAggregationPeriod, ptBR)}
                />
                <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px', fontSize: '12px' }} />
                <Line
                    type="monotone"
                    dataKey={activeMetric}
                    name={metricConfig[activeMetric].name}
                    stroke={metricConfig[activeMetric].color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: metricConfig[activeMetric].color, strokeWidth:0 }}
                    activeDot={{ r: 6, fill: metricConfig[activeMetric].color, stroke: theme === 'dark' ? '#fff' : '#333', strokeWidth: 2 }}
                />
                {zoomArea.refAreaLeft && zoomArea.refAreaRight && (
                    <ReferenceArea x1={zoomArea.refAreaLeft} x2={zoomArea.refAreaRight} strokeOpacity={0.3} fill={theme === 'dark' ? "rgba(100,100,255,0.2)" : "rgba(100,100,255,0.3)"} />
                )}
            </LineChart>
        ) : (
            <BarChart {...commonChartProps} barGap={1}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                <XAxis 
                    dataKey="date" 
                    stroke={axisStrokeColor} 
                    tickFormatter={(tick) => formatDateForChartAxis(tick, activeAggregationPeriod, ptBR)}
                    domain={zoomArea.left && zoomArea.right ? [zoomArea.left, zoomArea.right] : ['auto', 'auto']}
                    allowDataOverflow
                    type="category"
                    tick={{ fontSize: 10 }}
                    interval="preserveStartEnd"
                />
                <YAxis 
                    stroke={axisStrokeColor} 
                    tickFormatter={(value) => `${metricConfig[activeMetric].unit} ${value.toLocaleString('pt-BR')}`}
                    domain={yDomain}
                    allowDataOverflow
                    tick={{ fontSize: 10 }}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: tooltipBgColor, border: 'none', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    labelStyle={{ color: tooltipLabelColor, fontWeight: 'bold' }}
                    itemStyle={{ color: tooltipItemColor(activeMetric) }}
                    formatter={(value: number) => [`${metricConfig[activeMetric].unit} ${value.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, metricConfig[activeMetric].name]}
                    labelFormatter={(label) => formatDateForChartAxis(label, activeAggregationPeriod, ptBR)}
                />
                <Legend wrapperStyle={{ color: legendColor, paddingTop: '10px', fontSize: '12px' }} />
                <Bar 
                    dataKey={activeMetric} 
                    name={metricConfig[activeMetric].name} 
                    fill={metricConfig[activeMetric].color}
                    // Dynamic bar size based on number of data points, with min/max
                    barSize={ Math.min(50, Math.max(10, Math.floor(800 / (processedData.length || 1) / 1.5) ) ) } 
                >
                </Bar>
                {zoomArea.refAreaLeft && zoomArea.refAreaRight && (
                    <ReferenceArea x1={zoomArea.refAreaLeft} x2={zoomArea.refAreaRight} strokeOpacity={0.3} fill="rgba(100,100,255,0.2)" />
                )}
            </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SalesOverTimeChart;