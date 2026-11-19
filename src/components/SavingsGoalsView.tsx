import React, { useState } from 'react';
import {
  Calendar,
  GraduationCap,
  Laptop,
  Plane,
  Plus,
  ShieldCheck,
  Target,
  Trash2,
} from 'lucide-react';
import type { FinwiseState, SavingsGoal } from '../types/finance';
import { formatINR } from '../utils/finance';
import { RadialGauge } from './Charts';

interface SavingsGoalsViewProps {
  state: FinwiseState;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onContributeGoal: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

const GOAL_ICONS: Record<SavingsGoal['category'], React.ComponentType<{ className?: string }>> = {
  Emergency: ShieldCheck,
  Tech: Laptop,
  Travel: Plane,
  Education: GraduationCap,
  Other: Target,
};

const GOAL_COLORS: Record<SavingsGoal['category'], string> = {
  Emergency: '#10b981',
  Tech: '#818cf8',
  Travel: '#f59e0b',
  Education: '#38bdf8',
  Other: '#a78bfa',
};

export function SavingsGoalsView({
  state,
  onAddGoal,
  onContributeGoal,
  onDeleteGoal,
}: SavingsGoalsViewProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SavingsGoal['category']>('Tech');
  const [saved, setSaved] = useState('0');
  const [target, setTarget] = useState('');
  const [dueDate, setDueDate] = useState('2027-06-01');
  const [error, setError] = useState<string | null>(null);

  const [contribGoalId, setContribGoalId] = useState<string | null>(null);
  const [contribAmount, setContribAmount] = useState('1000');

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    const targetNum = Number(target);
    const savedNum = Math.max(0, Number(saved) || 0);

    if (!t) {
      setError('Enter a goal name.');
      return;
    }
    if (!Number.isFinite(targetNum) || targetNum <= 0) {
      setError('Target amount must be greater than ₹0.');
      return;
    }

    const remaining = Math.max(0, targetNum - savedNum);
    onAddGoal({
      title: t,
      category,
      saved: Math.round(savedNum),
      target: Math.round(targetNum),
      dueDate: dueDate || '2027-06-01',
      monthlyTarget: Math.max(500, Math.round(remaining / 6)),
    });

    setTitle('');
    setSaved('0');
    setTarget('');
    setError(null);
    setShowCreate(false);
  };

  const handleConfirmContrib = (id: string) => {
    const val = Number(contribAmount);
    if (Number.isFinite(val) && val > 0) {
      onContributeGoal(id, Math.round(val));
      setContribGoalId(null);
      setContribAmount('1000');
    }
  };

  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Financial Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {state.goals.length} active goals · {formatINR(totalSaved)} saved toward {formatINR(totalTarget)} total
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          {showCreate ? 'Close Form' : 'Add Goal'}
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreateGoal}
          className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.1] space-y-4"
        >
          <h2 className="text-base font-display font-semibold text-white">Create Savings Goal</h2>
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <label htmlFor="goal-title" className="block text-xs text-slate-300 mb-1.5">
                Goal Title
              </label>
              <input
                id="goal-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Internship Relocation Fund"
                className="w-full px-3 py-2 text-sm bg-white/[0.04] border border-white/[0.1] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="goal-cat" className="block text-xs text-slate-300 mb-1.5">
                Category
              </label>
              <select
                id="goal-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as SavingsGoal['category'])}
                className="w-full px-3 py-2 text-sm bg-[#090E1B] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
              >
                <option value="Emergency">Emergency</option>
                <option value="Tech">Tech</option>
                <option value="Travel">Travel</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="goal-target" className="block text-xs text-slate-300 mb-1.5">
                Target (₹)
              </label>
              <input
                id="goal-target"
                type="number"
                min={100}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="goal-due" className="block text-xs text-slate-300 mb-1.5">
                Target Date
              </label>
              <input
                id="goal-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <label htmlFor="goal-saved">Starting Saved (₹):</label>
              <input
                id="goal-saved"
                type="number"
                min={0}
                value={saved}
                onChange={(e) => setSaved(e.target.value)}
                className="w-28 px-2.5 py-1.5 font-mono bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {state.goals.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0C1222] border border-white/[0.08] text-center space-y-3">
          <Target className="w-8 h-8 text-indigo-400 mx-auto" />
          <h2 className="text-lg font-display font-semibold text-white">No savings goals yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Set a concrete target like a ₹45,000 emergency cushion or a new laptop so every rupee saved has a destination.
          </p>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
          >
            Create First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {state.goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.saved / Math.max(1, goal.target)) * 100));
            const Icon = GOAL_ICONS[goal.category];
            const color = GOAL_COLORS[goal.category];
            const statusText =
              pct >= 70 ? 'Ahead of schedule' : pct >= 40 ? 'On track' : 'Needs steady boost';
            const statusColor =
              pct >= 70 ? 'text-emerald-400' : pct >= 40 ? 'text-indigo-300' : 'text-amber-400';
            const isAdding = contribGoalId === goal.id;

            return (
              <div
                key={goal.id}
                className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-slate-200" />
                    </div>
                    <div>
                      <h2 className="text-base font-display font-semibold text-white">
                        {goal.title}
                      </h2>
                      <div className={`text-xs font-medium mt-0.5 ${statusColor}`}>
                        {statusText}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <RadialGauge value={pct} size={58} strokeWidth={6} color={color} label={`${pct}%`} />
                    <button
                      type="button"
                      onClick={() => onDeleteGoal(goal.id)}
                      aria-label={`Delete ${goal.title}`}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="flex items-baseline justify-between font-mono tabular-nums">
                    <span className="text-xl font-bold text-white">{formatINR(goal.saved)}</span>
                    <span className="text-xs text-slate-400">/ {formatINR(goal.target)}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Target date: {goal.dueDate}
                  </span>
                  <span className="font-mono tabular-nums">
                    Suggested: {formatINR(goal.monthlyTarget)}/mo
                  </span>
                </div>

                {isAdding ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={50}
                      step={100}
                      value={contribAmount}
                      onChange={(e) => setContribAmount(e.target.value)}
                      className="flex-1 px-3 py-2 text-sm font-mono bg-white/[0.05] border border-white/[0.12] rounded-lg text-white focus:outline-none focus:border-indigo-400"
                      aria-label="Contribution amount in INR"
                    />
                    <button
                      type="button"
                      onClick={() => handleConfirmContrib(goal.id)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg cursor-pointer"
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      onClick={() => setContribGoalId(null)}
                      className="px-3 py-2 text-xs text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setContribGoalId(goal.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    + Add Contribution
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
