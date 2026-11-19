import React, { useEffect, useState } from 'react';
import {
  Activity,
  BookOpen,
  Bot,
  Calculator,
  Compass,
  LayoutDashboard,
  Menu,
  PieChart,
  RotateCcw,
  Settings,
  ShieldAlert,
  Target,
  Trophy,
  X,
} from 'lucide-react';
import type {
  AppTab,
  Expense,
  ExpenseCategory,
  FinwiseState,
  SavingsGoal,
} from './types/finance';
import { INITIAL_FINWISE_STATE } from './data/demoData';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { BudgetPlannerView } from './components/BudgetPlannerView';
import { AIAssistantView } from './components/AIAssistantView';
import { SavingsGoalsView } from './components/SavingsGoalsView';
import { WhatIfSimulatorView } from './components/WhatIfSimulatorView';
import { HealthScoreView } from './components/HealthScoreView';
import { FinancialFutureView } from './components/FinancialFutureView';
import { ScamDetectorView } from './components/ScamDetectorView';
import { MoneyMissionsView } from './components/MoneyMissionsView';
import { LearningHubView } from './components/LearningHubView';
import { SettingsView } from './components/SettingsView';

const STORAGE_KEY = 'finwise_2_0_state_v1';
const VIEW_KEY = 'finwise_2_0_active_view_v1';

const NAV_ITEMS: Array<{
  id: AppTab;
  label: string;
  group: 'Core' | 'Planning & AI' | 'Safety & Growth' | 'System';
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'dashboard', label: 'Dashboard', group: 'Core', icon: LayoutDashboard },
  { id: 'budget', label: 'Budget Planner', group: 'Core', icon: PieChart },
  { id: 'goals', label: 'Savings Goals', group: 'Core', icon: Target },
  { id: 'assistant', label: 'AI Assistant', group: 'Planning & AI', icon: Bot },
  { id: 'simulator', label: 'What If Simulator', group: 'Planning & AI', icon: Calculator },
  { id: 'health', label: 'Financial Health', group: 'Planning & AI', icon: Activity },
  { id: 'future', label: 'Financial Future', group: 'Planning & AI', icon: Compass },
  { id: 'scam', label: 'Scam Detector', group: 'Safety & Growth', icon: ShieldAlert },
  { id: 'missions', label: 'Money Missions', group: 'Safety & Growth', icon: Trophy },
  { id: 'learn', label: 'Learning Hub', group: 'Safety & Growth', icon: BookOpen },
  { id: 'settings', label: 'Settings', group: 'System', icon: Settings },
];

function loadInitialState(): FinwiseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_FINWISE_STATE;
    const parsed = JSON.parse(raw) as Partial<FinwiseState>;
    return {
      ...INITIAL_FINWISE_STATE,
      ...parsed,
      profile: {
        ...INITIAL_FINWISE_STATE.profile,
        ...(parsed.profile || {}),
      },
      categoryLimits: {
        ...INITIAL_FINWISE_STATE.categoryLimits,
        ...(parsed.categoryLimits || {}),
      },
    };
  } catch {
    return INITIAL_FINWISE_STATE;
  }
}

