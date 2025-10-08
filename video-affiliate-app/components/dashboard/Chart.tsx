'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface ChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'line' | 'doughnut';
  className?: string;
  height?: number;
}

export function Chart({
  title,
  data,
  type = 'bar',
  className,
  height = 200,
}: ChartProps) {
  // Handle empty data for maxValue calculation
  const maxValue = data && data.length > 0 ? Math.max(...data.map(d => d.value || 0)) : 0;

  const renderBarChart = () => {
    // Handle empty data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Không có dữ liệu để hiển thị</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-gray-600">{item.value.toLocaleString('vi-VN')}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  backgroundColor: item.color || '#3B82F6',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    // Handle empty data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Không có dữ liệu để hiển thị</p>
        </div>
      );
    }

    // Handle single data point
    if (data.length === 1) {
      return (
        <div className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data[0].value}</div>
            <div className="text-sm text-gray-600">{data[0].label}</div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 400 ${height}`}
          className="overflow-visible"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
            <line
              key={index}
              x1="0"
              y1={height * ratio}
              x2="400"
              y2={height * ratio}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            points={data
              .map((item, index) => {
                const x = (index / (data.length - 1)) * 400;
                const y = maxValue > 0 ? height - (item.value / maxValue) * height : height / 2;
                return `${x},${y}`;
              })
              .join(' ')}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400;
            const y = maxValue > 0 ? height - (item.value / maxValue) * height : height / 2;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill="#3B82F6"
                className="hover:r-6 transition-all"
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          {data.map((item, index) => (
            <span key={index} className="text-center">
              {item.label}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderDoughnutChart = () => {
    // Handle empty data
    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Không có dữ liệu để hiển thị</p>
        </div>
      );
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    // Handle zero total
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <p>Tất cả giá trị đều bằng 0</p>
        </div>
      );
    }

    let cumulativePercentage = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative" style={{ width: `${height}px`, height: `${height}px` }}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 200 200"
            className="transform -rotate-90"
          >
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = (cumulativePercentage / 100) * 360;
              const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
              
              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;
              
              const x1 = 100 + 80 * Math.cos(startAngleRad);
              const y1 = 100 + 80 * Math.sin(startAngleRad);
              const x2 = 100 + 80 * Math.cos(endAngleRad);
              const y2 = 100 + 80 * Math.sin(endAngleRad);
              
              const largeArcFlag = percentage > 50 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z',
              ].join(' ');
              
              cumulativePercentage += percentage;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                  className="hover:opacity-80 transition-opacity"
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">{total.toLocaleString('vi-VN')}</div>
              <div className="text-xs text-gray-600">Tổng</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'doughnut':
        return renderDoughnutChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        
        {/* Legend for doughnut chart */}
        {type === 'doughnut' && (
          <div className="mt-4 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 text-sm">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                  }}
                />
                <span className="font-medium">{item.label}</span>
                <span className="text-gray-600">
                  ({((item.value / data.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
