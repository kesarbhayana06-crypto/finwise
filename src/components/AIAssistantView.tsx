import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Bot, Loader2, Send, Sparkles } from 'lucide-react';
import type { ChatMessage, FinwiseState } from '../types/finance';
import { CATEGORY_COLORS } from '../data/demoData';
import {
  computeFinancialMetrics,
  formatINR,
  simulateAssistantReply,
} from '../utils/finance';
import { RadialGauge, SpendingDonutChart } from './Charts';

interface AIAssistantViewProps {
  state: FinwiseState;
}

const QUICK_PROMPTS = [
  'How can I save more from my current monthly budget?',
  'Explain compound interest with an INR student example',
  'How does inflation affect my idle savings?',
  'Give me practical ways to stop impulse UPI spending',
  'Audit my spending categories and suggest one cutback',
];

function formatMessageLine(line: string, idx: number) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <p key={idx} className={idx > 0 ? 'mt-1.5' : ''}>
      {parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-white">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={pIdx}>{part}</React.Fragment>;
      })}
    </p>
  );
}

export function AIAssistantView({ state }: AIAssistantViewProps) {
  const metrics = useMemo(() => computeFinancialMetrics(state), [state]);
  const [geminiOnline, setGeminiOnline] = useState<boolean | null>(null);
  const [useSimulatedMode, setUseSimulatedMode] = useState(false);
  const [lastApiError, setLastApiError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Hi ${state.profile.name}! I can see your current monthly income is **${formatINR(state.monthlyIncome)}**, expenses are **${formatINR(metrics.totalExpenses)}**, and your savings rate is **${metrics.savingsRate}%**.\n\nAsk me anything about budgeting, saving strategies, inflation, compound interest, or managing student expenses.`,
      timestamp: 'Now',
      mode: 'gemini',
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setGeminiOnline(Boolean(data.geminiConfigured));
      })
      .catch(() => {
        if (!mounted) return;
        setGeminiOnline(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (textOverride?: string) => {
    const query = (textOverride ?? input).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textOverride) setInput('');
    setLastApiError(null);

    if (useSimulatedMode) {
      const simulated = simulateAssistantReply(query, state, metrics);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: simulated,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'simulated',
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          financialContext: {
            userName: state.profile.name,
            monthlyIncome: state.monthlyIncome,
            totalExpenses: metrics.totalExpenses,
            availableBalance: metrics.availableBalance,
            monthlySavings: metrics.monthlySavings,
            savingsRate: metrics.savingsRate,
            healthScore: metrics.healthScore,
            topCategories: metrics.categoryStats.slice(0, 5).map((c) => ({
              category: c.category,
              spent: c.spent,
              limit: c.limit,
            })),
            goalsSummary: state.goals.map((g) => ({
              title: g.title,
              saved: g.saved,
              target: g.target,
            })),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const errMsg = data.error || 'Gemini AI is currently unavailable.';
        setLastApiError(errMsg);
        const simulated = simulateAssistantReply(query, state, metrics);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-err-${Date.now()}`,
            role: 'assistant',
            content: `**Simulated Demo Reply** *(Live Gemini API unavailable: ${errMsg})*\n\n${simulated}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: 'simulated',
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: 'gemini',
          },
        ]);
      }
    } catch {
      const errMsg = 'Unable to reach server AI endpoint.';
      setLastApiError(errMsg);
      const simulated = simulateAssistantReply(query, state, metrics);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-sim-${Date.now()}`,
          role: 'assistant',
          content: `**Simulated Demo Reply** *(${errMsg})*\n\n${simulated}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: 'simulated',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const donutSlices = metrics.categoryStats.map((c) => ({
    label: c.category,
    value: c.spent,
    color: CATEGORY_COLORS[c.category],
  }));

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Gemini AI Money Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personalized financial literacy guidance grounded in your live INR budget
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {useSimulatedMode
              ? 'Mode: Simulated Demo Assistant'
              : geminiOnline === true
              ? 'Mode: Live Gemini AI'
              : geminiOnline === false
              ? 'Mode: Gemini Key Missing (Simulated Fallback Active)'
              : 'Checking AI status...'}
          </span>
          <button
            type="button"
            onClick={() => setUseSimulatedMode((v) => !v)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-200 cursor-pointer whitespace-nowrap shrink-0"
          >
            {useSimulatedMode ? 'Use Live Gemini' : 'Test Simulated Mode'}
          </button>
        </div>
      </div>

      {lastApiError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Live Gemini Notice:</span> {lastApiError} Responses below are clearly labeled as Simulated Demo Mode.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Main Chat Interface */}
        <div className="xl:col-span-8 rounded-2xl bg-[#0C1222] border border-white/[0.08] flex flex-col h-[620px]">
          <div className="p-4 border-b border-white/[0.07] flex flex-wrap items-center gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendMessage(prompt)}
                className="px-3 py-1.5 text-xs text-slate-200 bg-white/[0.04] hover:bg-indigo-600/30 border border-white/[0.08] rounded-lg transition-colors cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/[0.04] border border-white/[0.08] text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[11px] opacity-80">
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      {msg.role === 'assistant' ? (
                        <>
                          <Bot className="w-3.5 h-3.5 text-indigo-300" />
                          {msg.mode === 'simulated'
                            ? 'FINWISE Simulated Demo Assistant'
                            : 'FINWISE Gemini AI'}
                        </>
                      ) : (
                        state.profile.name
                      )}
                    </span>
                    <span className="font-mono">{msg.timestamp}</span>
                  </div>
                  <div>{msg.content.split('\n').map((line, i) => formatMessageLine(line, i))}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3 bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Analyzing your financial context with Gemini...
                </div>
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-4 border-t border-white/[0.08] flex items-center gap-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about saving, budgets, compound interest, or student expenses..."
              className="flex-1 bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-semibold text-white inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </form>
        </div>

        {/* Live Context Sidebar Panel */}
        <div className="xl:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-display font-semibold text-white">
                Context Shared With AI
              </h2>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-4 pt-1">
              <RadialGauge
                value={metrics.healthScore}
                size={76}
                strokeWidth={8}
                color="#818cf8"
                label={`${metrics.healthScore}`}
              />
              <div className="text-xs space-y-1 text-slate-300">
                <div>
                  Income: <span className="font-mono text-white">{formatINR(state.monthlyIncome)}</span>
                </div>
                <div>
                  Spent: <span className="font-mono text-white">{formatINR(metrics.totalExpenses)}</span>
                </div>
                <div>
                  Savings Rate: <span className="font-mono text-emerald-400">{metrics.savingsRate}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
            <h2 className="text-sm font-display font-semibold text-white">
              Current Month Spending
            </h2>
            <SpendingDonutChart slices={donutSlices} centerLabel="Spent" />
          </div>
        </div>
      </div>
    </div>
  );
}
