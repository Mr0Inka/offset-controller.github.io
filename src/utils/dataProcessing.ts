import { DataPoint } from '../types';

export const downsampleData = (data: DataPoint[], targetPoints: number): DataPoint[] => {
  if (data.length <= targetPoints) {
    return data;
  }

  const downsampled: DataPoint[] = [];
  const step = data.length / targetPoints;

  // Always include first point
  downsampled.push(data[0]);

  // Sample evenly spaced points
  for (let i = 1; i < targetPoints - 1; i++) {
    const index = Math.round(i * step);
    if (index > 0 && index < data.length) {
      downsampled.push(data[index]);
    }
  }

  // Always include last point
  if (data.length > 1) {
    downsampled.push(data[data.length - 1]);
  }

  return downsampled;
};

export const processChartData = (rawData: DataPoint[]): DataPoint[] => {
  // Group data by time (rounded to nearest minute for alignment)
  const timeMap = new Map<string, DataPoint>();

  rawData.forEach(point => {
    // Skip invalid time values
    if (!point.time) return;
    
    const date = new Date(point.time);
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid time value:', point.time);
      return;
    }
    
    // Round to nearest minute for alignment
    date.setSeconds(0, 0);
    const timeKey = date.toISOString();

    if (!timeMap.has(timeKey)) {
      timeMap.set(timeKey, { time: timeKey });
    }

    const existing = timeMap.get(timeKey)!;
    // Merge data, preferring non-null values
    Object.keys(point).forEach(key => {
      if (key !== 'time' && point[key as keyof DataPoint] !== null && point[key as keyof DataPoint] !== undefined) {
        (existing as any)[key] = point[key as keyof DataPoint];
      }
    });
  });

  // Convert to array, sort by time
  const sorted = Array.from(timeMap.values())
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  // Carry forward last known values for each field
  const fields: (keyof DataPoint)[] = [
    'tadoTemperature', 'tadoRawTemperature', 'tadoHumidity', 'tadoTarget',
    'tadoOffset', 'tadoPower', 'sensorTemperature', 'sensorHumidity',
    'sensorRssi', 'sensorBattery', 'outsideTemperature'
  ];

  const lastValues: Partial<Record<keyof DataPoint, number | null>> = {};

  sorted.forEach(point => {
    fields.forEach(field => {
      const value = point[field];
      if (value !== null && value !== undefined && typeof value === 'number') {
        lastValues[field] = value;
      } else if (lastValues[field] !== undefined && lastValues[field] !== null) {
        // Use last known value if current point doesn't have it
        (point as any)[field] = lastValues[field];
      }
    });
  });

  // Format time for display and add mapped humidity for temperature chart
  return sorted.map(point => {
    // Map sensor humidity to temperature scale: 80% = 25°C, 20% = 15°C
    let mappedHumidity: number | undefined = undefined;
    if (point.sensorHumidity !== null && point.sensorHumidity !== undefined) {
      // Linear mapping: temp = 15 + (humidity - 20) * (25 - 15) / (80 - 20)
      // Simplified: temp = 15 + (humidity - 20) / 6
      mappedHumidity = 15 + (point.sensorHumidity - 20) / 6;
    }

    return {
      ...point,
      time: formatTime(point.time),
      sensorHumidityMapped: mappedHumidity,
    };
  });
};

export const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  const date = new Date(timeString);
  if (isNaN(date.getTime())) {
    console.warn('Invalid time string for formatting:', timeString);
    return timeString;
  }
  return date.toLocaleString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

