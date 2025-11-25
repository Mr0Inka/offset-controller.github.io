import { DataPoint } from '../types';
import { ROOMS } from '../constants';

export const getLastSensorData = (room: string, roomLatestData: Record<string, DataPoint>) => {
  const latest = roomLatestData[room];
  if (latest && (latest.sensorTemperature !== null && latest.sensorTemperature !== undefined ||
    latest.sensorHumidity !== null && latest.sensorHumidity !== undefined)) {
    return latest;
  }
  return null;
};

export const getLastTargetData = (room: string, roomLatestData: Record<string, DataPoint>) => {
  const latest = roomLatestData[room];
  if (latest && latest.tadoTarget !== null && latest.tadoTarget !== undefined) {
    return latest;
  }
  return null;
};

export const getLastPowerData = (room: string, roomLatestData: Record<string, DataPoint>) => {
  const latest = roomLatestData[room];
  if (latest && latest.tadoPower !== null && latest.tadoPower !== undefined) {
    return latest;
  }
  return null;
};

export const getLastHumidityData = (room: string, roomLatestData: Record<string, DataPoint>) => {
  const latest = roomLatestData[room];
  if (latest && latest.sensorHumidity !== null && latest.sensorHumidity !== undefined) {
    return latest;
  }
  return null;
};

export const getAveragePower = (roomLatestData: Record<string, DataPoint>): number | null => {
  let totalPower = 0;
  let roomCount = 0;
  ROOMS.forEach((room) => {
    const powerData = getLastPowerData(room, roomLatestData);
    if (powerData?.tadoPower !== null && powerData?.tadoPower !== undefined) {
      totalPower += powerData.tadoPower;
      roomCount++;
    }
  });
  return roomCount === ROOMS.length ? totalPower / roomCount : null;
};

export const getAverageHumidity = (roomLatestData: Record<string, DataPoint>): number | null => {
  let totalHumidity = 0;
  let roomCount = 0;
  ROOMS.forEach((room) => {
    const humidityData = getLastHumidityData(room, roomLatestData);
    if (humidityData?.sensorHumidity !== null && humidityData?.sensorHumidity !== undefined) {
      totalHumidity += humidityData.sensorHumidity;
      roomCount++;
    }
  });
  return roomCount === ROOMS.length ? totalHumidity / roomCount : null;
};

export const getOutsideTemperatureStats = (
  roomData: Record<string, DataPoint[]>
): { current: number | null; min: number | null; max: number | null } => {
  const firstRoom = ROOMS[0];
  const roomDataPoints = roomData[firstRoom] || [];
  const outsideTemps = roomDataPoints
    .map(point => point.outsideTemperature)
    .filter((temp): temp is number => temp !== null && temp !== undefined && !isNaN(temp));

  if (outsideTemps.length === 0) {
    return { current: null, min: null, max: null };
  }

  const current = outsideTemps[outsideTemps.length - 1];
  const min = Math.min(...outsideTemps);
  const max = Math.max(...outsideTemps);

  return { current, min, max };
};

