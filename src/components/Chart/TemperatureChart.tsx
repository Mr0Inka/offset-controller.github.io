import { ComposedChart, Line, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DataPoint } from '../../types';

interface TemperatureChartProps {
  data: DataPoint[];
  room: string;
}

export const TemperatureChart = ({ data, room }: TemperatureChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart
        data={data}
        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
      >
        <defs>
          <linearGradient id={`colorTado-${room}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.2} />
            <stop offset="50%" stopColor="#60A5FA" stopOpacity={0.08} />
            <stop offset="100%" stopColor="#60A5FA" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`colorSensor-${room}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity={0.25} />
            <stop offset="50%" stopColor="#34D399" stopOpacity={0.1} />
            <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`colorSensorHumidity-${room}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F472B6" stopOpacity={0.15} />
            <stop offset="50%" stopColor="#F472B6" stopOpacity={0.06} />
            <stop offset="100%" stopColor="#F472B6" stopOpacity={0} />
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
          formatter={(value: any, name: string) => {
            if (name === 'Sensor Humidity (mapped)') {
              const humidity = ((value as number) - 15) * 6 + 20;
              return [`${humidity.toFixed(1)}%`, 'Sensor Humidity'];
            }
            return [value, name];
          }}
        />
        <Line
          type="linear"
          dataKey="tadoTarget"
          stroke="#FBBF24"
          strokeWidth={1.5}
          strokeDasharray="8 4"
          strokeOpacity={0.5}
          name="Target Temperature"
          dot={false}
          connectNulls={true}
          isAnimationActive={false}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Area
          type="natural"
          dataKey="tadoTemperature"
          stroke="#60A5FA"
          strokeWidth={1.5}
          strokeOpacity={0.7}
          fill={`url(#colorTado-${room})`}
          name="Tado Temperature"
          connectNulls={true}
          isAnimationActive={false}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Area
          type="natural"
          dataKey="sensorTemperature"
          stroke="#34D399"
          strokeWidth={1.5}
          fill={`url(#colorSensor-${room})`}
          name="Sensor Temperature"
          connectNulls={true}
          isAnimationActive={false}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Area
          type="natural"
          dataKey="sensorHumidityMapped"
          stroke="#F472B6"
          strokeWidth={1.5}
          strokeOpacity={0.6}
          fill={`url(#colorSensorHumidity-${room})`}
          name="Sensor Humidity (mapped)"
          connectNulls={true}
          isAnimationActive={false}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

