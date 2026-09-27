import React, { useState } from 'react';
import { ProgressDataPoint } from '../types/database';

interface ProgressChartProps {
  dataPoints: ProgressDataPoint[];
  exerciseName: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  dataPoints,
  exerciseName,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (dataPoints.length === 0) {
    return (
      <div className="h-64 rounded-2xl bg-[#11141c] border border-[#202636] flex flex-col items-center justify-center p-6 text-center">
        <p className="text-zinc-400 text-sm font-medium">No workout data logged yet</p>
        <p className="text-zinc-500 text-xs mt-1">
          Complete workouts with {exerciseName} to visualize your strength curve.
        </p>
      </div>
    );
  }

  // SVG Chart Dimensions
  const width = 600;
  const height = 240;
  const paddingX = 40;
  const paddingTop = 36;
  const paddingBottom = 40;

  const weights = dataPoints.map((p) => p.weight);
  const minWeight = Math.max(0, Math.min(...weights) - 5);
  const maxWeight = Math.max(...weights) + 5;
  const weightRange = maxWeight - minWeight || 1;

  // Compute (x, y) coordinates for each point
  const points = dataPoints.map((p, i) => {
    const x =
      dataPoints.length === 1
        ? width / 2
        : paddingX + (i / (dataPoints.length - 1)) * (width - 2 * paddingX);
    const y =
      paddingTop +
      (1 - (p.weight - minWeight) / weightRange) *
        (height - paddingTop - paddingBottom);
    return { x, y, data: p };
  });

  // Construct SVG path
  const linePath = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
  }, '');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x},${height - paddingBottom} L ${points[0].x},${height - paddingBottom} Z`
      : '';

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : points[points.length - 1];

  return (
    <div className="bg-[#11141c] border border-[#202636] rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          Weight Progression
        </span>
        {activePoint && (
          <div className="text-xs text-[#00f59b] font-mono font-bold">
            {activePoint.data.formattedDate}: {activePoint.data.weight}kg × {activePoint.data.reps} (e1RM ~{activePoint.data.estimated1RM}kg)
          </div>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00f59b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#00f59b" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#00f59b" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio) => {
            const y = paddingTop + ratio * (height - paddingTop - paddingBottom);
            const val = Math.round(maxWeight - ratio * weightRange);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1c2230"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#71717a"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val}kg
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {points.length > 1 && (
            <path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* Line stroke */}
          {points.length > 1 && (
            <path
              d={linePath}
              fill="none"
              stroke="#00f59b"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />
          )}

          {/* Data Points and values */}
          {points.map((pt, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g
                key={i}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => setHoveredIndex(i)}
              >
                {/* Invisible larger hit target for touch */}
                <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                {/* Point ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '7' : '5'}
                  fill="#0b0d11"
                  stroke="#00f59b"
                  strokeWidth={isHovered ? '3' : '2.5'}
                />

                {/* Value Label above point */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  fill={isHovered ? '#00f59b' : '#e4e4e7'}
                  fontSize="11"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {pt.data.weight}kg
                </text>

                {/* X axis date label */}
                <text
                  x={pt.x}
                  y={height - paddingBottom + 18}
                  fill={isHovered ? '#ffffff' : '#71717a'}
                  fontSize="10"
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  textAnchor="middle"
                >
                  {pt.data.formattedDate}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
