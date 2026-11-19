import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import type { AppTab, FinwiseState } from '../types/finance';
import { computeFinancialMetrics, formatINR } from '../utils/finance';
import { RadialGauge } from './Charts';

interface HealthScoreViewProps {
  state: FinwiseState;
  onNavigate: (tab: AppTab) => void;
}

export function HealthScoreView({ state, onNavigate }: HealthScoreViewProps) {
  const metrics = useMemo(() => computeFinancialMetrics(state), [state]);

  const actions = useMemo(() => {
    const list: Array<{ title: string; pointsHint: string; tab: AppTab; cta: string }> = [];
    if (metrics.overBudgetCategories.length > 0) {
      list.push({
        title: `Bring ${metrics.overBudgetCategories[0].category} within its ${formatINR(metrics.overBudgetCategories[0].limit)} limit`,
        pointsHint: '+5 to +10 pts',
        tab: 'budget',
        cta: 'Open Budget Planner',
      });
    }
    if (metrics.savingsRate < 25) {
      list.push({
        title: 'Raise your monthly savings rate toward the 25% student target',
        pointsHint: '+6 to +12 pts',
        tab: 'simulator',
        cta: 'Simulate Habit Change',
      });
    }
    if (metrics.goalsProgressPct < 60) {
      list.push({
        title: 'Add a small contribution to your Emergency Buffer or primary goal',
        pointsHint: '+4 to +8 pts',
        tab: 'goals',
        cta: 'Fund Savings Goals',
      });
    }
    if (state.completedLessonIds.length < 5) {
      list.push({
        title: 'Complete additional modules in the Financial Learning Hub',
        pointsHint: '+2 pts per module',
        tab: 'learn',
        cta: 'Open Learning Hub',
      });
    }
    return list;
  }, [metrics, state.completedLessonIds.length]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Financial Health Score
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Educational habit assessment out of 100 — not a credit score or lending rating
        </p>
      </div>

      {/* Hero Score Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col md:flex-row items-center gap-8">
        <RadialGauge
          value={metrics.healthScore}
          size={148}
          strokeWidth={12}
          color={
            metrics.healthScore >= 75
              ? '#10b981'
              : metrics.healthScore >= 55
              ? '#818cf8'
              : '#f59e0b'
          }
          label={`${metrics.healthScore}/100`}
        />

        <div className="space-y-3 text-center md:text-left">
          <div className="text-xs font-semibold text-emerald-400 tracking-wide">
            Current Standing: {metrics.healthLabel}
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
            Your money habits are scored transparently across four pillars
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Unlike opaque bank scores, FINWISE calculates your score directly from your savings rate, category cap discipline, tracking consistency, and savings goal progress. Every edit in the app updates this score live.
          </p>
        </div>
      </div>

      {/* 4 Pillar Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {metrics.healthPillars.map((pillar) => {
          const pct = Math.round((pillar.score / pillar.maxScore) * 100);
          return (
            <div
              key={pillar.label}
              className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-display font-semibold text-white">{pillar.label}</h3>
                <span className="font-mono tabular-nums text-sm font-bold text-white">
                  {pillar.score} / {pillar.maxScore}
                </span>
              </div>

              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    pillar.status === 'Strong'
                      ? 'bg-emerald-400'
                      : pillar.status === 'Moderate'
                      ? 'bg-indigo-400'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span
                  className={`font-medium ${
                    pillar.status === 'Strong'
                      ? 'text-emerald-400'
                      : pillar.status === 'Moderate'
                      ? 'text-indigo-300'
                      : 'text-amber-400'
                  }`}
                >
                  {pillar.status}
                </span>
                <span className="text-slate-400 font-mono tabular-nums">{pct}% of pillar</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{pillar.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Actionable Ways to Improve */}
      <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h2 className="text-base font-display font-semibold text-white">
            Actionable Steps to Raise Your Score
          </h2>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {actions.map((item) => (
            <div
              key={item.title}
              className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="text-sm font-medium text-white">{item.title}</div>
                  <div className="text-xs text-emerald-400 mt-0.5 font-mono">{item.pointsHint}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(item.tab)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-white/[0.05] hover:bg-indigo-600 border border-white/[0.1] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                {item.cta}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {actions.length === 0 && (
            <div className="py-4 text-sm text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              All four financial habit pillars are performing strongly. Keep maintaining your monthly rhythm!
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-white/[0.06] flex items-start gap-2 text-xs text-slate-400">
          <Info className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
          <span>
            Disclaimer: This Financial Health Score is an educational self-reflection tool for students and beginners. It does not reflect CIBIL, Experian, or official credit bureau scores.
          </span>
        </div>
      </div>
    </div>
  );
}
