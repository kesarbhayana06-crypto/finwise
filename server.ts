import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractErrorDetails(err: unknown): { status: number; message: string; code: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw.includes('403') || raw.includes('PERMISSION_DENIED')) {
    return { status: 403, message: 'Gemini API permission denied. Check GEMINI_API_KEY in Settings > Secrets.', code: 'PERMISSION_DENIED' };
  }
  if (raw.includes('400') || raw.includes('API_KEY_INVALID')) {
    return { status: 400, message: 'Invalid Gemini API key. Check GEMINI_API_KEY in Settings > Secrets.', code: 'API_KEY_INVALID' };
  }
  if (raw.includes('429') || raw.includes('RESOURCE_EXHAUSTED')) {
    return { status: 429, message: 'Gemini API rate limit reached. Please try again shortly.', code: 'RESOURCE_EXHAUSTED' };
  }
  if (raw.includes('404') || raw.includes('NOT_FOUND')) {
    return { status: 404, message: 'Requested Gemini model was not found.', code: 'MODEL_NOT_FOUND' };
  }
  return { status: 500, message: raw || 'Failed to generate AI response.', code: 'AI_UPSTREAM_ERROR' };
}

interface AssistantRequestBody {
  message?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  financialContext?: {
    userName?: string;
    monthlyIncome?: number;
    totalExpenses?: number;
    availableBalance?: number;
    monthlySavings?: number;
    savingsRate?: number;
    healthScore?: number;
    topCategories?: Array<{ category: string; spent: number; limit: number }>;
    goalsSummary?: Array<{ title: string; saved: number; target: number }>;
  };
}

interface ScamAnalyzeBody {
  text?: string;
}

interface BudgetInsightsBody {
  monthlyIncome?: number;
  totalExpenses?: number;
  monthlySavings?: number;
  categories?: Array<{ category: string; spent: number; limit: number }>;
}

