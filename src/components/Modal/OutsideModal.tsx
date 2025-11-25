import { DataPoint } from '../../types';
import { TIME_RANGES } from '../../constants';
import { ChartSkeleton } from '../Chart/ChartSkeleton';
import { OutsideChart } from '../Chart/OutsideChart';

interface OutsideModalProps {
  isOpen: boolean;
  onClose: () => void;
  hours: number;
  onHoursChange: (hours: number) => void;
  isLoading: boolean;
  chartData: DataPoint[];
  stats: { current: number | null; min: number | null; max: number | null };
}

export const OutsideModal = ({
  isOpen,
  onClose,
  hours,
  onHoursChange,
  isLoading,
  chartData,
  stats,
}: OutsideModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="room-modal-overlay" onClick={onClose}>
      <div className="room-modal-wrapper">
        <h2 className="room-modal-title-floating" style={{ color: 'var(--accent-primary)' }}>
          Outside Temperature
        </h2>
        <div className="room-modal" onClick={(e) => e.stopPropagation()}>
          <div className="room-modal-stats">
            <div className="room-modal-stats-grid">
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Current</span>
                <span className="room-modal-stat-value">
                  {stats.current !== null ? `${stats.current.toFixed(1)}°C` : 'N/A'}
                </span>
              </div>
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Min</span>
                <span className="room-modal-stat-value">
                  {stats.min !== null ? `${stats.min.toFixed(1)}°C` : 'N/A'}
                </span>
              </div>
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Max</span>
                <span className="room-modal-stat-value">
                  {stats.max !== null ? `${stats.max.toFixed(1)}°C` : 'N/A'}
                </span>
              </div>
              <div className="room-modal-stat">
                <span className="room-modal-stat-label">Range</span>
                <span className="room-modal-stat-value">
                  {stats.min !== null && stats.max !== null
                    ? `${(stats.max - stats.min).toFixed(1)}°C`
                    : 'N/A'}
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
              <OutsideChart data={chartData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

