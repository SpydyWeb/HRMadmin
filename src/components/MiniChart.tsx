import { MiniChartProps } from "@/utils/models";

export const MiniChart = ({ data, color, type }: MiniChartProps) => {
  const width = 60;
  const height = 30;
  const padding = 2;
  
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  const pathD = `M ${points.split(' ').join(' L ')}`;
  const areaD = `${pathD} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;
  
  return (
    <div className="flex-shrink-0">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <path
          d={areaD}
          fill={`url(#gradient-${type})`}
        />
        
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};