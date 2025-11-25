import { OutsideStats } from './OutsideStats';
import { AvgPowerBars } from './AvgPowerBars';

interface HeaderProps {
  onSettingsClick: () => void;
  onRefreshClick: () => void;
  refreshKey: number;
  loading: boolean;
  outside24hStats: { current: number | null; min: number | null; max: number | null };
  onOutsideClick: () => void;
  averagePower: number | null;
  averageHumidity: number | null;
}

export const Header = ({
  onSettingsClick,
  onRefreshClick,
  refreshKey,
  loading,
  outside24hStats,
  onOutsideClick,
  averagePower,
  averageHumidity,
}: HeaderProps) => {
  return (
    <header className="header">
      <div className="header-top">
        <h1>Offset Controller</h1>
        <div className="header-actions">
          <button
            className="settings-button"
            onClick={onSettingsClick}
            aria-label="Open settings"
            title="Settings"
          >
            <img src="/settings.svg" alt="Settings" width="20" height="20" style={{ filter: 'none' }} />
          </button>
          <button
            key={refreshKey}
            className="refresh-button"
            data-refreshing={loading ? "true" : "false"}
            onClick={onRefreshClick}
            aria-label="Refresh data"
            title="Refresh data"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
              <path d="M21 3v5h-5"></path>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
              <path d="M3 21v-5h5"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="controls">
        <OutsideStats stats={outside24hStats} onClick={onOutsideClick} />
        <AvgPowerBars averagePower={averagePower} averageHumidity={averageHumidity} />
      </div>
    </header>
  );
};

