import { DataPoint } from '../../types';
import { TIME_RANGES } from '../../constants';
import { ChartSkeleton } from '../Chart/ChartSkeleton';
import { TemperatureChart } from '../Chart/TemperatureChart';

interface RoomModalProps {
  room: string;
  isClosing: boolean;
  onClose: () => void;
  hours: number;
  onHoursChange: (hours: number) => void;
  isLoading: boolean;
  chartData: DataPoint[];
  getLastSensorData: (room: string) => DataPoint | null;
  getLastTargetData: (room: string) => DataPoint | null;
  getLastPowerData: (room: string) => DataPoint | null;
}

export const RoomModal = ({
  room,
  isClosing,
  onClose,
  hours,
  onHoursChange,
  isLoading,
  chartData,
  getLastSensorData,
  getLastTargetData,
  getLastPowerData,
}: RoomModalProps) => {
  const roomLastSensorData = getLastSensorData(room);
  const roomLastTargetData = getLastTargetData(room);
  const roomLastPowerData = getLastPowerData(room);

  return (
    <div
      className={`room-modal-overlay ${isClosing ? 'closing' : ''}`}
      onClick={onClose}
    >
      <div className="room-modal-wrapper">
        <h2 className="room-modal-title-floating" style={{ color: 'var(--accent-primary)' }}>
          {room}
        </h2>
        <div className={`room-modal ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div className="room-modal-stats">
            <div className="room-modal-stats-grid">
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Temp</span>
                <span className="room-modal-stat-value">
                  {roomLastSensorData?.sensorTemperature?.toFixed(1) || 'N/A'}°C
                </span>
              </div>
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Target</span>
                <span className="room-modal-stat-value">
                  {roomLastTargetData?.tadoTarget?.toFixed(1) || 'N/A'}
                </span>
              </div>
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Humidity</span>
                <span
                  className="room-modal-stat-value"
                  style={{
                    color: roomLastSensorData?.sensorHumidity
                      ? roomLastSensorData.sensorHumidity > 70
                        ? '#FCA5A5'
                        : roomLastSensorData.sensorHumidity > 60
                          ? '#FCD34D'
                          : '#86EFAC'
                      : 'var(--text-primary)'
                  }}
                >
                  {roomLastSensorData?.sensorHumidity?.toFixed(1) || 'N/A'}%
                </span>
              </div>
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Power</span>
                <span className="room-modal-stat-value">
                  {roomLastPowerData?.tadoPower?.toFixed(0) || '0'}%
                </span>
              </div>
            </div>
          </div>
          <div className="room-modal-time-range">
            <div className="time-range-buttons">
              {TIME_RANGES.map((range) => (
                <button
                  key={range.label}
                  className={`time-range-btn ${hours === range.hours ? 'active' : ''}`}
                  onClick={() => onHoursChange(range.hours)}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
          <div className="room-modal-content">
            {isLoading ? (
              <ChartSkeleton height={500} />
            ) : (
              <TemperatureChart data={chartData} room={room} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

