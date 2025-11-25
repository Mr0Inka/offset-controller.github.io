import { useState, useCallback } from 'react';
import { DataPoint, Outside24hStats } from '../types';
import { getQueryApi, getINFLUXDB_BUCKET } from '../config/influxdb';
import { ROOM_SENSOR_MAP, ROOMS } from '../constants';
import { downsampleData } from '../utils/dataProcessing';

export const useInfluxData = (targetPoints: number) => {
  const [roomData, setRoomData] = useState<Record<string, DataPoint[]>>({});
  const [roomLatestData, setRoomLatestData] = useState<Record<string, DataPoint>>({});
  const [outside24hStats, setOutside24hStats] = useState<Outside24hStats>({ current: null, min: null, max: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoomData = useCallback(async (room: string, hours: number) => {
    try {
      const queryApi = getQueryApi();
      const bucket = getINFLUXDB_BUCKET();
      const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
      const sensorId = ROOM_SENSOR_MAP[room] || ROOM_SENSOR_MAP['Esszimmer'];
      const dataMap = new Map<string, DataPoint>();

      // Query for Tado sensor data
      const tadoQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startTime.toISOString()})
          |> filter(fn: (r) => r._measurement == "tado_sensor")
          |> filter(fn: (r) => r.room == "${room}")
          |> filter(fn: (r) => r.host == "Node_Tado")
      `;

      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(tadoQuery, {
          next(row, tableMeta) {
            const obj = tableMeta.toObject(row);
            const time = obj._time as string;

            if (!dataMap.has(time)) {
              dataMap.set(time, { time });
            }

            const point = dataMap.get(time)!;
            const field = obj._field as string;
            const value = obj._value as number;

            switch (field) {
              case 'temperature':
                point.tadoTemperature = value;
                break;
              case 'rawTemperature':
                point.tadoRawTemperature = value;
                break;
              case 'humidity':
                point.tadoHumidity = value;
                break;
              case 'target':
                point.tadoTarget = value;
                break;
              case 'offset':
                point.tadoOffset = value;
                break;
              case 'power':
                point.tadoPower = value;
                break;
            }
          },
          error(error) {
            console.error('Tado query error:', error);
            reject(error);
          },
          complete() {
            resolve();
          },
        });
      });

      // Query for sensor data (Xiaomi)
      const sensorQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startTime.toISOString()})
          |> filter(fn: (r) => r._measurement == "sensor_data")
          |> filter(fn: (r) => r.sensor_id == "${sensorId}")
          |> filter(fn: (r) => r.host == "Node_Tado")
      `;

      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(sensorQuery, {
          next(row, tableMeta) {
            const obj = tableMeta.toObject(row);
            const time = obj._time as string;

            if (!dataMap.has(time)) {
              dataMap.set(time, { time });
            }

            const point = dataMap.get(time)!;
            const field = obj._field as string;
            const value = obj._value as number;

            switch (field) {
              case 'temperature':
                point.sensorTemperature = value;
                break;
              case 'humidity':
                point.sensorHumidity = value;
                break;
              case 'rssi':
                point.sensorRssi = value;
                break;
              case 'battery':
                point.sensorBattery = value;
                break;
            }
          },
          error(error) {
            console.error('Sensor query error:', error);
            reject(error);
          },
          complete() {
            resolve();
          },
        });
      });

      // Query for outside temperature
      const outsideQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startTime.toISOString()})
          |> filter(fn: (r) => r._measurement == "outside")
          |> filter(fn: (r) => r.host == "Node_Tado")
          |> filter(fn: (r) => r._field == "temperature")
      `;

      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(outsideQuery, {
          next(row, tableMeta) {
            const obj = tableMeta.toObject(row);
            const time = obj._time as string;

            if (!dataMap.has(time)) {
              dataMap.set(time, { time });
            }

            dataMap.get(time)!.outsideTemperature = obj._value as number;
          },
          error(error) {
            console.error('Outside query error:', error);
            reject(error);
          },
          complete() {
            resolve();
          },
        });
      });

      // Convert map to array and sort by time
      const dataPoints = Array.from(dataMap.values());
      dataPoints.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

      // Downsample raw data (processing will happen in getRoomChartData)
      const downsampledData = downsampleData(dataPoints, targetPoints);

      setRoomData(prev => ({ ...prev, [room]: downsampledData }));

      // Update latest data only if we don't already have newer data
      if (dataPoints.length > 0) {
        const latest = dataPoints[dataPoints.length - 1];
        setRoomLatestData(prev => {
          const existing = prev[room];
          if (!existing || (latest.time && new Date(latest.time) > new Date(existing.time || 0))) {
            return { ...prev, [room]: latest };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(`Error fetching data for ${room}:`, err);
    }
  }, [targetPoints]);

  const fetchLatestRoomData = useCallback(async (room: string) => {
    try {
      const queryApi = getQueryApi();
      const bucket = getINFLUXDB_BUCKET();
      const sensorId = ROOM_SENSOR_MAP[room] || ROOM_SENSOR_MAP['Esszimmer'];
      const startTime = new Date(Date.now() - 10 * 60 * 1000); // Last 10 minutes

      const latestPoint: DataPoint = { time: new Date().toISOString() };
      let latestTime = new Date(0);
      let hasAnyData = false;

      // Query for latest Tado data
      const tadoQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startTime.toISOString()})
          |> filter(fn: (r) => r._measurement == "tado_sensor")
          |> filter(fn: (r) => r.room == "${room}")
          |> filter(fn: (r) => r.host == "Node_Tado")
      `;

      await new Promise<void>((resolve) => {
        let hasError = false;
        queryApi.queryRows(tadoQuery, {
          next(row, tableMeta) {
            try {
              const obj = tableMeta.toObject(row);
              const field = obj._field as string;
              const value = obj._value as number;
              const time = obj._time as string;

              const timeDiff = Date.now() - new Date(time).getTime();
              if (timeDiff <= 10 * 60 * 1000) {
                const rowTime = new Date(time);
                if (rowTime > latestTime) {
                  latestTime = rowTime;
                  latestPoint.time = time;
                  hasAnyData = true;
                }

                if (value !== null && value !== undefined && !isNaN(value)) {
                  switch (field) {
                    case 'temperature':
                      latestPoint.tadoTemperature = value;
                      break;
                    case 'target':
                      latestPoint.tadoTarget = value;
                      break;
                    case 'power':
                      latestPoint.tadoPower = value;
                      break;
                    case 'humidity':
                      latestPoint.tadoHumidity = value;
                      break;
                  }
                }
              }
            } catch (e) {
              // Ignore individual row errors
            }
          },
          error(error) {
            if (!hasError) {
              hasError = true;
              console.error('Latest Tado query error:', error);
              resolve();
            }
          },
          complete() {
            if (!hasError) {
              resolve();
            }
          },
        });
      });

      // Query for latest sensor data
      const sensorQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startTime.toISOString()})
          |> filter(fn: (r) => r._measurement == "sensor_data")
          |> filter(fn: (r) => r.sensor_id == "${sensorId}")
          |> filter(fn: (r) => r.host == "Node_Tado")
      `;

      await new Promise<void>((resolve) => {
        let hasError = false;
        queryApi.queryRows(sensorQuery, {
          next(row, tableMeta) {
            try {
              const obj = tableMeta.toObject(row);
              const field = obj._field as string;
              const value = obj._value as number;
              const time = obj._time as string;

              const timeDiff = Date.now() - new Date(time).getTime();
              if (timeDiff <= 10 * 60 * 1000) {
                const rowTime = new Date(time);
                if (rowTime > latestTime) {
                  latestTime = rowTime;
                  latestPoint.time = time;
                  hasAnyData = true;
                }

                if (value !== null && value !== undefined && !isNaN(value)) {
                  switch (field) {
                    case 'temperature':
                      latestPoint.sensorTemperature = value;
                      break;
                    case 'humidity':
                      latestPoint.sensorHumidity = value;
                      break;
                  }
                }
              }
            } catch (e) {
              // Ignore individual row errors
            }
          },
          error(error) {
            if (!hasError) {
              hasError = true;
              console.error('Latest sensor query error:', error);
              resolve();
            }
          },
          complete() {
            if (!hasError) {
              resolve();
            }
          },
        });
      });

      // Query for latest outside temperature (only for first room)
      if (room === ROOMS[0]) {
        const outsideQuery = `
          from(bucket: "${bucket}")
            |> range(start: ${startTime.toISOString()})
            |> filter(fn: (r) => r._measurement == "outside")
            |> filter(fn: (r) => r.host == "Node_Tado")
            |> filter(fn: (r) => r._field == "temperature")
        `;

        await new Promise<void>((resolve) => {
          let hasError = false;
          queryApi.queryRows(outsideQuery, {
            next(row, tableMeta) {
              try {
                const obj = tableMeta.toObject(row);
                const value = obj._value as number;
                const time = obj._time as string;

                const timeDiff = Date.now() - new Date(time).getTime();
                if (timeDiff <= 10 * 60 * 1000) {
                  const rowTime = new Date(time);
                  if (rowTime > latestTime) {
                    latestTime = rowTime;
                    latestPoint.time = time;
                    hasAnyData = true;
                  }
                  if (value !== null && value !== undefined && !isNaN(value)) {
                    latestPoint.outsideTemperature = value;
                  }
                }
              } catch (e) {
                // Ignore individual row errors
              }
            },
            error(error) {
              if (!hasError) {
                hasError = true;
                console.error('Latest outside query error:', error);
                resolve();
              }
            },
            complete() {
              if (!hasError) {
                resolve();
              }
            },
          });
        });
      }

      if (hasAnyData || Object.keys(latestPoint).length > 1) {
        setRoomLatestData(prev => ({ ...prev, [room]: latestPoint }));
      }
    } catch (err) {
      console.error(`Error fetching latest data for ${room}:`, err);
    }
  }, []);

  const fetchOutside24hStats = useCallback(async () => {
    try {
      const queryApi = getQueryApi();
      const bucket = getINFLUXDB_BUCKET();
      const startTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const outsideQuery = `
        from(bucket: "${bucket}")
          |> range(start: ${startTime.toISOString()})
          |> filter(fn: (r) => r._measurement == "outside")
          |> filter(fn: (r) => r.host == "Node_Tado")
          |> filter(fn: (r) => r._field == "temperature")
      `;

      const outsideTemps: number[] = [];
      let latestTemp: number | null = null;
      let latestTime = new Date(0);

      await new Promise<void>((resolve, reject) => {
        queryApi.queryRows(outsideQuery, {
          next(row, tableMeta) {
            const obj = tableMeta.toObject(row);
            const time = new Date(obj._time as string);
            const value = obj._value as number;

            if (value !== null && value !== undefined && !isNaN(value)) {
              outsideTemps.push(value);
              if (time > latestTime) {
                latestTime = time;
                latestTemp = value;
              }
            }
          },
          error(error) {
            console.error('Outside 24h query error:', error);
            reject(error);
          },
          complete() {
            resolve();
          },
        });
      });

      if (outsideTemps.length > 0) {
        const min = Math.min(...outsideTemps);
        const max = Math.max(...outsideTemps);
        setOutside24hStats({ current: latestTemp, min, max });
      } else {
        setOutside24hStats({ current: null, min: null, max: null });
      }
    } catch (err) {
      console.error('Error fetching outside 24h stats:', err);
    }
  }, []);

  return {
    roomData,
    roomLatestData,
    outside24hStats,
    loading,
    error,
    setLoading,
    setError,
    fetchRoomData,
    fetchLatestRoomData,
    fetchOutside24hStats,
  };
};

