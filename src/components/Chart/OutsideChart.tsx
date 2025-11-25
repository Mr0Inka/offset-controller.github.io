import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '../../types';

interface OutsideChartProps {
  data: DataPoint[];
}

export const OutsideChart = ({ data }: OutsideChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorOutside" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E5E7EB" stopOpacity={0.25} />
            <stop offset="50%" stopColor="#E5E7EB" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#E5E7EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="time"
          stroke="rgba(255, 255, 255, 0.5)"
          tick={{ fill: 'rgba(255, 255, 255, 0.6)', fontSize: 11 }}
          style={{ fontSize: '11px' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            border: 'none',
            borderRadius: '8px',
            color: '#F9FAFB',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
          }}
          labelStyle={{ color: '#F9FAFB', marginBottom: '4px' }}
        />
        <Area
          type="natural"
          dataKey="outsideTemperature"
          stroke="#E5E7EB"
          strokeWidth={1.5}
          fill="url(#colorOutside)"
          name="Outside Temperature"
          connectNulls={true}
          isAnimationActive={false}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

