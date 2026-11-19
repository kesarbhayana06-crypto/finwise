import React, { useMemo, useState } from 'react';
import { AlertCircle, Compass, Info } from 'lucide-react';
import type { FinwiseState } from '../types/finance';
import { computeFinancialMetrics, formatINR } from '../utils/finance';
import { DualProjectionChart } from './Charts';

interface FinancialFutureViewProps {
  state: FinwiseState;
  onUpdateFutureInputs: (currentSavings: number, monthlySaving: number) => void;
}

function projectCompound(initial: number, monthly: number, annualRatePct: number, months: number) {
  const r = annualRatePct / 100 / 12;
  let balance = initial;
  for (let m = 0; m < months; m++) {
    balance = balance * (1 + r) + monthly;
  }
  const totalContributed = initial + monthly * months;
  return {
    projectedTotal: Math.round(balance),
    totalContributed: Math.round(totalContributed),
    estimatedGrowth: Math.max(0, Math.round(balance - totalContributed)),
  };
}

export function FinancialFutureView({ state, onUpdateFutureInputs }: FinancialFutureViewProps) {
  const metrics = useMemo(() => computeFinancialMetrics(state), [state]);

  const [currentSavings, setCurrentSavings] = useState(state.futureCurrentSavings);
  const [income, setIncome] = useState(state.monthlyIncome);
  const [monthlySaving, setMonthlySaving] = useState(
    state.futureMonthlySaving || Math.max(3000, metrics.monthlySavings)
  );
  const [annualRate, setAnnualRate] = useState(8);
  const [inflationRate, setInflationRate] = useState(6);

  const handleCurrentChange = (val: number) => {
    const safe = Math.max(0, Math.round(val));
    setCurrentSavings(safe);
    onUpdateFutureInputs(safe, monthlySaving);
  };

  const handleMonthlyChange = (val: number) => {
    const safe = Math.max(0, Math.round(val));
    setMonthlySaving(safe);
    onUpdateFutureInputs(currentSavings, safe);
  };

  const horizons = useMemo(() => {
    return [1, 3, 5].map((years) => {
      const months = years * 12;
      const proj = projectCompound(currentSavings, monthlySaving, annualRate, months);
      const inflationFactor = Math.pow(1 + inflationRate / 100, years);
      const realPurchasingPower = Math.round(proj.projectedTotal / inflationFactor);
      const idleCashReal = Math.round(proj.totalContributed / inflationFactor);
      return {
        years,
        label: years === 1 ? '1 Year' : `${years} Years`,
        ...proj,
        realPurchasingPower,
        idleCashReal,
      };
    });
  }, [currentSavings, monthlySaving, annualRate, inflationRate]);

  const chartData = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((yr) => {
      const p = projectCompound(currentSavings, monthlySaving, annualRate, yr * 12);
      return {
        label: yr === 0 ? 'Today' : `Yr ${yr}`,
        baseline: p.totalContributed,
        improved: p.projectedTotal,
      };
    });
  }, [currentSavings, monthlySaving, annualRate]);

  const savingShareOfIncome =
    income > 0 ? Math.round((monthlySaving / income) * 1000) / 10 : 0;

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
          <Compass className="w-4 h-4" />
          <span>1 · 3 · 5 Year Projection Explorer</span>
        </div>
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Your Financial Future
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          See how consistent monthly saving compounds over 1, 3, and 5 years compared to idle cash
        </p>
      </div>

      {/* Inputs + 5-Year Chart */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-5 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-5">
          <div>
            <label htmlFor="ff-current" className="block text-xs text-slate-300 mb-1.5">
              Current Savings (₹)
            </label>
            <input
              id="ff-current"
              type="number"
              min={0}
              step={1000}
              value={currentSavings}
              onChange={(e) => handleCurrentChange(Number(e.target.value) || 0)}
              className="w-full px-3.5 py-2 text-base font-mono tabular-nums bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="ff-income" className="block text-xs text-slate-300 mb-1.5">
                Monthly Income (₹)
              </label>
              <input
                id="ff-income"
                type="number"
                min={0}
                step={500}
                value={income}
                onChange={(e) => setIncome(Math.max(0, Number(e.target.value) || 0))}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label htmlFor="ff-monthly" className="block text-xs text-slate-300 mb-1.5">
                Monthly Saving (₹)
              </label>
              <input
                id="ff-monthly"
                type="number"
                min={0}
                step={500}
                value={monthlySaving}
                onChange={(e) => handleMonthlyChange(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2 text-sm font-mono tabular-nums bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300">Illustrative Annual Rate (Education Only)</span>
              <span className="font-mono font-bold text-emerald-400">{annualRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={0}
              max={14}
              step={0.5}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="finwise-range w-full"
              aria-label="Illustrative annual rate"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: 'Savings A/C (3.5%)', rate: 3.5 },
                { label: 'FD / RD (6.5%)', rate: 6.5 },
                { label: 'Balanced Illustrative (9%)', rate: 9 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAnnualRate(preset.rate)}
                  className={`px-2.5 py-1 text-[11px] rounded-md border transition-colors cursor-pointer ${
                    annualRate === preset.rate
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-white/[0.03] border-white/[0.08] text-slate-300 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300">Assumed Annual Inflation</span>
              <span className="font-mono text-amber-300">{inflationRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={2}
              max={10}
              step={0.5}
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="finwise-range w-full"
              aria-label="Assumed inflation rate"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-slate-300">
            Saving <span className="font-mono text-white">{formatINR(monthlySaving)}/mo</span> represents{' '}
            <span className="font-mono text-emerald-400">{savingShareOfIncome}%</span> of your{' '}
            <span className="font-mono text-white">{formatINR(income)}</span> monthly income.
          </div>
        </div>

        <div className="xl:col-span-7 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-5">
          <div>
            <h2 className="text-base font-display font-semibold text-white">
              5-Year Progress: Contributed Principal vs. Compounded Projection
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover any year to compare total deposits against illustrative compounded value
            </p>
          </div>

          <DualProjectionChart
            data={chartData}
            baselineLabel="Your Total Deposits (0%)"
            improvedLabel={`Illustrative (${annualRate}% p.a.)`}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-white/[0.07]">
            {horizons.map((h) => (
              <div
                key={h.label}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] space-y-2"
              >
                <div className="text-xs font-semibold text-indigo-300">{h.label} Horizon</div>
                <div className="text-xl font-bold font-mono tabular-nums text-white">
                  {formatINR(h.projectedTotal)}
                </div>
                <div className="space-y-1 text-[11px] font-mono tabular-nums">
                  <div className="flex justify-between text-slate-400">
                    <span>Deposited</span>
                    <span className="text-slate-200">{formatINR(h.totalContributed)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400">
                    <span>Est. Growth</span>
                    <span>+{formatINR(h.estimatedGrowth)}</span>
                  </div>
                  <div className="flex justify-between text-amber-300/90 pt-1 border-t border-white/[0.06]">
                    <span>Today’s Value</span>
                    <span>{formatINR(h.realPurchasingPower)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assumptions & Clear Non-Guarantee Disclaimer */}
      <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <h2 className="text-sm font-display font-semibold text-white flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-400" />
            How These Numbers Are Calculated
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Projections assume you begin with {formatINR(currentSavings)}, add {formatINR(monthlySaving)} at the end of every month without interruption, and earn a steady monthly-compounded rate of {annualRate}% per year. “Today’s Value” adjusts future rupees by {inflationRate}% annual inflation to show real purchasing power.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-display font-semibold text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            Educational Disclaimer — Returns Not Guaranteed
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Real-world investment returns fluctuate and are never guaranteed. Market-linked instruments can rise or fall in the short term, and bank interest rates change over time. Use this view strictly as an educational planning model, not financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
