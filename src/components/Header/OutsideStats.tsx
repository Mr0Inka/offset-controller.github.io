interface OutsideStatsProps {
  stats: { current: number | null; min: number | null; max: number | null };
  onClick: () => void;
}

export const OutsideStats = ({ stats, onClick }: OutsideStatsProps) => {
  return (
    <div className="outside-stats-header">
      <div className="outside-text" onClick={onClick} style={{ cursor: 'pointer' }}>
        <span className="outside-label">Outside:</span>
        {stats.current !== null && (
          <span className="outside-value">{stats.current.toFixed(1)}°C</span>
        )}
        {stats.min !== null && stats.max !== null && (
          <>
            <span className="outside-separator">|</span>
            <span className="outside-label-gray">Min</span>
            <span className="outside-value-min-max">{stats.min.toFixed(1)}°C</span>
            <span className="outside-separator">-</span>
            <span className="outside-label-gray">Max</span>
            <span className="outside-value-min-max">{stats.max.toFixed(1)}°C</span>
          </>
        )}
      </div>
    </div>
  );
};

