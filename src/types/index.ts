export interface DataPoint {
  time: string;
  tadoTemperature?: number;
  tadoRawTemperature?: number;
  tadoHumidity?: number;
  tadoTarget?: number;
  tadoOffset?: number;
  tadoPower?: number;
  sensorTemperature?: number;
  sensorHumidity?: number;
  sensorHumidityMapped?: number; // Humidity mapped to temperature scale
  sensorRssi?: number;
  sensorBattery?: number;
  outsideTemperature?: number;
}

export interface Outside24hStats {
  current: number | null;
  min: number | null;
  max: number | null;
}

export interface TimeRange {
  label: string;
  hours: number;
}

