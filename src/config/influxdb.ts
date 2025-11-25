import { InfluxDB } from '@influxdata/influxdb-client';

// Helper functions to get InfluxDB config from localStorage
export const getInfluxDBConfig = () => {
  const url = localStorage.getItem('influxdb_url') || 'https://us-east-1-1.aws.cloud2.influxdata.com';
  const token = localStorage.getItem('influxdb_token') || '';
  const org = localStorage.getItem('influxdb_org') || '';
  const bucket = localStorage.getItem('influxdb_bucket') || 'temp_sensor';
  
  return { url, token, org, bucket };
};

// Get config values
export const getINFLUXDB_URL = () => getInfluxDBConfig().url;
export const getINFLUXDB_TOKEN = () => getInfluxDBConfig().token;
export const getINFLUXDB_ORG = () => getInfluxDBConfig().org;
export const getINFLUXDB_BUCKET = () => getInfluxDBConfig().bucket;

// Create client and query API dynamically
export const getInfluxDBClient = () => {
  const { url, token } = getInfluxDBConfig();
  return new InfluxDB({ url, token });
};

export const getQueryApi = () => {
  const { org } = getInfluxDBConfig();
  return getInfluxDBClient().getQueryApi(org);
};

