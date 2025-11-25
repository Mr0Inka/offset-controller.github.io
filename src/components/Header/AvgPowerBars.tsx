interface AvgPowerBarsProps {
  averagePower: number | null;
  averageHumidity: number | null;
}

export const AvgPowerBars = ({ averagePower, averageHumidity }: AvgPowerBarsProps) => {
  const renderPowerBar = (value: number | null, label: string) => {
    return (
      <div className="header-power-bar">
        <div className="power-bar-label">{label}</div>
        <div className="power-bar-container">
          {Array.from({ length: 10 }, (_, i) => {
            const segmentValue = (i + 1) * 10;
            const isActive = value !== null && value >= segmentValue;
            let segmentColor = 'rgba(255, 255, 255, 0.08)';
            if (isActive && value !== null) {
              if (value >= 80) {
                segmentColor = '#FCA5A5'; // Pastell-Rot
              } else if (value >= 70) {
                segmentColor = '#FCD34D'; // Pastell-Orange/Gelb
              } else {
                segmentColor = '#86EFAC'; // Pastell-Grün
              }
            }
            return (
              <div
                key={i}
                className={`power-bar-segment ${isActive ? 'active' : ''}`}
                style={{ backgroundColor: segmentColor }}
              />
            );
          })}
        </div>
        <div className="power-bar-value">{value !== null ? `${value.toFixed(0)}%` : 'N/A'}</div>
      </div>
    );
  };

  return (
    <div className="header-power-bars">
      {renderPowerBar(averagePower, 'Avg. Power')}
      {renderPowerBar(averageHumidity, 'Avg. Humidity')}
    </div>
  );
};