async function createServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    const client = getGeminiClient();
    res.json({
      ok: true,
      geminiConfigured: client !== null,
      model: MODEL_NAME,
    });
  });

  app.post('/api/ai/assistant', async (req: Request, res: Response) => {
    const body = req.body as AssistantRequestBody;
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!message) {
      res.status(400).json({ error: 'Please enter a financial question.', code: 'EMPTY_MESSAGE' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Live Gemini AI is currently unavailable because GEMINI_API_KEY is not configured.',
        code: 'GEMINI_NOT_CONFIGURED',
      });
      return;
    }

    const ctx = body.financialContext || {};
    const topCats = Array.isArray(ctx.topCategories)
      ? ctx.topCategories.map((c) => `${c.category}: ₹${c.spent} spent (limit ₹${c.limit})`).join('; ')
      : 'No category breakdown provided';
    const goalsText = Array.isArray(ctx.goalsSummary)
      ? ctx.goalsSummary.map((g) => `${g.title}: ₹${g.saved}/₹${g.target}`).join('; ')
      : 'No active goals';

    const systemInstruction = [
      'You are the FINWISE 2.0 AI Money Assistant, a supportive, sharp financial literacy mentor for college students and young adults in India.',
      'Always use Indian Rupees (₹) and practical student-friendly examples (UPI habits, hostel/rent, canteen/food delivery, subscriptions, emergency buffer, compound interest, inflation).',
      'Keep responses concise (120-220 words), structured with short bullet points or clear steps, and grounded in the user financial snapshot below.',
      'Important guardrails: Never ask for OTPs, UPI PINs, passwords, or bank credentials. Never guarantee investment returns; clearly frame projections as educational estimates.',
      '',
      `User Snapshot (${ctx.userName || 'Student User'}):`,
      `- Monthly Income: ₹${ctx.monthlyIncome ?? 0}`,
      `- Total Expenses: ₹${ctx.totalExpenses ?? 0}`,
      `- Available Balance: ₹${ctx.availableBalance ?? 0}`,
      `- Monthly Savings Allocation: ₹${ctx.monthlySavings ?? 0} (${ctx.savingsRate ?? 0}% of income)`,
      `- Educational Financial Health Score: ${ctx.healthScore ?? 0}/100`,
      `- Category Breakdown: ${topCats}`,
      `- Savings Goals: ${goalsText}`,
    ].join('\n');

    const recentHistory = Array.isArray(body.history)
      ? body.history.slice(-8).map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`).join('\n')
      : '';

    const fullPrompt = recentHistory
      ? `Recent conversation:\n${recentHistory}\n\nUser's new question: ${message}`
      : message;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: fullPrompt,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text?.trim();
      if (!reply) {
        res.status(502).json({ error: 'Gemini returned an empty response.', code: 'EMPTY_RESPONSE' });
        return;
      }

      res.json({ reply, model: MODEL_NAME, simulated: false });
    } catch (err) {
      const details = extractErrorDetails(err);
      res.status(details.status).json({ error: details.message, code: details.code });
    }
  });

  app.post('/api/ai/scam-analyze', async (req: Request, res: Response) => {
    const body = req.body as ScamAnalyzeBody;
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!text) {
      res.status(400).json({ error: 'Please paste a message to analyze.', code: 'EMPTY_TEXT' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Live Gemini AI scam analysis is unavailable because GEMINI_API_KEY is not configured.',
        code: 'GEMINI_NOT_CONFIGURED',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Analyze this message for financial, banking, UPI, job, or phishing scam indicators:\n\n"""\n${text.slice(0, 3500)}\n"""`,
        config: {
          systemInstruction:
            'You are a digital payment safety educator for Indian students and young adults. Evaluate messages objectively for scam red flags (urgency, OTP/PIN phishing, fake KYC/bank account suspension, suspicious links, UPI collect scams, lottery/part-time job bait, impersonation). Remind users that automated detection is educational and not guaranteed, and never request sensitive credentials.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskLevel: {
                type: Type.STRING,
                description: 'Must be one of: HIGH, MEDIUM, LOW',
              },
              riskScore: {
                type: Type.INTEGER,
                description: 'Risk score from 0 (safe) to 100 (likely scam)',
              },
              headline: {
                type: Type.STRING,
                description: 'Concise 1-sentence verdict',
              },
              redFlags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Specific warning signs detected in the message',
              },
              explanation: {
                type: Type.STRING,
                description: 'Clear 2-3 sentence educational explanation of why this message is risky or safe',
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2-4 concrete safe next steps the user should take',
              },
            },
            required: ['riskLevel', 'riskScore', 'headline', 'redFlags', 'explanation', 'recommendedActions'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ ...parsed, simulated: false });
    } catch (err) {
      const details = extractErrorDetails(err);
      res.status(details.status).json({ error: details.message, code: details.code });
    }
  });

  app.post('/api/ai/budget-insights', async (req: Request, res: Response) => {
    const body = req.body as BudgetInsightsBody;
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'Live Gemini AI insights unavailable because GEMINI_API_KEY is not configured.',
        code: 'GEMINI_NOT_CONFIGURED',
      });
      return;
    }

    const categoriesText = Array.isArray(body.categories)
      ? body.categories.map((c) => `${c.category}: spent ₹${c.spent} vs limit ₹${c.limit}`).join('\n')
      : 'None';

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Monthly Income: ₹${body.monthlyIncome ?? 0}\nTotal Expenses: ₹${body.totalExpenses ?? 0}\nMonthly Savings: ₹${body.monthlySavings ?? 0}\nCategories:\n${categoriesText}\n\nProvide 3 concise, high-impact INR budgeting suggestions tailored to this snapshot.`,
        config: {
          systemInstruction:
            'You are a practical personal finance coach for young adults in India. Give specific, realistic INR action steps based strictly on the numbers provided.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    impact: { type: Type.STRING },
                    detail: { type: Type.STRING },
                  },
                  required: ['title', 'impact', 'detail'],
                },
              },
            },
            required: ['summary', 'suggestions'],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ ...parsed, simulated: false });
    } catch (err) {
      const details = extractErrorDetails(err);
      res.status(details.status).json({ error: details.message, code: details.code });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FINWISE 2.0 server listening on http://0.0.0.0:${PORT}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
