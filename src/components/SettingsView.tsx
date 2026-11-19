import React, { useState } from 'react';
import { CheckCircle2, Download, RotateCcw, Save } from 'lucide-react';
import type { FinwiseState } from '../types/finance';

interface SettingsViewProps {
  state: FinwiseState;
  onUpdateProfile: (name: string, roleLabel: string, targetSavingsRate: number) => void;
  onResetDemo: () => void;
}

export function SettingsView({
  state,
  onUpdateProfile,
  onResetDemo,
}: SettingsViewProps) {
  const [name, setName] = useState(state.profile.name);
  const [roleLabel, setRoleLabel] = useState(state.profile.roleLabel);
  const [targetRate, setTargetRate] = useState(String(state.profile.targetSavingsRate));
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim() || 'Student User';
    const cleanRole = roleLabel.trim() || 'Sample Demo Profile';
    const rate = Math.min(80, Math.max(5, Number(targetRate) || 20));
    onUpdateProfile(cleanName, cleanRole, rate);
    setSavedMsg('Profile preferences saved to local browser storage.');
    setTimeout(() => setSavedMsg(null), 3500);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finwise-2-0-snapshot.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Workspace Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Personalize your profile, export a backup snapshot, or reset the sample INR demo data
        </p>
      </div>

      {/* Profile Preferences */}
      <form
        onSubmit={handleSave}
        className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-5"
      >
        <h2 className="text-base font-display font-semibold text-white">Demo Profile</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="prof-name" className="block text-xs text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              id="prof-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div>
            <label htmlFor="prof-role" className="block text-xs text-slate-300 mb-1.5">
              Student / Learner Label
            </label>
            <input
              id="prof-role"
              type="text"
              value={roleLabel}
              onChange={(e) => setRoleLabel(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>

        <div className="max-w-xs">
          <label htmlFor="prof-rate" className="block text-xs text-slate-300 mb-1.5">
            Target Savings Rate (%)
          </label>
          <input
            id="prof-rate"
            type="number"
            min={5}
            max={80}
            value={targetRate}
            onChange={(e) => setTargetRate(e.target.value)}
            className="w-full px-3.5 py-2 text-sm font-mono bg-white/[0.04] border border-white/[0.1] rounded-lg text-white focus:outline-none focus:border-indigo-400"
          />
        </div>

        {savedMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedMsg}</span>
          </div>
        )}

        <button
          type="submit"
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Preferences
        </button>
      </form>

      {/* Data Persistence & Reset Demo */}
      <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
        <h2 className="text-base font-display font-semibold text-white">
          Demo Data & Local Storage
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          All budgets, expenses, goals, mission XP, and lesson completions are saved automatically in your browser’s localStorage so your session persists across refreshes. FINWISE 2.0 does not connect to real banks or process payments.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] rounded-xl cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Export JSON Snapshot
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-xl cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Demo Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetDemo();
                  setConfirmReset(false);
                  setName('Aarav Sharma');
                  setRoleLabel('B.Tech Student · Sample Demo Profile');
                  setTargetRate('25');
                  setSavedMsg('Demo data restored to original sample INR state.');
                }}
                className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-xl cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2.5 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
