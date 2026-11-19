import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { ScamAnalysisResult } from '../types/finance';
import { SCAM_SAMPLE_MESSAGES } from '../data/demoData';
import { analyzeScamLocally } from '../utils/finance';

export function ScamDetectorView() {
  const [messageText, setMessageText] = useState(SCAM_SAMPLE_MESSAGES[0].text);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScamAnalysisResult | null>(() =>
    analyzeScamLocally(SCAM_SAMPLE_MESSAGES[0].text)
  );
  const [inputError, setInputError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    const clean = messageText.trim();
    if (!clean) {
      setInputError('Paste an SMS, email, WhatsApp message, or payment alert to analyze.');
      return;
    }
    setInputError(null);
    setLoading(true);

    const localResult = analyzeScamLocally(clean);

    try {
      const res = await fetch('/api/ai/scam-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: clean }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResult({
          ...localResult,
          apiError: data.error || 'Live Gemini AI unavailable; showing local pattern check.',
        });
      } else {
        setResult({
          riskLevel: data.riskLevel === 'HIGH' || data.riskLevel === 'MEDIUM' ? data.riskLevel : 'LOW',
          riskScore: Number(data.riskScore) || localResult.riskScore,
          headline: data.headline || localResult.headline,
          redFlags: Array.isArray(data.redFlags) ? data.redFlags : localResult.redFlags,
          matchedPhrases: localResult.matchedPhrases,
          explanation: data.explanation || localResult.explanation,
          recommendedActions: Array.isArray(data.recommendedActions)
            ? data.recommendedActions
            : localResult.recommendedActions,
          source: 'gemini',
        });
      }
    } catch {
      setResult({
        ...localResult,
        apiError: 'Unable to reach Gemini endpoint; showing local pattern check.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-white/[0.08]">
        <h1 className="text-2xl font-display font-bold text-white tracking-tight">
          Smart Scam Detector
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Inspect suspicious SMS, emails, UPI alerts, or job offers for phishing and impersonation red flags
        </p>
      </div>

      {/* Explicit Safety Guardrail */}
      <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-start gap-3 text-xs text-slate-200">
        <ShieldCheck className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white">Safety Notice:</span> Never paste real OTPs, UPI PINs, passwords, or card CVVs. Automated scam detection is educational and <span className="underline">not guaranteed</span>—always verify directly inside your official banking app.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Input Area */}
        <div className="xl:col-span-6 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-4">
          <div>
            <div className="text-xs text-slate-400 mb-2">Load a realistic sample to test:</div>
            <div className="flex flex-wrap gap-2">
              {SCAM_SAMPLE_MESSAGES.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    setMessageText(sample.text);
                    setInputError(null);
                    setResult(analyzeScamLocally(sample.text));
                  }}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] text-slate-200 transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="scam-textarea" className="block text-xs text-slate-300 mb-1.5">
              Suspicious SMS, Email, or Payment Message
            </label>
            <textarea
              id="scam-textarea"
              rows={6}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Paste suspicious message text here..."
              className="w-full p-3.5 text-sm bg-white/[0.04] border border-white/[0.1] rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400 leading-relaxed"
            />
          </div>

          {inputError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
              {inputError}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setMessageText('');
                setResult(null);
              }}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-white/[0.04] rounded-lg cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl transition-colors cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning Message...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze Message
                </>
              )}
            </button>
          </div>
        </div>

        {/* Analysis Result Panel */}
        <div className="xl:col-span-6 p-6 rounded-2xl bg-[#0C1222] border border-white/[0.08] space-y-5">
          {!result ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-500" />
              <div className="text-sm font-medium text-slate-300">Ready to inspect any message</div>
              <p className="text-xs text-slate-400 max-w-sm">
                Paste a suspicious alert on the left or pick a sample scenario to view detected warning signs and safe next steps.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  {result.riskLevel === 'HIGH' ? (
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                  ) : result.riskLevel === 'MEDIUM' ? (
                    <AlertTriangle className="w-6 h-6 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  )}
                  <div>
                    <div
                      className={`text-sm font-bold ${
                        result.riskLevel === 'HIGH'
                          ? 'text-rose-400'
                          : result.riskLevel === 'MEDIUM'
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {result.riskLevel} RISK · Score {result.riskScore}/100
                    </div>
                    <div className="text-xs text-slate-400">
                      {result.source === 'gemini'
                        ? 'Evaluated with Gemini AI + Pattern Rules'
                        : 'Evaluated with Pattern Rules (Educational Check)'}
                    </div>
                  </div>
                </div>
              </div>

              {result.apiError && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
                  {result.apiError}
                </div>
              )}

              <div>
                <h2 className="text-base font-display font-semibold text-white">{result.headline}</h2>
                <p className="text-sm text-slate-300 mt-1.5 leading-relaxed">{result.explanation}</p>
              </div>

              {result.redFlags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-200">Warning Signs Identified</div>
                  <ul className="space-y-1.5">
                    {result.redFlags.map((flag, i) => (
                      <li key={i} className="text-xs text-rose-300 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.matchedPhrases.length > 0 && (
                <div className="text-xs text-slate-400">
                  Trigger phrases spotted:{' '}
                  <span className="font-mono text-amber-300">
                    {result.matchedPhrases.join(' · ')}
                  </span>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-white/[0.07]">
                <div className="text-xs font-semibold text-emerald-400">Recommended Safe Actions</div>
                <ul className="space-y-1.5">
                  {result.recommendedActions.map((act, i) => (
                    <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
