import React, { useState } from 'react';
import {
  ArrowRight,
  Bot,
  Calculator,
  Compass,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { AppTab } from '../types/finance';
import { formatINR } from '../utils/finance';
import { PillCashflowChart, RadialGauge } from './Charts';
import { INITIAL_FINWISE_STATE } from '../data/demoData';

interface LandingPageProps {
  onEnterApp: (targetTab?: AppTab, resetToDemo?: boolean) => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
  const [previewMode, setPreviewMode] = useState<'cashflow' | 'whatif' | 'health'>('cashflow');
  const [previewDailySave, setPreviewDailySave] = useState(100);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 relative overflow-x-hidden">
      {/* Subtle Midnight Indigo Ambient Beam */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(99,102,241,0.22),transparent)]"
      />

      {/* 3-Zone Top Navigation Contract */}
      <header className="relative z-20 max-w-7xl mx-auto px-6 py-5 flex items-center justify-between gap-8 border-b border-white/[0.06]">
        <a
          href="#top"
          className="text-lg font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          FINWISE 2.0
        </a>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            How It Works
          </a>
          <a href="#empowerment" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Empowerment
          </a>
          <a href="#future-preview" className="hover:text-white transition-colors whitespace-nowrap shrink-0">
            Financial Future
          </a>
        </nav>

        <button
          type="button"
          onClick={() => onEnterApp('dashboard', false)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          Open Workspace
        </button>
      </header>

      {/* Hero Section */}
      <main id="top" className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-14 pb-16 lg:pt-20 lg:pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs sm:text-sm font-medium text-emerald-400 tracking-wide mb-4">
              Built for students, young earners, and first-time planners in India
            </p>
            <h1
              className="font-display font-bold tracking-tight text-white leading-[1.08]"
              style={{
                fontSize: 'clamp(2.25rem, 4.5vw, 3.85rem)',
                textWrap: 'balance',
              }}
            >
              Your Money. Your Future. Your Power.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Plan monthly INR budgets in seconds, test how small daily habits reshape your year,
              detect digital payment scams early, and learn practical money skills with Gemini AI.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => onEnterApp('dashboard', false)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-xl shadow-lg shadow-indigo-950/50 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onEnterApp('dashboard', true)}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.12] rounded-xl transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                Explore Demo
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              No sign-up required · Sample INR demo data persists in your browser
            </p>
          </div>

          {/* Animated Financial Dashboard Preview Frame */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 relative max-w-5xl mx-auto"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-x-6 -top-6 h-40 bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent blur-2xl pointer-events-none"
            />
            <div className="relative rounded-2xl border border-white/[0.1] bg-[#0C1222]/90 backdrop-blur-xl p-5 sm:p-7 shadow-2xl">
              {/* Interactive Preview Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-display font-semibold text-white">
                    Live Interactive Preview
                  </span>
                  <span className="text-xs text-slate-400">
                    Sample Student Profile · ₹28,500/mo
                  </span>
                </div>

                <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('cashflow')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      previewMode === 'cashflow'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Cashflow Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('whatif')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      previewMode === 'whatif'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    What-If Simulator
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('health')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                      previewMode === 'health'
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Health Score
                  </button>
                </div>
              </div>

              {previewMode === 'cashflow' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-8">
                    <PillCashflowChart
                      data={INITIAL_FINWISE_STATE.monthlyHistory.map((m) => ({
                        label: m.month,
                        income: m.income,
                        expenses: m.expenses,
                        savings: m.savings,
                      }))}
                    />
                  </div>
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="text-xs text-slate-400">Available Monthly Balance</div>
                      <div className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
                        ₹11,080
                      </div>
                      <div className="text-xs text-emerald-400 mt-1">
                        38.9% saved from ₹28,500 income
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                      <div className="text-xs text-slate-400">Top Category Limit Watch</div>
                      <div className="text-sm font-semibold text-white mt-1">
                        Subscriptions · ₹848 / ₹700
                      </div>
                      <div className="text-xs text-amber-400 mt-1">
                        Review unused OTT renewals in Budget Planner
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {previewMode === 'whatif' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                  <div className="lg:col-span-6 space-y-4">
                    <div className="text-sm font-semibold text-white">
                      Slide daily habit cutback: <span className="font-mono text-emerald-400">{formatINR(previewDailySave)}/day</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={400}
                      step={10}
                      value={previewDailySave}
                      onChange={(e) => setPreviewDailySave(Number(e.target.value))}
                      className="finwise-range w-full"
                      aria-label="Preview daily saving amount"
                    />
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Skipping one small daily impulse spend of {formatINR(previewDailySave)} redirects{' '}
                      <span className="font-mono text-white">{formatINR(previewDailySave * 30)}/month</span> into your goals without touching essentials.
                    </p>
                    <button
                      type="button"
                      onClick={() => onEnterApp('simulator', false)}
                      className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open full What If? Simulator
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="lg:col-span-6 grid grid-cols-3 gap-3">
                    {[
                      { label: '3 Months', mult: 90 },
                      { label: '6 Months', mult: 182 },
                      { label: '12 Months', mult: 365 },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] text-center"
                      >
                        <div className="text-xs text-slate-400">{item.label}</div>
                        <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-400 mt-1.5">
                          +{formatINR(previewDailySave * item.mult)}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">extra saved</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {previewMode === 'health' && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <RadialGauge value={82} size={104} strokeWidth={10} color="#10b981" label="82/100" />
                    <div>
                      <div className="text-lg font-display font-bold text-white">
                        Educational Financial Health Score
                      </div>
                      <p className="text-sm text-slate-300 mt-1 max-w-md">
                        Measures your real-time savings rate, category budget discipline, expense logging, and goal momentum—never a credit score.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEnterApp('health', false)}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Inspect Full Breakdown
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Feature Highlights (Asymmetric Bento Grid) */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-16 border-t border-white/[0.06]">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              Everything required to build calm, confident money habits
            </h2>
            <p className="mt-2.5 text-slate-400 text-sm sm:text-base">
              Every calculator, tracker, and AI mentor runs on your live numbers with persistent browser storage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-6">
              <div>
                <div className="flex items-center gap-2.5 text-indigo-300 text-sm font-semibold">
                  <Calculator className="w-4 h-4" />
                  <span>Signature Simulator & Smart Budget</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white mt-2">
                  What If? Money Simulator + Live INR Budget Planner
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
                  Adjust daily spending by ₹50–₹500, set category caps for Food, Hostel, and Subscriptions, and watch 3, 6, and 12-month savings curves update immediately.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onEnterApp('simulator', false)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer"
                >
                  Try What If Simulator
                </button>
                <button
                  type="button"
                  onClick={() => onEnterApp('budget', false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg cursor-pointer"
                >
                  Open Budget Planner
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <Bot className="w-4 h-4" />
                  <span>Gemini AI Mentor</span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mt-2">
                  AI Money Assistant
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Ask plain-English questions about student budgets, inflation, or compound interest—grounded in your actual INR breakdown.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterApp('assistant', false)}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer self-start"
              >
                Chat with Assistant <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Digital Safety</span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mt-2">
                  Smart Scam Detector
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Paste suspicious SMS, UPI collect messages, or WhatsApp job baits to identify urgency, fake KYC links, and OTP phishing traps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterApp('scam', false)}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer self-start"
              >
                Scan a Message <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-violet-300 text-sm font-semibold">
                  <Target className="w-4 h-4" />
                  <span>Goal & XP Tracking</span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mt-2">
                  Savings Goals & Money Missions
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Fund real targets like a laptop or emergency buffer, complete daily challenges, and master 7 beginner money lessons.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterApp('goals', false)}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer self-start"
              >
                Explore Goals & Missions <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              id="future-preview"
              className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <Compass className="w-4 h-4" />
                  <span>1 · 3 · 5 Year Horizon</span>
                </div>
                <h3 className="text-lg font-display font-bold text-white mt-2">
                  Your Financial Future
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Visualize how today’s savings rate compares against inflation and illustrative compounding over 1, 3, and 5 years.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onEnterApp('future', false)}
                className="text-xs font-semibold text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1 cursor-pointer self-start"
              >
                Project Your Future <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-16 border-t border-white/[0.06]">
          <div className="max-w-2xl mb-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              How FINWISE 2.0 works in three steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: '01. Map Your Monthly Flow',
                icon: Wallet,
                body: 'Start with our sample student INR dataset or enter your own stipend, allowance, and monthly expenses across 7 clear categories.',
              },
              {
                num: '02. Test Habits & Check Scams',
                icon: Sparkles,
                body: 'Use the What If Simulator to model ₹100/day habit shifts, ask Gemini AI for personalized trade-offs, and verify suspicious UPI/SMS messages.',
              },
              {
                num: '03. Build Multi-Year Power',
                icon: TrendingUp,
                body: 'Raise your Financial Health Score, fund savings goals step by step, and see your 1, 3, and 5-year progress clearly.',
              },
            ].map((step) => (
              <div key={step.num} className="space-y-3">
                <step.icon className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-display font-semibold text-white">{step.num}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Financial Empowerment Section */}
        <section id="empowerment" className="max-w-7xl mx-auto px-6 py-16 border-t border-white/[0.06]">
          <div className="rounded-2xl bg-[#0C1222] border border-white/[0.08] p-7 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                Financial literacy changes outcomes before your first full-time salary
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                Most financial tools assume high incomes or complex stock portfolios. FINWISE 2.0 focuses on what actually matters for students and young adults: stopping silent UPI leaks, building a calm emergency cushion, and avoiding digital fraud.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onEnterApp('learn', false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors cursor-pointer"
                >
                  Start Learning Hub
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-2xl font-bold font-mono tabular-nums text-emerald-400">₹36,500</div>
                <div className="text-xs text-slate-300 mt-1">
                  Saved in 12 months by redirecting ₹100/day
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-2xl font-bold font-mono tabular-nums text-indigo-300">7 Lessons</div>
                <div className="text-xs text-slate-300 mt-1">
                  Core literacy modules with interactive quizzes
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-2xl font-bold font-mono tabular-nums text-white">0 OTPs</div>
                <div className="text-xs text-slate-300 mt-1">
                  Privacy-first: never requests bank logins or PINs
                </div>
              </div>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
                <div className="text-2xl font-bold font-mono tabular-nums text-violet-300">100% Live</div>
                <div className="text-xs text-slate-300 mt-1">
                  Every chart reflects your real app data
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Professional Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-slate-200">FINWISE 2.0</span>
          <span aria-hidden="true">·</span>
          <span>Your Money. Your Future. Your Power.</span>
        </div>
        <div className="text-center sm:text-right">
          Sample INR demo data · Educational platform — does not connect to real banks or process payments.
        </div>
      </footer>
    </div>
  );
}
