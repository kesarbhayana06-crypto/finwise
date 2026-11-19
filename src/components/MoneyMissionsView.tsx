import React, { useState } from 'react';
import { Award, CheckCircle2, Flame, ShieldCheck, Trophy } from 'lucide-react';
import type { FinwiseState, Mission } from '../types/finance';
import { MISSIONS_CATALOG } from '../data/demoData';

interface MoneyMissionsViewProps {
  state: FinwiseState;
  onCompleteMission: (missionId: string, xpEarned: number) => void;
}

const BADGES = [
  { id: 'b1', name: 'First Step', reqXp: 100, desc: 'Earned 100+ XP in money missions' },
  { id: 'b2', name: 'Scam Shield', reqXp: 250, desc: 'Completed UPI safety & habit tasks' },
  { id: 'b3', name: 'Habit Architect', reqXp: 450, desc: 'Consistent budgeting & quiz mastery' },
  { id: 'b4', name: 'Finwise Champion', reqXp: 700, desc: 'Completed almost every mission' },
];

export function MoneyMissionsView({ state, onCompleteMission }: MoneyMissionsViewProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<string, string>>({});

  const completedCount = state.completedMissionIds.length;
  const totalCount = MISSIONS_CATALOG.length;
  const level = Math.floor(state.xp / 200) + 1;
  const levelProgressPct = Math.round(((state.xp % 200) / 200) * 100);

  const handleQuizSubmit = (mission: Mission) => {
    if (!mission.quizQuestion) return;
    const choice = selectedAnswers[mission.id];
    if (choice === undefined) {
      setQuizFeedback((p) => ({ ...p, [mission.id]: 'Pick an option before submitting.' }));
      return;
    }
    if (choice === mission.quizQuestion.correctIndex) {
      setQuizFeedback((p) => ({
        ...p,
        [mission.id]: `Correct! ${mission.quizQuestion?.explanation}`,
      }));
      onCompleteMission(mission.id, mission.xp);
    } else {
      setQuizFeedback((p) => ({
        ...p,
        [mission.id]: `Not quite — hint: ${mission.quizQuestion?.explanation}`,
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Money Missions
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Build daily financial discipline, pass UPI safety challenges, and unlock habit badges
        </p>
      </div>

      {/* XP, Level & Streak Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Level {level} Strategist</span>
            <span className="font-mono text-indigo-300">{state.xp} XP</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${levelProgressPct}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {200 - (state.xp % 200)} XP to Level {level + 1}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex items-center gap-4">
          <Flame className="w-7 h-7 text-amber-400 shrink-0" />
          <div>
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {state.streakDays} Days
            </div>
            <div className="text-xs text-slate-400">Active learning & tracking streak</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex items-center gap-4">
          <Trophy className="w-7 h-7 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {completedCount} / {totalCount}
            </div>
            <div className="text-xs text-slate-400">Missions completed</div>
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {MISSIONS_CATALOG.map((mission) => {
          const isDone = state.completedMissionIds.includes(mission.id);
          return (
            <div
              key={mission.id}
              className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-indigo-300 font-medium">
                    {mission.category} · +{mission.xp} XP
                  </span>
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                  )}
                </div>
                <h2 className="text-base font-display font-semibold text-white">
                  {mission.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {mission.description}
                </p>
              </div>

              {mission.quizQuestion ? (
                <div className="space-y-3 pt-3 border-t border-white/[0.07]">
                  <div className="text-xs font-medium text-slate-200">
                    {mission.quizQuestion.prompt}
                  </div>
                  <div className="space-y-2">
                    {mission.quizQuestion.options.map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                          selectedAnswers[mission.id] === idx
                            ? 'bg-indigo-600/20 border-indigo-400 text-white'
                            : 'bg-white/[0.03] border-white/[0.07] text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`quiz-${mission.id}`}
                          checked={selectedAnswers[mission.id] === idx}
                          onChange={() =>
                            setSelectedAnswers((prev) => ({ ...prev, [mission.id]: idx }))
                          }
                          className="mt-0.5 accent-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                  {quizFeedback[mission.id] && (
                    <div className="text-xs text-emerald-300 bg-white/[0.03] p-2.5 rounded-lg">
                      {quizFeedback[mission.id]}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={isDone}
                    onClick={() => handleQuizSubmit(mission)}
                    className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-emerald-600/30 disabled:text-emerald-300 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    {isDone ? 'Challenge Passed' : 'Verify Answer & Claim XP'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isDone}
                  onClick={() => onCompleteMission(mission.id, mission.xp)}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] hover:bg-indigo-600 disabled:bg-emerald-600/20 disabled:text-emerald-300 border border-white/[0.08] text-xs font-semibold text-white transition-colors cursor-pointer"
                >
                  {isDone ? 'Completed' : `Mark Complete (+${mission.xp} XP)`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Unlockable Badges */}
      <div className="p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
        <h2 className="text-base font-display font-semibold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-400" />
          Milestone Badges
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {BADGES.map((badge) => {
            const unlocked = state.xp >= badge.reqXp;
            return (
              <div
                key={badge.id}
                className={`p-4 rounded-xl border transition-colors ${
                  unlocked
                    ? 'bg-indigo-500/10 border-indigo-400/40'
                    : 'bg-white/[0.02] border-white/[0.06] opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <ShieldCheck
                    className={`w-5 h-5 ${unlocked ? 'text-emerald-400' : 'text-slate-500'}`}
                  />
                  <span className="text-[11px] font-mono text-slate-400">{badge.reqXp} XP</span>
                </div>
                <div className="text-sm font-semibold text-white mt-2">{badge.name}</div>
                <p className="text-xs text-slate-400 mt-1">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
