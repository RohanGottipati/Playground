"use client";

const PALETTE = ["#0068c9", "#34c759", "#ff9500", "#af52de", "#ff3b30", "#5ac8fa"];

export type DonutDatum = { label: string; count: number };

export function DonutChart({
  data,
  emptyMessage,
}: {
  data: DonutDatum[];
  emptyMessage: string;
}) {
  const total = data.reduce((sum, row) => sum + row.count, 0);

  if (total === 0) {
    return <p className="font-inter text-xs text-appleGray">{emptyMessage}</p>;
  }

  const size = 160;
  const radius = 60;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  let offsetSoFar = 0;

  const segments = data
    .filter((row) => row.count > 0)
    .slice(0, 6)
    .map((row, index) => {
      const fraction = row.count / total;
      const dash = fraction * circumference;
      const segment = {
        ...row,
        color: PALETTE[index % PALETTE.length],
        dashArray: `${dash} ${circumference - dash}`,
        dashOffset: -offsetSoFar,
        percent: fraction * 100,
      };
      offsetSoFar += dash;
      return segment;
    });

  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} className="h-40 w-40 shrink-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#ffffff" strokeWidth={strokeWidth} />
        {segments.map((segment) => (
          <circle
            key={segment.label}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.dashArray}
            strokeDashoffset={segment.dashOffset}
            strokeLinecap="butt"
          >
            <title>{`${segment.label}: ${segment.percent.toFixed(1)}%`}</title>
          </circle>
        ))}
      </svg>
      <ul className="min-w-0 flex-1 space-y-1.5 font-inter text-[11px] text-appleGray">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: segment.color }}
              aria-hidden
            />
            <span className="truncate">{segment.label}</span>
            <span className="ml-auto text-appleInk">{segment.percent.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
