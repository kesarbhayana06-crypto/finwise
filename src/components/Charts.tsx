import React, { useState } from 'react';
import { formatINR } from '../utils/finance';

export interface PillBarPoint {
  label: string;
  income: number;
  expenses: number;
  savings: number;
}

export function PillCashflowChart({
  data,
  mode = 'cashflow',
}: {
  data: PillBarPoint[];
  mode?: 'cashflow' | 'expenses';
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxVal = Math.max(
    1,
    ...data.map((d) => Math.max(d.income, d.expenses))
  );

  const activePoint = hoveredIdx !== null ? data[hoveredIdx] : data[data.length - 1];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          {mode === 'cashflow' ? (
            <>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-400" />
                Income
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                Savings
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                Expenses
              </span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-violet-400" />
              Monthly Expenses (INR)
            </span>
          )}
        </div>
        {activePoint && (
          <div className="font-mono tabular-nums text-slate-200">
            {activePoint.label}:{' '}
            <span className="text-indigo-300">{formatINR(activePoint.income)}</span>
            <span className="text-slate-600 mx-1.5">·</span>
            <span className="text-slate-300">Spent {formatINR(activePoint.expenses)}</span>
            <span className="text-slate-600 mx-1.5">·</span>
            <span className="text-emerald-400">Saved {formatINR(activePoint.savings)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-6 gap-3 sm:gap-5 items-end h-52 pt-4">
        {data.map((point, idx) => {
          const incomeH = Math.max(18, Math.round((point.income / maxVal) * 100));
          const expenseH = Math.max(12, Math.round((point.expenses / maxVal) * 100));
          const savingsH = Math.max(10, Math.round((point.savings / maxVal) * 100));
          const isHovered = hoveredIdx === idx;

          return (
            <button
              key={point.label}
              type="button"
              onMouseEnter={() => setHoveredIdx(idx)}
              onFocus={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="group flex flex-col items-center gap-2.5 h-full justify-end focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-xl p-1"
              aria-label={`${point.label}: Income ${formatINR(point.income)}, Expenses ${formatINR(point.expenses)}`}
            >
              <div className="relative w-full max-w-[44px] h-40 rounded-full bg-white/[0.04] border border-white/[0.06] overflow-hidden flex items-end justify-center p-1">
                {mode === 'cashflow' ? (
                  <div className="relative w-full h-full flex items-end justify-center gap-1">
                    <div
                      className={`w-1/2 rounded-full transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-indigo-500 to-violet-400'
                          : 'bg-gradient-to-t from-indigo-600/80 to-violet-400/80'
                      }`}
                      style={{ height: `${incomeH}%` }}
                    />
                    <div
                      className={`w-1/2 rounded-full transition-all duration-300 ${
                        isHovered
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-300'
                          : 'bg-gradient-to-t from-emerald-600/80 to-emerald-400/80'
                      }`}
                      style={{ height: `${savingsH}%` }}
                    />
                  </div>
                ) : (
                  <div
                    className={`w-full rounded-full transition-all duration-300 ${
                      isHovered
                        ? 'bg-gradient-to-t from-violet-500 to-indigo-400'
                        : 'bg-gradient-to-t from-violet-600/75 to-indigo-400/75'
                    }`}
                    style={{ height: `${expenseH}%` }}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium transition-colors ${
                  isHovered ? 'text-white' : 'text-slate-400'
                }`}
              >
                {point.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function SpendingDonutChart({
  slices,
  centerLabel = 'Total Spent',
}: {
  slices: DonutSlice[];
  centerLabel?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const nonZero = slices.filter((s) => s.value > 0);
  const total = nonZero.reduce((sum, s) => sum + s.value, 0);

  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let cumulative = 0;
  const segments = nonZero.map((slice) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const dashLength = fraction * circumference;
    const dashOffset = -cumulative * circumference;
    cumulative += fraction;
    return {
      ...slice,
      fraction,
      dashLength,
      dashOffset,
    };
  });

  const activeSlice = activeIndex !== null ? segments[activeIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 176 176" className="w-full h-full -rotate-90">
          <circle
            cx="88"
            cy="88"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
          />
          {segments.map((seg, i) => {
            const isActive = activeIndex === i;
            return (
              <circle
                key={seg.label}
                cx="88"
                cy="88"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={isActive ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${Math.max(0, seg.dashLength - 3)} ${circumference}`}
                strokeDashoffset={seg.dashOffset}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <span className="text-[11px] text-slate-400 truncate max-w-[100px]">
            {activeSlice ? activeSlice.label : centerLabel}
          </span>
          <span className="text-lg font-bold font-mono tabular-nums text-white mt-0.5">
            {formatINR(activeSlice ? activeSlice.value : total)}
          </span>
          {activeSlice && (
            <span className="text-[11px] text-emerald-400 font-mono tabular-nums">
              {Math.round(activeSlice.fraction * 100)}%
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 w-full space-y-2.5">
        {segments.slice(0, 6).map((seg, i) => {
          const pct = Math.round(seg.fraction * 100);
          return (
            <div
              key={seg.label}
              onMouseEnter={() => setActiveIndex(i)}
              onMouseLeave={() => setActiveIndex(null)}
              className={`flex items-center justify-between gap-3 text-sm py-1 px-2 rounded-lg transition-colors cursor-default ${
                activeIndex === i ? 'bg-white/[0.06]' : ''
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-slate-300 truncate">{seg.label}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono tabular-nums">
                <span className="text-xs text-slate-400">{pct}%</span>
                <span className="text-slate-100 font-medium">{formatINR(seg.value)}</span>
              </div>
            </div>
          );
        })}
        {segments.length === 0 && (
          <p className="text-sm text-slate-400">No expenses logged yet.</p>
        )}
      </div>
    </div>
  );
}

export function RadialGauge({
  value,
  max = 100,
  size = 96,
  strokeWidth = 9,
  color = '#818cf8',
  label,
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (pct / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono tabular-nums font-bold text-white text-base leading-none">
          {label ?? `${Math.round(pct)}%`}
        </span>
      </div>
    </div>
  );
}

export interface ProjectionSeriesPoint {
  label: string;
  baseline: number;
  improved: number;
}

export function DualProjectionChart({
  data,
  baselineLabel = 'Current Path',
  improvedLabel = 'Improved Path',
}: {
  data: ProjectionSeriesPoint[];
  baselineLabel?: string;
  improvedLabel?: string;
}) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const width = 680;
  const height = 240;
  const padX = 48;
  const padY = 26;

  const maxVal = Math.max(100, ...data.flatMap((d) => [d.baseline, d.improved]));

  const getX = (i: number) =>
    data.length <= 1 ? padX : padX + (i / (data.length - 1)) * (width - padX * 2);
  const getY = (val: number) =>
    height - padY - (val / maxVal) * (height - padY * 2);

  const baselinePath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.baseline)}`)
    .join(' ');
  const improvedPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.improved)}`)
    .join(' ');

  const improvedArea = `${improvedPath} L ${getX(data.length - 1)} ${height - padY} L ${getX(0)} ${height - padY} Z`;
  const baselineArea = `${baselinePath} L ${getX(data.length - 1)} ${height - padY} L ${getX(0)} ${height - padY} Z`;

  const active = hoverIdx !== null ? data[hoverIdx] : data[data.length - 1];

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
        <div className="flex items-center gap-5 text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 bg-emerald-400 rounded-full" />
            {improvedLabel}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3 h-0.5 bg-indigo-400 rounded-full" />
            {baselineLabel}
          </span>
        </div>
        {active && (
          <div className="font-mono tabular-nums text-slate-200">
            <span className="text-slate-400 mr-2">{active.label}:</span>
            <span className="text-emerald-400">{formatINR(active.improved)}</span>
            <span className="text-slate-600 mx-2">vs</span>
            <span className="text-indigo-300">{formatINR(active.baseline)}</span>
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-60 overflow-visible">
          <defs>
            <linearGradient id="finwise-improved-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="finwise-base-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padY + t * (height - padY * 2);
            return (
              <line
                key={t}
                x1={padX}
                y1={y}
                x2={width - padX}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            );
          })}

          <path d={baselineArea} fill="url(#finwise-base-grad)" />
          <path d={improvedArea} fill="url(#finwise-improved-grad)" />

          <path
            d={baselinePath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={improvedPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((d, i) => {
            const x = getX(i);
            const yBase = getY(d.baseline);
            const yImp = getY(d.improved);
            const isHover = hoverIdx === i;
            return (
              <g
                key={d.label}
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
                className="cursor-pointer"
              >
                <rect
                  x={x - 22}
                  y={padY}
                  width={44}
                  height={height - padY * 2}
                  fill="transparent"
                />
                {isHover && (
                  <line
                    x1={x}
                    y1={padY}
                    x2={x}
                    y2={height - padY}
                    stroke="rgba(255,255,255,0.16)"
                  />
                )}
                <circle
                  cx={x}
                  cy={yBase}
                  r={isHover ? 5.5 : 3.5}
                  fill="#818cf8"
                  stroke="#060913"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={yImp}
                  r={isHover ? 6 : 4}
                  fill="#10b981"
                  stroke="#060913"
                  strokeWidth="2"
                />
                <text
                  x={x}
                  y={height - 6}
                  textAnchor="middle"
                  className="fill-slate-400 text-[11px]"
                >
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
