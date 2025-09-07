import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  TimeScale,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import { ChartConfiguration } from '../types/analytics';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  ArcElement,
  TimeScale
);

interface ChartRendererProps {
  data: any[];
  config: ChartConfiguration;
}

export const ChartRenderer: React.FC<ChartRendererProps> = ({ data, config }) => {
  // Prepare chart data based on configuration
  const prepareChartData = () => {
    if (!data || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    const labels = data.map(item => 
      config.x_axis ? item[config.x_axis] : item[Object.keys(item)[0]]
    );

    const dataset = {
      label: config.title,
      data: data.map(item => 
        config.y_axis ? item[config.y_axis] : item[Object.keys(item)[1]]
      ),
      backgroundColor: config.chart_type === 'pie' || config.chart_type === 'doughnut' 
        ? [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 205, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)',
            'rgba(99, 255, 132, 0.8)',
          ].slice(0, data.length)
        : config.chart_type === 'line'
        ? 'rgba(75, 192, 192, 0.2)'
        : 'rgba(54, 162, 235, 0.8)',
      borderColor: config.chart_type === 'pie' || config.chart_type === 'doughnut'
        ? [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 205, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
            'rgba(255, 99, 255, 1)',
            'rgba(99, 255, 132, 1)',
          ].slice(0, data.length)
        : config.chart_type === 'line'
        ? 'rgba(75, 192, 192, 1)'
        : 'rgba(54, 162, 235, 1)',
      borderWidth: 1,
      tension: config.chart_type === 'line' ? 0.1 : undefined,
    };

    return {
      labels,
      datasets: [dataset]
    };
  };

  // Chart options
  const getChartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: !!config.title,
          text: config.title,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.dataset.label || '';
              const value = context.parsed.y || context.parsed || 0;
              
              // Format numbers with commas for better readability
              const formattedValue = typeof value === 'number' 
                ? value.toLocaleString() 
                : value;
              
              return `${label}: ${formattedValue}`;
            }
          }
        }
      },
    };

    // Add scales for bar and line charts
    if (config.chart_type === 'bar' || config.chart_type === 'line') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: !!config.y_axis,
              text: config.y_axis || 'Value'
            }
          },
          x: {
            title: {
              display: !!config.x_axis,
              text: config.x_axis || 'Category'
            }
          }
        }
      };
    }

    return baseOptions;
  };

  const chartData = prepareChartData();
  const chartOptions = getChartOptions();

  // Render appropriate chart type
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      options: chartOptions,
    };

    switch (config.chart_type) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'line':
        return <Line {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      default:
        return <Bar {...commonProps} />;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-center">
          <div className="text-gray-400 text-lg mb-2">📊</div>
          <div className="text-gray-600 text-sm">No data available to display</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-4">
      <div className="h-64 mb-4">
        {renderChart()}
      </div>
      
      {/* Data summary */}
      <div className="text-xs text-gray-500 border-t pt-2">
        <div className="flex justify-between">
          <span>Data points: {data.length}</span>
          <span>Chart type: {config.chart_type}</span>
        </div>
      </div>
    </div>
  );
};
