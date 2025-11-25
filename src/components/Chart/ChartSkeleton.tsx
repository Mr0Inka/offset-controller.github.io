interface ChartSkeletonProps {
  height?: number;
}

export const ChartSkeleton = ({ height = 400 }: ChartSkeletonProps) => (
  <div className="chart-skeleton" style={{ height }}>
    <div className="skeleton-shimmer"></div>
  </div>
);

