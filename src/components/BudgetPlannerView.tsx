import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { Expense, ExpenseCategory, FinwiseState } from '../types/finance';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../data/demoData';
import { computeFinancialMetrics, formatINR } from '../utils/finance';

interface BudgetPlannerViewProps {
  state: FinwiseState;
  onUpdateIncome: (income: number) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onUpdateCategoryLimit: (category: ExpenseCategory, limit: number) => void;
}

export function BudgetPlannerView({
  state,
  onUpdateIncome,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onUpdateCategoryLimit,
}: BudgetPlannerViewProps) {
  const metrics = useMemo(() => computeFinancialMetrics(state), [state]);

  const [incomeInput, setIncomeInput] = useState(String(state.monthlyIncome));
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [date, setDate] = useState('2026-11-19');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{
    summary: string;
    suggestions: Array<{ title: string; impact: string; detail: string }>;
  } | null>(null);

  const handleIncomeChange = (val: string) => {
    setIncomeInput(val);
    const parsed = Number(val);
    if (Number.isFinite(parsed) && parsed >= 0) {
      onUpdateIncome(Math.round(parsed));
    }
  };

  const startEdit = (exp: Expense) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setDate(exp.date);
    setNote(exp.note ?? '');
    setFormError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setAmount('');
    setCategory('Food & Dining');
    setDate('2026-11-19');
    setNote('');
    setFormError(null);
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    const parsedAmount = Number(amount);

    if (!cleanTitle) {
      setFormError('Please enter an expense title.');
      return;
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormError('Please enter a valid INR amount greater than 0.');
      return;
    }

    if (editingId) {
      onUpdateExpense({
        id: editingId,
        title: cleanTitle,
        amount: Math.round(parsedAmount),
        category,
        date: date || '2026-11-19',
        note: note.trim() || undefined,
      });
    } else {
      onAddExpense({
        title: cleanTitle,
        amount: Math.round(parsedAmount),
        category,
        date: date || '2026-11-19',
        note: note.trim() || undefined,
      });
    }
    resetForm();
  };

  const handleGenerateAiSuggestions = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/budget-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyIncome: state.monthlyIncome,
          totalExpenses: metrics.totalExpenses,
          monthlySavings: metrics.monthlySavings,
          categories: metrics.categoryStats.map((c) => ({
            category: c.category,
            spent: c.spent,
            limit: c.limit,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'Gemini AI insights unavailable right now.');
      } else {
        setAiResult(data);
      }
    } catch {
      setAiError('Network error reaching AI budget advisor.');
    } finally {
      setAiLoading(false);
    }
  };

  const deterministicSuggestions = useMemo(() => {
    const tips: Array<{ title: string; impact: string; detail: string }> = [];
    for (const cat of metrics.overBudgetCategories) {
      const excess = cat.spent - cat.limit;
      tips.push({
        title: `Bring ${cat.category} under cap`,
        impact: `Saves ${formatINR(excess)}/mo`,
        detail: `Current spending is ${formatINR(cat.spent)} against your ${formatINR(cat.limit)} limit. Trimming ${formatINR(excess)} restores balance.`,
      });
    }
    if (metrics.savingsRate < 20 && state.monthlyIncome > 0) {
      const needed = Math.round(state.monthlyIncome * 0.2 - metrics.monthlySavings);
      tips.push({
        title: 'Target the 20% student saving milestone',
        impact: `Need ${formatINR(needed)}/mo`,
        detail: `Allocating 20% of ${formatINR(state.monthlyIncome)} builds ${formatINR(Math.round(state.monthlyIncome * 0.2 * 12))}/year in steady reserves.`,
      });
    }
    if (tips.length === 0) {
      tips.push({
        title: 'Strong category control maintained',
        impact: `${metrics.savingsRate}% saved`,
        detail: `Every category is inside its limit. Move ${formatINR(Math.round(metrics.monthlySavings * 0.5))} straight into your top Savings Goal.`,
      });
    }
    return tips;
  }, [metrics, state.monthlyIncome]);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Smart Budget Planner
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Adjust monthly income, log expenses, and calibrate category caps with instant recalculation
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerateAiSuggestions}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Ask Gemini for Budget Plan
        </button>
      </div>

      {/* Live Income & Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <label htmlFor="monthly-income-input" className="block text-xs text-slate-400 mb-1.5">
            Monthly Income (INR)
          </label>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-mono">₹</span>
            <input
              id="monthly-income-input"
              type="number"
              min={0}
              step={500}
              value={incomeInput}
              onChange={(e) => handleIncomeChange(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-3 py-1.5 text-lg font-bold font-mono tabular-nums text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="text-xs text-slate-400">Logged Expenses</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-2">
            {formatINR(metrics.totalExpenses)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{state.expenses.length} items this month</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="text-xs text-slate-400">Remaining Balance</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mt-2 ${
              metrics.availableBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatINR(metrics.availableBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1">{metrics.savingsRate}% of monthly income</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="text-xs text-slate-400">Planned Budget Caps</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-300 mt-2">
            {formatINR(metrics.totalBudgetLimit)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            {metrics.budgetUtilization}% utilized
          </div>
        </div>
      </div>

      {/* Add/Edit Expense Form + Category Limits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <form
          onSubmit={handleSubmitExpense}
          className="lg:col-span-5 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4 h-fit"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-white">
              {editingId ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel edit
              </button>
            )}
          </div>

          {formError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {formError}
            </div>
          )}

          <div>
            <label htmlFor="exp-title" className="block text-xs text-slate-300 mb-1.5">
              Expense Description
            </label>
            <input
              id="exp-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Campus Book Store, Evening Chai"
              className="w-full px-3.5 py-2 text-sm bg-white/[0.04] border border-white/[0.1] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="exp-amount" className="block text-xs text-slate-300 mb-1.5">
                Amount (₹)
              </label>
              <input
                id="exp-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="450"
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white/[0.04] border border-white/[0.1] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="exp-date" className="block text-xs text-slate-300 mb-1.5">
                Date
              </label>
              <input
                id="exp-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label htmlFor="exp-category" className="block text-xs text-slate-300 mb-1.5">
              Category
            </label>
            <select
              id="exp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full px-3.5 py-2 text-sm bg-[#090E1B] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="exp-note" className="block text-xs text-slate-300 mb-1.5">
              Optional Note
            </label>
            <input
              id="exp-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g., Split with roommate"
              className="w-full px-3.5 py-2 text-sm bg-white/[0.04] border border-white/[0.1] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {editingId ? 'Save Expense Changes' : 'Add Expense to Budget'}
          </button>
        </form>

        {/* Category Caps & Live Progress */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
          <div>
            <h2 className="text-base font-display font-semibold text-white">
              Category Spending Limits
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Adjust monthly INR limits for each category to spot overspending early
            </p>
          </div>

          <div className="space-y-4">
            {metrics.categoryStats.map((stat) => {
              const barPct = Math.min(100, stat.pctUsed);
              return (
                <div key={stat.category} className="space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[stat.category] }}
                      />
                      <span className="font-medium text-slate-200">{stat.category}</span>
                      {stat.overLimit && (
                        <span className="inline-flex items-center gap-1 text-xs text-rose-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Over cap
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 font-mono tabular-nums text-xs">
                      <span className="text-white font-semibold">{formatINR(stat.spent)}</span>
                      <span className="text-slate-500">/</span>
                      <label className="inline-flex items-center gap-1 text-slate-400">
                        <span>₹</span>
                        <input
                          type="number"
                          min={100}
                          step={100}
                          value={stat.limit}
                          aria-label={`Limit for ${stat.category}`}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (Number.isFinite(val) && val >= 0) {
                              onUpdateCategoryLimit(stat.category, Math.round(val));
                            }
                          }}
                          className="w-20 px-2 py-0.5 bg-white/[0.04] border border-white/[0.1] rounded text-slate-200 focus:outline-none focus:border-indigo-400"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        stat.overLimit
                          ? 'bg-rose-500'
                          : stat.pctUsed >= 85
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                      style={{ width: `${barPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Budgeting Suggestions (Live Gemini or Built-In Rule Engine) */}
      <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-display font-semibold text-white">
            Actionable Budgeting Suggestions
          </h2>
          <span className="text-xs text-slate-400">
            {aiResult ? 'Powered by Gemini AI' : 'Instant Rule-Based Analysis'}
          </span>
        </div>

        {aiError && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
            {aiError} Showing built-in deterministic suggestions below.
          </div>
        )}

        {aiResult && (
          <p className="text-sm text-slate-300 leading-relaxed">{aiResult.summary}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(aiResult ? aiResult.suggestions : deterministicSuggestions).map((tip, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07] space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-white">{tip.title}</span>
                <span className="text-xs font-mono text-emerald-400 shrink-0">{tip.impact}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{tip.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Editable Expense Ledger */}
      <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
        <h2 className="text-base font-display font-semibold text-white">
          Expense Ledger ({state.expenses.length})
        </h2>
        {state.expenses.length === 0 ? (
          <div className="py-10 text-center space-y-2">
            <CheckCircle2 className="w-7 h-7 text-slate-500 mx-auto" />
            <p className="text-sm text-slate-300">No expenses logged yet.</p>
            <p className="text-xs text-slate-400">
              Use the form above to add your first expense and see live category charts update.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-xs text-slate-400">
                  <th className="py-2.5 pr-4 font-medium">Expense</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 px-3 font-medium text-right">Amount</th>
                  <th className="py-2.5 pl-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-sm">
                {state.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-100">{exp.title}</div>
                      {exp.note && <div className="text-xs text-slate-400">{exp.note}</div>}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-300 whitespace-nowrap">
                      {exp.category}
                    </td>
                    <td className="py-3 px-3 text-xs font-mono tabular-nums text-slate-400 whitespace-nowrap">
                      {exp.date}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-white whitespace-nowrap">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3 pl-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => startEdit(exp)}
                        aria-label={`Edit ${exp.title}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteExpense(exp.id)}
                        aria-label={`Delete ${exp.title}`}
                        className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
