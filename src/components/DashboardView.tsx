import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Info,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { AppTab, ExpenseCategory, FinwiseState } from '../types/finance';
import { CATEGORY_COLORS, EXPENSE_CATEGORIES } from '../data/demoData';
import { computeFinancialMetrics, formatINR } from '../utils/finance';
import { PillCashflowChart, RadialGauge, SpendingDonutChart } from './Charts';

interface DashboardViewProps {
  state: FinwiseState;
  onNavigate: (tab: AppTab) => void;
  onResetDemo: () => void;
}

export function DashboardView({ state, onNavigate, onResetDemo }: DashboardViewProps) {
  const metrics = useMemo(() => computeFinancialMetrics(state), [state]);
  const [chartView, setChartView] = useState<'cashflow' | 'expenses'>('cashflow');
  const [txSearch, setTxSearch] = useState('');
  const [txCategory, setTxCategory] = useState<'All' | ExpenseCategory>('All');

  const chartData = useMemo(() => {
    const history = [...state.monthlyHistory];
    if (history.length > 0) {
      const last = history[history.length - 1];
      history[history.length - 1] = {
        ...last,
        income: state.monthlyIncome,
        expenses: metrics.totalExpenses,
        savings: metrics.monthlySavings,
      };
    }
    return history.map((m) => ({
      label: m.month,
      income: m.income,
      expenses: m.expenses,
      savings: m.savings,
    }));
  }, [state.monthlyHistory, state.monthlyIncome, metrics.totalExpenses, metrics.monthlySavings]);

  const filteredExpenses = useMemo(() => {
    return [...state.expenses]
      .filter((e) => {
        const matchesCat = txCategory === 'All' || e.category === txCategory;
        const q = txSearch.trim().toLowerCase();
        const matchesSearch =
          !q ||
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          (e.note && e.note.toLowerCase().includes(q));
        return matchesCat && matchesSearch;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [state.expenses, txCategory, txSearch]);

  const donutSlices = metrics.categoryStats.map((c) => ({
    label: c.category,
    value: c.spent,
    color: CATEGORY_COLORS[c.category],
  }));

  return (
    <div className="space-y-6">
      {/* Sample Data Banner + Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Financial Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Sample INR demo data for {state.profile.name} · Updates automatically as you edit budgets or goals
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('budget')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Expense
          </button>
          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-300 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="text-xs text-slate-400">Monthly Income</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1.5">
            {formatINR(state.monthlyIncome)}
          </div>
          <div className="text-xs text-indigo-300 mt-1.5">Stipend & allowance</div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="text-xs text-slate-400">Total Expenses</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1.5">
            {formatINR(metrics.totalExpenses)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {metrics.budgetUtilization}% of {formatINR(metrics.totalBudgetLimit)} cap
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="text-xs text-slate-400">Available Balance</div>
          <div
            className={`text-2xl font-bold font-mono tabular-nums mt-1.5 ${
              metrics.availableBalance >= 0 ? 'text-white' : 'text-rose-400'
            }`}
          >
            {formatINR(metrics.availableBalance)}
          </div>
          <div className="text-xs text-slate-400 mt-1.5">
            {metrics.availableBalance >= 0 ? 'Positive monthly surplus' : 'Overspent vs income'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="text-xs text-slate-400">Monthly Savings Potential</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1.5">
            {formatINR(metrics.monthlySavings)}
          </div>
          <div className="text-xs text-emerald-400/90 mt-1.5">
            {metrics.savingsRate}% savings rate
          </div>
        </div>
      </div>

      {/* Main Chart + Financial Health Score */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-display font-semibold text-white">
                Monthly Cashflow & Expense Trend
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hover bars to inspect monthly INR figures
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setChartView('cashflow')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  chartView === 'cashflow'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Income vs Savings
              </button>
              <button
                type="button"
                onClick={() => setChartView('expenses')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  chartView === 'expenses'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Expenses Only
              </button>
            </div>
          </div>

          <PillCashflowChart data={chartData} mode={chartView} />
        </div>

        <div className="xl:col-span-4 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-display font-semibold text-white">
                Financial Health Score
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('health')}
                className="text-xs font-medium text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer"
              >
                Details <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Educational habit score · Not a credit score
            </p>
          </div>

          <div className="flex items-center gap-5">
            <RadialGauge
              value={metrics.healthScore}
              size={104}
              strokeWidth={10}
              color={
                metrics.healthScore >= 75
                  ? '#10b981'
                  : metrics.healthScore >= 55
                  ? '#818cf8'
                  : '#f59e0b'
              }
              label={`${metrics.healthScore}/100`}
            />
            <div className="space-y-1.5">
              <div className="text-base font-semibold text-white">{metrics.healthLabel}</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Driven by your {metrics.savingsRate}% savings rate and {metrics.goalsProgressPct}% overall goal funding.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-white/[0.07]">
            {metrics.healthPillars.map((p) => (
              <div key={p.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{p.label}</span>
                  <span className="font-mono tabular-nums text-slate-200">
                    {p.score}/{p.maxScore}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${Math.round((p.score / p.maxScore) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spending Breakdown + Savings Goal Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08]">
          <div className="flex items-center justify-between gap-2 mb-5">
            <div>
              <h2 className="text-base font-display font-semibold text-white">
                Spending Breakdown
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Live category totals from your logged expenses
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('budget')}
              className="text-xs font-medium text-indigo-300 hover:text-indigo-200 cursor-pointer"
            >
              Adjust Limits
            </button>
          </div>
          <SpendingDonutChart slices={donutSlices} />
        </div>

        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-display font-semibold text-white">
                Savings Goals Progress
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {formatINR(metrics.totalSavedInGoals)} saved across {state.goals.length} goals
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('goals')}
              className="text-xs font-medium text-indigo-300 hover:text-indigo-200 cursor-pointer"
            >
              Manage Goals
            </button>
          </div>

          <div className="space-y-4">
            {state.goals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, Math.round((goal.saved / Math.max(1, goal.target)) * 100));
              return (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-200 truncate">{goal.title}</span>
                    <span className="font-mono tabular-nums text-xs text-slate-300 shrink-0">
                      {formatINR(goal.saved)} / {formatINR(goal.target)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {state.goals.length === 0 && (
              <p className="text-sm text-slate-400">
                No savings goals yet. Create your first target in Savings Goals.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('simulator')}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <TrendingUp className="w-4 h-4" />
            Test +₹100/day in What If Simulator
          </button>
        </div>
      </div>

      {/* Personalized Insights + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-semibold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Personalized Financial Insights
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('assistant')}
              className="text-xs font-medium text-indigo-300 hover:text-indigo-200 cursor-pointer"
            >
              Ask AI
            </button>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {metrics.personalizedInsights.map((ins, i) => (
              <div key={i} className="py-3.5 first:pt-0 last:pb-0 flex items-start gap-3">
                {ins.tone === 'positive' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                ) : ins.tone === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                ) : (
                  <Info className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="text-sm font-medium text-white">{ins.title}</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ins.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-base font-display font-semibold text-white">
              Recent Transactions
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={txSearch}
                  onChange={(e) => setTxSearch(e.target.value)}
                  placeholder="Search transactions..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-white/[0.04] border border-white/[0.08] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
              <select
                value={txCategory}
                onChange={(e) => setTxCategory(e.target.value as 'All' | ExpenseCategory)}
                aria-label="Filter transactions by category"
                className="px-2.5 py-1.5 text-xs bg-[#090E1B] border border-white/[0.08] rounded-lg text-slate-200 focus:outline-none focus:border-indigo-400"
              >
                <option value="All">All Categories</option>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.07] text-xs text-slate-400">
                  <th className="py-2.5 pr-4 font-medium">Item</th>
                  <th className="py-2.5 px-3 font-medium">Category</th>
                  <th className="py-2.5 px-3 font-medium">Date</th>
                  <th className="py-2.5 pl-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-sm">
                {filteredExpenses.slice(0, 7).map((exp) => (
                  <tr key={exp.id} className="hover:bg-white/[0.02] transition-colors">
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
                    <td className="py-3 pl-3 text-right font-mono tabular-nums font-semibold text-white whitespace-nowrap">
                      −{formatINR(exp.amount)}
                    </td>
                  </tr>
                ))}
                {filteredExpenses.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-slate-400">
                      No matching expenses found. Try clearing your filter or add a new expense in Budget Planner.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
