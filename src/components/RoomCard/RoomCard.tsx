import { DataPoint } from '../../types';
import { PowerIndicator } from './PowerIndicator';

interface RoomCardProps {
  room: string;
  roomLatestData: Record<string, DataPoint>;
  isExpanded: boolean;
  isLoading: boolean;
  onExpand: () => void;
  getLastSensorData: (room: string) => DataPoint | null;
  getLastTargetData: (room: string) => DataPoint | null;
  getLastPowerData: (room: string) => DataPoint | null;
}

export const RoomCard = ({
  room,
  roomLatestData,
  isExpanded,
  isLoading,
  onExpand,
  getLastSensorData,
  getLastTargetData,
  getLastPowerData,
}: RoomCardProps) => {
  const roomLastSensorData = getLastSensorData(room);
  const roomLastTargetData = getLastTargetData(room);
  const roomLastPowerData = getLastPowerData(room);

  return (
    <div className="room-card">
      <div
        className="room-bar"
        onClick={onExpand}
        style={{
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div className="room-bar-header">
          <span className="room-name">{room}</span>
          <PowerIndicator power={roomLastPowerData?.tadoPower} />
          <span className="room-expand-icon">{isExpanded ? '▼' : '▶'}</span>
        </div>
        <div className="room-bar-content">
          <div className="room-bar-stats">
            {isLoading ? (
              <>
                <div className="room-bar-stat skeleton-stat"></div>
                <div className="room-bar-stat skeleton-stat"></div>
                <div className="room-bar-stat skeleton-stat"></div>
                <div className="room-bar-stat skeleton-stat"></div>
              </>
            ) : (
              <>
                <div className="room-bar-stat">
                  <span className="room-bar-label">Temp</span>
                  <span className="room-bar-value">{roomLastSensorData?.sensorTemperature?.toFixed(1) || 'N/A'}°C</span>
                </div>
                <div className="room-bar-stat">
                  <span className="room-bar-label">Target</span>
                  <span className="room-bar-value">{roomLastTargetData?.tadoTarget?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="room-bar-stat">
                  <span className="room-bar-label">Humidity</span>
                  <span
                    className="room-bar-value"
                    style={{
                      color: roomLastSensorData?.sensorHumidity
                        ? roomLastSensorData.sensorHumidity > 70
                          ? '#FCA5A5' // Pastell-Rot
                          : roomLastSensorData.sensorHumidity > 60
                            ? '#FCD34D' // Pastell-Orange
                            : '#86EFAC' // Pastell-Grün
                        : 'var(--text-primary)'
                    }}
                  >
                    {roomLastSensorData?.sensorHumidity?.toFixed(1) || 'N/A'}%
                  </span>
                </div>
                <div className="room-bar-stat">
                  <span className="room-bar-label">Power</span>
                  <span className="room-bar-value">{roomLastPowerData?.tadoPower?.toFixed(0) || '0'}%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

