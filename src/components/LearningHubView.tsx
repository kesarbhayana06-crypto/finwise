import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';
import type { FinwiseState } from '../types/finance';
import { LEARNING_LESSONS } from '../data/demoData';

interface LearningHubViewProps {
  state: FinwiseState;
  onCompleteLesson: (lessonId: string) => void;
}

export function LearningHubView({ state, onCompleteLesson }: LearningHubViewProps) {
  const [activeLessonId, setActiveLessonId] = useState(LEARNING_LESSONS[0].id);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [quizFeedback, setQuizFeedback] = useState<Record<string, { ok: boolean; msg: string }>>({});

  const activeLesson =
    LEARNING_LESSONS.find((l) => l.id === activeLessonId) || LEARNING_LESSONS[0];

  const completedCount = state.completedLessonIds.length;
  const totalCount = LEARNING_LESSONS.length;
  const progressPct = Math.round((completedCount / totalCount) * 100);
  const isCompleted = state.completedLessonIds.includes(activeLesson.id);

  const checkQuiz = () => {
    let allCorrect = true;
    for (let i = 0; i < activeLesson.quizzes.length; i++) {
      const key = `${activeLesson.id}-${i}`;
      if (answers[key] !== activeLesson.quizzes[i].correctIndex) {
        allCorrect = false;
        break;
      }
    }

    if (allCorrect) {
      setQuizFeedback((prev) => ({
        ...prev,
        [activeLesson.id]: {
          ok: true,
          msg: 'All answers correct! Lesson marked as completed (+50 XP).',
        },
      }));
      onCompleteLesson(activeLesson.id);
    } else {
      setQuizFeedback((prev) => ({
        ...prev,
        [activeLesson.id]: {
          ok: false,
          msg: 'Check your selected answers — review the lesson rule above and try again.',
        },
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Financial Learning Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            7 practical lessons with Indian student examples and quick knowledge checks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-mono tabular-nums text-white">
              {completedCount} / {totalCount} Completed ({progressPct}%)
            </div>
            <div className="w-36 h-1.5 rounded-full bg-white/[0.08] overflow-hidden mt-1">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lesson Selector List */}
        <div className="lg:col-span-4 space-y-2">
          {LEARNING_LESSONS.map((lesson, index) => {
            const active = lesson.id === activeLesson.id;
            const done = state.completedLessonIds.includes(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setActiveLessonId(lesson.id)}
                className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                  active
                    ? 'bg-indigo-600/20 border-indigo-400/60 text-white'
                    : 'bg-[#0C1222] border-white/[0.08] text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <span>0{index + 1}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lesson.level}</span>
                    <span aria-hidden="true">·</span>
                    <span>{lesson.duration}</span>
                  </div>
                  <div className="text-sm font-semibold truncate mt-0.5">{lesson.title}</div>
                </div>
                {done ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Lesson Content */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-white/[0.08]">
            <div>
              <div className="text-xs text-indigo-300 font-medium flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{activeLesson.level}</span>
                <span aria-hidden="true">·</span>
                <span>{activeLesson.duration} read</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1.5">
                {activeLesson.title}
              </h2>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{activeLesson.summary}</p>
            </div>
            {isCompleted && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Completed
              </span>
            )}
          </div>

          {/* Core Rule Highlight */}
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-400/25">
            <div className="text-xs font-semibold text-indigo-300">Core Rule of Thumb</div>
            <div className="text-sm font-medium text-white mt-1">{activeLesson.keyRule}</div>
          </div>

          {/* Lesson Sections */}
          <div className="space-y-5">
            {activeLesson.sections.map((sec) => (
              <div key={sec.heading} className="space-y-1.5">
                <h3 className="text-base font-display font-semibold text-white">{sec.heading}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{sec.body}</p>
              </div>
            ))}
          </div>

          {/* Real INR Example */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
            <div className="text-xs font-semibold text-emerald-300">Practical INR Example</div>
            <p className="text-sm text-slate-200 leading-relaxed">{activeLesson.indianExample}</p>
          </div>

          {/* Knowledge Check Quiz */}
          <div className="pt-5 border-t border-white/[0.08] space-y-5">
            <h3 className="text-base font-display font-semibold text-white">
              Quick Check — Complete Lesson
            </h3>

            {activeLesson.quizzes.map((q, qIdx) => {
              const key = `${activeLesson.id}-${qIdx}`;
              return (
                <div key={key} className="space-y-2.5">
                  <div className="text-sm font-medium text-slate-200">
                    {qIdx + 1}. {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => (
                      <label
                        key={oIdx}
                        className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                          answers[key] === oIdx
                            ? 'bg-indigo-600/20 border-indigo-400 text-white'
                            : 'bg-white/[0.03] border-white/[0.07] text-slate-300 hover:bg-white/[0.06]'
                        }`}
                      >
                        <input
                          type="radio"
                          name={key}
                          checked={answers[key] === oIdx}
                          onChange={() => setAnswers((prev) => ({ ...prev, [key]: oIdx }))}
                          className="mt-1 accent-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}

            {quizFeedback[activeLesson.id] && (
              <div
                className={`p-3 rounded-lg text-xs ${
                  quizFeedback[activeLesson.id].ok
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                }`}
              >
                {quizFeedback[activeLesson.id].msg}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={checkQuiz}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors cursor-pointer"
              >
                Check Answers & Complete Lesson
              </button>
              {!isCompleted && (
                <button
                  type="button"
                  onClick={() => onCompleteLesson(activeLesson.id)}
                  className="px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] border border-white/[0.08] rounded-xl cursor-pointer"
                >
                  Mark Read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
