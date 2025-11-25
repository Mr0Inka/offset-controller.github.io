interface PowerIndicatorProps {
  power: number | null | undefined;
}

export const PowerIndicator = ({ power }: PowerIndicatorProps) => {
  const powerValue = power || 0;
  const isZero = powerValue === 0;
  const animationDuration = isZero
    ? '4s'
    : `${Math.max(1.5, 4 - (powerValue / 100) * 2.5)}s`;

  return (
    <div className="room-power-indicator">
      <div
        className={`room-power-bar ${isZero ? 'power-zero' : 'power-active'}`}
        style={{
          '--animation-duration': animationDuration,
        } as React.CSSProperties}
      >
        {!isZero &&
          Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="power-light"
              style={{
                '--light-delay': `${i * (1 / 6)}`,
              } as React.CSSProperties}
            />
          ))}
      </div>
    </div>
  );
};

