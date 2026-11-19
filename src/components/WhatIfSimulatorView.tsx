import React, { useMemo, useState } from 'react';
import { Coffee, Laptop, Sparkles, TrendingUp } from 'lucide-react';
import type { FinwiseState } from '../types/finance';
import { computeFinancialMetrics, formatINR } from '../utils/finance';
import { DualProjectionChart } from './Charts';

interface WhatIfSimulatorViewProps {
  state: FinwiseState;
}

const HABIT_PRESETS = [
  { label: 'Skip 1 daily ₹100 café coffee', daily: 100, monthlyExtra: 0 },
  { label: 'Cook vs ₹180 food delivery', daily: 180, monthlyExtra: 0 },
  { label: 'Daily ₹100 save + ₹1,500 tutoring', daily: 100, monthlyExtra: 1500 },
  { label: 'Weekend outing cap (₹250/day avg)', daily: 250, monthlyExtra: 0 },
];

export function WhatIfSimulatorView({ state }: WhatIfSimulatorViewProps) {
  const metrics = useMemo(() => computeFinancialMetrics(state), [state]);

  const [currentMonthlySaving, setCurrentMonthlySaving] = useState<number>(
    Math.max(2000, metrics.monthlySavings)
  );
  const [dailyCutback, setDailyCutback] = useState<number>(100);
  const [extraMonthlyBoost, setExtraMonthlyBoost] = useState<number>(0);

  const extraPerMonth = Math.round(dailyCutback * 30.416) + extraMonthlyBoost;
  const improvedMonthlySaving = currentMonthlySaving + extraPerMonth;

  const milestones = useMemo(() => {
    const monthsList = [3, 6, 12];
    return monthsList.map((m) => {
      const currentTotal = currentMonthlySaving * m;
      const improvedTotal =
        currentMonthlySaving * m + Math.round(dailyCutback * (m === 12 ? 365 : m * 30.416)) + extraMonthlyBoost * m;
      const diff = improvedTotal - currentTotal;
      return {
        months: m,
        label: `${m} Months`,
        currentTotal,
        improvedTotal,
        diff,
      };
    });
  }, [currentMonthlySaving, dailyCutback, extraMonthlyBoost]);

  const chartSeries = useMemo(() => {
    return Array.from({ length: 13 }, (_, month) => {
      const baseline = currentMonthlySaving * month;
      const dailyPart = month === 12 ? dailyCutback * 365 : Math.round(dailyCutback * 30.416 * month);
      const improved = baseline + dailyPart + extraMonthlyBoost * month;
      return {
        label: month === 0 ? 'Now' : `M${month}`,
        baseline,
        improved,
      };
    });
  }, [currentMonthlySaving, dailyCutback, extraMonthlyBoost]);

  const twelveMonthDelta = milestones[2].diff;
  const pctGain =
    milestones[2].currentTotal > 0
      ? Math.round((twelveMonthDelta / milestones[2].currentTotal) * 100)
      : 100;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          What If? Money Simulator
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Test how small daily spending changes transform your savings over 3, 6, and 12 months
        </p>
      </div>

      {/* Quick Presets */}
      <div className="flex flex-wrap items-center gap-2.5">
        {HABIT_PRESETS.map((preset) => {
          const active =
            dailyCutback === preset.daily && extraMonthlyBoost === preset.monthlyExtra;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setDailyCutback(preset.daily);
                setExtraMonthlyBoost(preset.monthlyExtra);
              }}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                active
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-[#0C1222] border-white/[0.08] text-slate-300 hover:text-white hover:border-white/[0.18]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Controls + Live Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-6">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="sim-current" className="text-slate-200 font-medium">
                Current Monthly Saving
              </label>
              <span className="font-mono tabular-nums font-bold text-indigo-300">
                {formatINR(currentMonthlySaving)}/mo
              </span>
            </div>
            <input
              id="sim-current"
              type="range"
              min={0}
              max={50000}
              step={500}
              value={currentMonthlySaving}
              onChange={(e) => setCurrentMonthlySaving(Number(e.target.value))}
              className="finwise-range w-full"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="sim-daily" className="text-slate-200 font-medium">
                Extra Saved Every Day
              </label>
              <span className="font-mono tabular-nums font-bold text-emerald-400">
                +{formatINR(dailyCutback)}/day
              </span>
            </div>
            <input
              id="sim-daily"
              type="range"
              min={0}
              max={1000}
              step={10}
              value={dailyCutback}
              onChange={(e) => setDailyCutback(Number(e.target.value))}
              className="finwise-range w-full"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
              <span>₹0</span>
              <span>₹100/day = ₹36,500/yr</span>
              <span>₹1,000</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <label htmlFor="sim-boost" className="text-slate-200 font-medium">
                Extra Monthly Boost (Freelance / Cutback)
              </label>
              <span className="font-mono tabular-nums font-bold text-violet-300">
                +{formatINR(extraMonthlyBoost)}/mo
              </span>
            </div>
            <input
              id="sim-boost"
              type="range"
              min={0}
              max={20000}
              step={500}
              value={extraMonthlyBoost}
              onChange={(e) => setExtraMonthlyBoost(Number(e.target.value))}
              className="finwise-range w-full"
            />
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <Sparkles className="w-4 h-4" />
              New Monthly Saving Pace
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-white">
              {formatINR(improvedMonthlySaving)}/mo
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Saving {formatINR(dailyCutback)}/day plus {formatINR(extraMonthlyBoost)}/mo increases your annual total by{' '}
              <span className="font-mono text-emerald-300">{formatINR(twelveMonthDelta)}</span> (+{pctGain}%).
            </p>
          </div>
        </div>

        <div className="xl:col-span-7 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-base font-display font-semibold text-white">
              12-Month Habit Trajectory Comparison
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover any month to compare your current saving habit vs. improved habit
            </p>
          </div>

          <DualProjectionChart
            data={chartSeries}
            baselineLabel="Current Habits"
            improvedLabel="With Habit Shift"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/[0.07]">
            {milestones.map((m) => (
              <div
                key={m.label}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1"
              >
                <div className="text-xs text-slate-400">{m.label}</div>
                <div className="text-lg font-bold font-mono tabular-nums text-emerald-400">
                  {formatINR(m.improvedTotal)}
                </div>
                <div className="text-xs font-mono tabular-nums text-slate-400">
                  vs {formatINR(m.currentTotal)} ({`+${formatINR(m.diff)}`})
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-world student equivalents */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex items-start gap-3">
          <Coffee className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white">Daily Micro-Leak Impact</div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Just {formatINR(dailyCutback)}/day equals {formatINR(dailyCutback * 365)} over 12 months—without needing a higher salary.
            </p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex items-start gap-3">
          <Laptop className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white">Goal Acceleration</div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              That extra {formatINR(twelveMonthDelta)}/year covers an entire emergency cushion or over half of a coding laptop.
            </p>
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-white">Compounding Head Start</div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Take this {formatINR(improvedMonthlySaving)}/mo pace into Your Financial Future to project 1, 3, and 5 years ahead.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
