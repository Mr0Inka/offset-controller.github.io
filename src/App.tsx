import { useState, useEffect, useRef } from 'react';
import './App.css';

import { ROOMS } from './constants';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useInfluxData } from './hooks/useInfluxData';
import {
  getLastSensorData,
  getLastTargetData,
  getLastPowerData,
  getAveragePower,
  getAverageHumidity,
  getOutsideTemperatureStats,
} from './utils/roomHelpers';
import { processChartData } from './utils/dataProcessing';

import { SplashScreen } from './components/SplashScreen/SplashScreen';
import { Setup } from './components/Setup/Setup';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { RoomCard } from './components/RoomCard/RoomCard';
import { RoomModal } from './components/Modal/RoomModal';
import { OutsideModal } from './components/Modal/OutsideModal';

function App() {
  const [hours, setHours] = useState(24);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [showOutsideModal, setShowOutsideModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [splashHiding, setSplashHiding] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [targetPoints, setTargetPoints] = useLocalStorage('targetPoints', 1440);
  const [graphLoading, setGraphLoading] = useState<Record<string, boolean>>({});
  const [modalClosing, setModalClosing] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  // Check if InfluxDB credentials are configured
  useEffect(() => {
    const token = localStorage.getItem('influxdb_token');
    const org = localStorage.getItem('influxdb_org');
    const bucket = localStorage.getItem('influxdb_bucket');
    const url = localStorage.getItem('influxdb_url');

    if (token && org && bucket && url) {
      setIsConfigured(true);
    }
  }, []);

  const {
    roomData,
    roomLatestData,
    outside24hStats,
    loading,
    error,
    setLoading,
    fetchRoomData,
    fetchLatestRoomData,
    fetchOutside24hStats,
  } = useInfluxData(targetPoints);

  // Initial data fetch (during splash) for latest values
  useEffect(() => {
    if (!isConfigured) return;

    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          ...ROOMS.map(room => fetchLatestRoomData(room)),
          fetchOutside24hStats(),
        ]);
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [isConfigured]);

  // Auto-refresh latest values every 5 seconds
  useEffect(() => {
    if (!isConfigured) return;

    const interval = setInterval(() => {
      Promise.all([
        ...ROOMS.map(room => fetchLatestRoomData(room)),
        fetchOutside24hStats(),
      ]);
    }, 5000);
    return () => clearInterval(interval);
  }, [isConfigured]);

  // Fetch graph data when a room modal is opened
  useEffect(() => {
    if (expandedRoom && !roomData[expandedRoom]) {
      setGraphLoading(prev => ({ ...prev, [expandedRoom]: true }));
      fetchRoomData(expandedRoom, hours)
        .then(() => setGraphLoading(prev => ({ ...prev, [expandedRoom]: false })))
        .catch(() => setGraphLoading(prev => ({ ...prev, [expandedRoom]: false })));
    }
  }, [expandedRoom, fetchRoomData, hours]);

  // Fetch graph data when hours change and a modal is open
  const hasInitiallyLoaded = useRef(false);
  useEffect(() => {
    if (!loading && Object.keys(roomData).length > 0 && !hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
    }
  }, [loading, roomData]);

  useEffect(() => {
    if (expandedRoom && hasInitiallyLoaded.current) {
      setGraphLoading(prev => ({ ...prev, [expandedRoom]: true }));
      fetchRoomData(expandedRoom, hours)
        .then(() => setGraphLoading(prev => ({ ...prev, [expandedRoom]: false })))
        .catch(() => setGraphLoading(prev => ({ ...prev, [expandedRoom]: false })));
    }
  }, [hours, expandedRoom, fetchRoomData]);

  // Hide splash after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashHiding(true);
      setTimeout(() => {
        setShowSplash(false);
      }, 500);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (expandedRoom || showOutsideModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expandedRoom, showOutsideModal]);

  // Helper functions for room data
  const getRoomChartData = (room: string) => {
    const roomDataPoints = roomData[room] || [];
    return processChartData(roomDataPoints);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    Promise.all([
      ...ROOMS.map(room => fetchLatestRoomData(room)),
      fetchOutside24hStats(),
    ]).then(() => {
      setTimeout(() => setRefreshKey(prev => prev + 1), 600);
    });
  };

  const handleRoomExpand = (room: string) => {
    if (expandedRoom === room) {
      setModalClosing(true);
      setTimeout(() => {
        setExpandedRoom(null);
        setModalClosing(false);
      }, 300);
    } else {
      setExpandedRoom(room);
    }
  };

  const handleModalClose = () => {
    setModalClosing(true);
    setTimeout(() => {
      setExpandedRoom(null);
      setModalClosing(false);
    }, 300);
  };

  // Wrapper functions for room helpers
  const getLastSensorDataWrapper = (room: string) => getLastSensorData(room, roomLatestData);
  const getLastTargetDataWrapper = (room: string) => getLastTargetData(room, roomLatestData);
  const getLastPowerDataWrapper = (room: string) => getLastPowerData(room, roomLatestData);

  const averagePower = getAveragePower(roomLatestData);
  const averageHumidity = getAverageHumidity(roomLatestData);
  const outsideStats = getOutsideTemperatureStats(roomData);

  const handleSetupComplete = () => {
    setIsConfigured(true);
  };

  // Show setup screen if not configured
  if (!isConfigured) {
    return <Setup onSetupComplete={handleSetupComplete} />;
  }

  return (
    <div className="app">
      {showSplash && <SplashScreen hiding={splashHiding} />}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        targetPoints={targetPoints}
        onTargetPointsChange={setTargetPoints}
      />

      <Header
        onSettingsClick={() => setSidebarOpen(!sidebarOpen)}
        onRefreshClick={handleRefresh}
        refreshKey={refreshKey}
        loading={loading}
        outside24hStats={outside24hStats}
        onOutsideClick={() => setShowOutsideModal(true)}
        averagePower={averagePower}
        averageHumidity={averageHumidity}
      />

      {error && (
        <div className="error">
          Error: {error}
        </div>
      )}

      <div className="rooms-overview">
        {ROOMS.map((room) => {
          const isExpanded = expandedRoom === room;
          const isRoomLoading = !roomLatestData[room];

          return (
            <RoomCard
              key={room}
              room={room}
              roomLatestData={roomLatestData}
              isExpanded={isExpanded}
              isLoading={isRoomLoading}
              onExpand={() => handleRoomExpand(room)}
              getLastSensorData={getLastSensorDataWrapper}
              getLastTargetData={getLastTargetDataWrapper}
              getLastPowerData={getLastPowerDataWrapper}
            />
          );
        })}
      </div>

      {expandedRoom && (
        <RoomModal
          room={expandedRoom}
          isClosing={modalClosing}
          onClose={handleModalClose}
          hours={hours}
          onHoursChange={setHours}
          isLoading={graphLoading[expandedRoom] || !roomData[expandedRoom] || getRoomChartData(expandedRoom).length === 0}
          chartData={getRoomChartData(expandedRoom)}
          getLastSensorData={getLastSensorDataWrapper}
          getLastTargetData={getLastTargetDataWrapper}
          getLastPowerData={getLastPowerDataWrapper}
        />
      )}

      <OutsideModal
        isOpen={showOutsideModal}
        onClose={() => setShowOutsideModal(false)}
        hours={hours}
        onHoursChange={setHours}
        isLoading={loading || !roomData[ROOMS[0]] || getRoomChartData(ROOMS[0]).length === 0}
        chartData={getRoomChartData(ROOMS[0])}
        stats={outsideStats}
      />
    </div>
  );
}

export default App;