export default function App() {
  const [showLanding, setShowLanding] = useState<boolean>(() => {
    try {
      return localStorage.getItem(VIEW_KEY) !== 'workspace';
    } catch {
      return true;
    }
  });

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [state, setState] = useState<FinwiseState>(loadInitialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  const handleEnterApp = (targetTab: AppTab = 'dashboard', resetToDemo = false) => {
    if (resetToDemo) {
      setState(INITIAL_FINWISE_STATE);
    }
    setActiveTab(targetTab);
    setShowLanding(false);
    try {
      localStorage.setItem(VIEW_KEY, 'workspace');
    } catch {
      // ignore
    }
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
    setMobileMenuOpen(false);
    try {
      localStorage.setItem(VIEW_KEY, 'landing');
    } catch {
      // ignore
    }
  };

  const handleResetDemo = () => {
    setState(INITIAL_FINWISE_STATE);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FINWISE_STATE));
    } catch {
      // ignore
    }
  };

  const handleUpdateIncome = (income: number) => {
    setState((prev) => ({ ...prev, monthlyIncome: Math.max(0, income) }));
  };

  const handleAddExpense = (exp: Omit<Expense, 'id'>) => {
    const newExp: Expense = { ...exp, id: `exp-${Date.now()}` };
    setState((prev) => ({
      ...prev,
      expenses: [newExp, ...prev.expenses],
    }));
  };

  const handleUpdateExpense = (updated: Expense) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.map((e) => (e.id === updated.id ? updated : e)),
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setState((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
  };

  const handleUpdateCategoryLimit = (category: ExpenseCategory, limit: number) => {
    setState((prev) => ({
      ...prev,
      categoryLimits: {
        ...prev.categoryLimits,
        [category]: limit,
      },
    }));
  };

  const handleAddGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = { ...goal, id: `goal-${Date.now()}` };
    setState((prev) => ({ ...prev, goals: [...prev.goals, newGoal] }));
  };

  const handleContributeGoal = (id: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === id ? { ...g, saved: g.saved + amount } : g)),
    }));
  };

  const handleDeleteGoal = (id: string) => {
    setState((prev) => ({
      ...prev,
      goals: prev.goals.filter((g) => g.id !== id),
    }));
  };

  const handleCompleteMission = (missionId: string, xpEarned: number) => {
    setState((prev) => {
      if (prev.completedMissionIds.includes(missionId)) return prev;
      return {
        ...prev,
        completedMissionIds: [...prev.completedMissionIds, missionId],
        xp: prev.xp + xpEarned,
      };
    });
  };

  const handleCompleteLesson = (lessonId: string) => {
    setState((prev) => {
      if (prev.completedLessonIds.includes(lessonId)) return prev;
      return {
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId],
        xp: prev.xp + 50,
      };
    });
  };

  const handleUpdateFutureInputs = (currentSavings: number, monthlySaving: number) => {
    setState((prev) => ({
      ...prev,
      futureCurrentSavings: currentSavings,
      futureMonthlySaving: monthlySaving,
    }));
  };

  const handleUpdateProfile = (name: string, roleLabel: string, targetSavingsRate: number) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        name,
        roleLabel,
        targetSavingsRate,
      },
    }));
  };

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  const activeNavMeta = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];
  const groups: Array<'Core' | 'Planning & AI' | 'Safety & Growth' | 'System'> = [
    'Core',
    'Planning & AI',
    'Safety & Growth',
    'System',
  ];

  const renderSidebarLinks = (onPick?: () => void) => (
    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
      {groups.map((group) => (
        <div key={group} className="space-y-1">
          <div className="px-3 text-[11px] font-medium text-slate-500">{group}</div>
          {NAV_ITEMS.filter((n) => n.group === group).map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  if (onPick) onPick();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-indigo-600/20 text-white border border-indigo-400/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-300' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-[#080D1A] border-r border-white/[0.07]">
        <div className="px-5 py-5 border-b border-white/[0.07] flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToLanding}
            className="text-lg font-display font-bold tracking-tight text-white hover:text-indigo-300 transition-colors cursor-pointer"
          >
            FINWISE 2.0
          </button>
        </div>

        {renderSidebarLinks()}

        <div className="p-4 border-t border-white/[0.07] space-y-2">
          <div className="text-xs font-medium text-white truncate">{state.profile.name}</div>
          <div className="text-[11px] text-slate-400 truncate">{state.profile.roleLabel}</div>
          <button
            type="button"
            onClick={handleBackToLanding}
            className="w-full py-1.5 px-3 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] rounded-lg transition-colors cursor-pointer text-center"
          >
            View Landing Page
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-[#080D1A] border-r border-white/[0.08] flex flex-col h-full z-10">
            <div className="px-5 py-4 border-b border-white/[0.07] flex items-center justify-between">
              <span className="text-lg font-display font-bold text-white">FINWISE 2.0</span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
                className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {renderSidebarLinks(() => setMobileMenuOpen(false))}
            <div className="p-4 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={handleBackToLanding}
                className="w-full py-2 text-xs font-medium text-slate-300 bg-white/[0.05] rounded-lg cursor-pointer"
              >
                Back to Homepage
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Workspace Header */}
        <header className="sticky top-0 z-30 bg-[#060913]/90 backdrop-blur-md border-b border-white/[0.07] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-sm text-slate-400 truncate">
              <span>FINWISE 2.0</span>
              <span className="mx-2 text-slate-600">/</span>
              <span className="text-white font-medium">{activeNavMeta.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-mono text-emerald-400">
              {state.xp} XP · {state.streakDays}d streak
            </span>
            <button
              type="button"
              onClick={handleResetDemo}
              title="Restore sample INR demo dataset"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </header>

        {/* Active View Viewport */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              state={state}
              onNavigate={setActiveTab}
              onResetDemo={handleResetDemo}
            />
          )}
          {activeTab === 'budget' && (
            <BudgetPlannerView
              state={state}
              onUpdateIncome={handleUpdateIncome}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onUpdateCategoryLimit={handleUpdateCategoryLimit}
            />
          )}
          {activeTab === 'assistant' && <AIAssistantView state={state} />}
          {activeTab === 'goals' && (
            <SavingsGoalsView
              state={state}
              onAddGoal={handleAddGoal}
              onContributeGoal={handleContributeGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          )}
          {activeTab === 'simulator' && <WhatIfSimulatorView state={state} />}
          {activeTab === 'health' && (
            <HealthScoreView state={state} onNavigate={setActiveTab} />
          )}
          {activeTab === 'future' && (
            <FinancialFutureView
              state={state}
              onUpdateFutureInputs={handleUpdateFutureInputs}
            />
          )}
          {activeTab === 'scam' && <ScamDetectorView />}
          {activeTab === 'missions' && (
            <MoneyMissionsView
              state={state}
              onCompleteMission={handleCompleteMission}
            />
          )}
          {activeTab === 'learn' && (
            <LearningHubView
              state={state}
              onCompleteLesson={handleCompleteLesson}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsView
              state={state}
              onUpdateProfile={handleUpdateProfile}
              onResetDemo={handleResetDemo}
            />
          )}
        </main>
      </div>
    </div>
  );
}
