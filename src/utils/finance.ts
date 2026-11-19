import type {
  ExpenseCategory,
  FinwiseState,
  ScamAnalysisResult,
} from '../types/finance';
import { EXPENSE_CATEGORIES } from '../data/demoData';

export function formatINR(value: number): string {
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(safe);
}

export interface ComputedCategoryStat {
  category: ExpenseCategory;
  spent: number;
  limit: number;
  pctUsed: number;
  overLimit: boolean;
}

export interface HealthPillar {
  label: string;
  score: number;
  maxScore: number;
  status: 'Strong' | 'Moderate' | 'Needs Focus';
  detail: string;
}

export interface FinancialMetrics {
  totalExpenses: number;
  availableBalance: number;
  monthlySavings: number;
  savingsRate: number;
  totalBudgetLimit: number;
  budgetUtilization: number;
  categoryStats: ComputedCategoryStat[];
  overBudgetCategories: ComputedCategoryStat[];
  totalSavedInGoals: number;
  totalGoalTargets: number;
  goalsProgressPct: number;
  healthScore: number;
  healthLabel: string;
  healthPillars: HealthPillar[];
  personalizedInsights: Array<{
    title: string;
    detail: string;
    tone: 'positive' | 'warning' | 'info';
  }>;
}

export function computeFinancialMetrics(state: FinwiseState): FinancialMetrics {
  const totalExpenses = state.expenses.reduce((acc, e) => acc + Math.max(0, e.amount), 0);
  const availableBalance = state.monthlyIncome - totalExpenses;
  const monthlySavings = Math.max(0, availableBalance);
  const savingsRate =
    state.monthlyIncome > 0 ? Math.round((monthlySavings / state.monthlyIncome) * 1000) / 10 : 0;

  const categoryTotals: Record<ExpenseCategory, number> = {
    'Food & Dining': 0,
    'Rent & Hostel': 0,
    Transport: 0,
    'Study & Gear': 0,
    Subscriptions: 0,
    Shopping: 0,
    Utilities: 0,
  };

  for (const exp of state.expenses) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  }

  const categoryStats: ComputedCategoryStat[] = EXPENSE_CATEGORIES.map((category) => {
    const spent = categoryTotals[category] || 0;
    const limit = Math.max(1, state.categoryLimits[category] || 1000);
    const pctUsed = Math.round((spent / limit) * 100);
    return {
      category,
      spent,
      limit,
      pctUsed,
      overLimit: spent > limit,
    };
  }).sort((a, b) => b.spent - a.spent);

  const overBudgetCategories = categoryStats.filter((c) => c.overLimit);
  const totalBudgetLimit = EXPENSE_CATEGORIES.reduce(
    (sum, cat) => sum + (state.categoryLimits[cat] || 0),
    0
  );
  const budgetUtilization =
    totalBudgetLimit > 0 ? Math.round((totalExpenses / totalBudgetLimit) * 100) : 0;

  const totalSavedInGoals = state.goals.reduce((s, g) => s + g.saved, 0);
  const totalGoalTargets = state.goals.reduce((s, g) => s + g.target, 0);
  const goalsProgressPct =
    totalGoalTargets > 0 ? Math.min(100, Math.round((totalSavedInGoals / totalGoalTargets) * 100)) : 0;

  // Educational Financial Health Score (0 - 100)
  // 1. Savings Rate (max 35 pts): >=25% gets full 35 pts
  const savingsScore = Math.min(35, Math.max(0, Math.round((Math.max(0, savingsRate) / 25) * 35)));

  // 2. Budget Management (max 25 pts): penalize over-budget categories and overspending
  const overPenalty = overBudgetCategories.length * 5;
  const utilizationBonus = budgetUtilization <= 100 ? 25 : Math.max(5, 25 - Math.round((budgetUtilization - 100) * 0.5));
  const budgetScore = Math.max(0, Math.min(25, utilizationBonus - overPenalty));

  // 3. Expense Tracking & Literacy Habits (max 20 pts): tracked expenses + completed lessons/missions
  const trackingPts = Math.min(10, state.expenses.length >= 5 ? 10 : state.expenses.length * 2);
  const literacyPts = Math.min(10, (state.completedLessonIds.length + state.completedMissionIds.length) * 2);
  const trackingScore = trackingPts + literacyPts;

  // 4. Savings Goal Progress (max 20 pts)
  const goalActivePts = state.goals.length > 0 ? 6 : 0;
  const goalCompletionPts = Math.round((goalsProgressPct / 100) * 14);
  const goalsScore = Math.min(20, goalActivePts + goalCompletionPts);

  const healthScore = Math.max(0, Math.min(100, savingsScore + budgetScore + trackingScore + goalsScore));

  let healthLabel = 'Building Momentum';
  if (healthScore >= 85) healthLabel = 'Thriving Habits';
  else if (healthScore >= 70) healthLabel = 'Healthy Trajectory';
  else if (healthScore >= 50) healthLabel = 'Steady Foundation';
  else healthLabel = 'Needs Attention';

  const healthPillars: HealthPillar[] = [
    {
      label: 'Savings Rate',
      score: savingsScore,
      maxScore: 35,
      status: savingsScore >= 26 ? 'Strong' : savingsScore >= 16 ? 'Moderate' : 'Needs Focus',
      detail: `Saving ${savingsRate}% of monthly income (${formatINR(monthlySavings)}/mo vs 25% benchmark).`,
    },
    {
      label: 'Budget Discipline',
      score: budgetScore,
      maxScore: 25,
      status: budgetScore >= 20 ? 'Strong' : budgetScore >= 13 ? 'Moderate' : 'Needs Focus',
      detail:
        overBudgetCategories.length === 0
          ? `All ${EXPENSE_CATEGORIES.length} categories are within their monthly limits.`
          : `${overBudgetCategories.length} categor${overBudgetCategories.length === 1 ? 'y is' : 'ies are'} above your set cap (${overBudgetCategories.map((c) => c.category).join(', ')}).`,
    },
    {
      label: 'Expense Tracking & Literacy',
      score: trackingScore,
      maxScore: 20,
      status: trackingScore >= 15 ? 'Strong' : trackingScore >= 10 ? 'Moderate' : 'Needs Focus',
      detail: `${state.expenses.length} expenses logged · ${state.completedLessonIds.length} lessons & ${state.completedMissionIds.length} missions completed.`,
    },
    {
      label: 'Savings Goal Progress',
      score: goalsScore,
      maxScore: 20,
      status: goalsScore >= 15 ? 'Strong' : goalsScore >= 9 ? 'Moderate' : 'Needs Focus',
      detail:
        state.goals.length > 0
          ? `${goalsProgressPct}% funded across ${state.goals.length} active savings goals (${formatINR(totalSavedInGoals)}).`
          : 'Create your first savings goal to unlock goal momentum.',
    },
  ];

  const personalizedInsights: FinancialMetrics['personalizedInsights'] = [];
  if (overBudgetCategories.length > 0) {
    const worst = overBudgetCategories[0];
    personalizedInsights.push({
      title: `${worst.category} exceeded limit by ${formatINR(worst.spent - worst.limit)}`,
      detail: `Trimming ${worst.category} back to ${formatINR(worst.limit)} adds ${formatINR((worst.spent - worst.limit) * 12)}/year directly to savings.`,
      tone: 'warning',
    });
  } else {
    personalizedInsights.push({
      title: 'Zero category limit breaches this month',
      detail: `You are using ${budgetUtilization}% of your planned budget caps while keeping ${formatINR(monthlySavings)} unspent.`,
      tone: 'positive',
    });
  }

  if (savingsRate >= 20) {
    personalizedInsights.push({
      title: `${savingsRate}% savings rate puts you ahead of student benchmarks`,
      detail: `Channeling ${formatINR(Math.round(monthlySavings * 0.6))} into your top goal speeds up completion noticeably.`,
      tone: 'positive',
    });
  } else {
    const targetGap = Math.max(0, Math.round(state.monthlyIncome * 0.2 - monthlySavings));
    personalizedInsights.push({
      title: `Close a ${formatINR(targetGap)}/mo gap to reach a 20% savings rate`,
      detail: `Try the What If Simulator with a ₹${Math.max(50, Math.ceil(targetGap / 30 / 10) * 10)}/day cutback to visualize the 12-month impact.`,
      tone: 'info',
    });
  }

  const topCategory = categoryStats[0];
  if (topCategory && topCategory.spent > 0) {
    const share = totalExpenses > 0 ? Math.round((topCategory.spent / totalExpenses) * 100) : 0;
    personalizedInsights.push({
      title: `${topCategory.category} accounts for ${share}% of spending`,
      detail: `Total ${formatINR(topCategory.spent)} spent this month. Review individual entries in Budget Planner for easy wins.`,
      tone: 'info',
    });
  }

  return {
    totalExpenses,
    availableBalance,
    monthlySavings,
    savingsRate,
    totalBudgetLimit,
    budgetUtilization,
    categoryStats,
    overBudgetCategories,
    totalSavedInGoals,
    totalGoalTargets,
    goalsProgressPct,
    healthScore,
    healthLabel,
    healthPillars,
    personalizedInsights,
  };
}

export function analyzeScamLocally(rawText: string): ScamAnalysisResult {
  const text = rawText.trim();
  const lower = text.toLowerCase();

  const rules: Array<{ pattern: RegExp; flag: string; weight: number }> = [
    {
      pattern: /\b(urgent|immediately|within \d+ hours?|before midnight|last warning|suspended|blocked|freeze|deactivat)/i,
      flag: 'Artificial urgency or account suspension threat',
      weight: 22,
    },
    {
      pattern: /\b(otp|one time password|upi pin|mpin|cvv|atm pin|password|secret code)\b/i,
      flag: 'Requests sensitive authentication (OTP, PIN, or CVV)',
      weight: 30,
    },
    {
      pattern: /(bit\.ly|tinyurl|t\.me|rb\.gy|shorturl|verify-|kyc-|\.xyz|\.top|\.click|http:\/\/)/i,
      flag: 'Suspicious, shortened, or unverified link domain',
      weight: 22,
    },
    {
      pattern: /\b(kyc|pan update|aadhaar|re-verify|compliance|rbi notice)\b/i,
      flag: 'Fake KYC or regulatory compliance lure',
      weight: 18,
    },
    {
      pattern: /\b(won|lottery|prize|cashback|reward|claim|congratulations|jackpot)\b/i,
      flag: 'Unsolicited prize, cashback, or lottery bait',
      weight: 20,
    },
    {
      pattern: /\b(enter .*pin to receive|scan .*to receive|pay .*deposit|registration fee|refundable fee|vip task)\b/i,
      flag: 'Reverse-payment / advance-fee scam pattern (paying to receive money)',
      weight: 28,
    },
    {
      pattern: /\b(work from home|liking youtube|earn ₹?\d+.*daily|telegram job|part-time)\b/i,
      flag: 'Unrealistic daily income / task-scam recruitment',
      weight: 22,
    },
  ];

  const redFlags: string[] = [];
  const matchedPhrases: string[] = [];
  let score = 0;

  for (const rule of rules) {
    const match = text.match(rule.pattern);
    if (match) {
      redFlags.push(rule.flag);
      matchedPhrases.push(match[0]);
      score += rule.weight;
    }
  }

  // Safe indicator adjustment if official alert language without links/OTP requests
  const hasSafePattern =
    /\b(available bal|upi ref|if not done by you|official bank app)\b/i.test(lower) &&
    !/http:\/\/|bit\.ly|enter .*otp|enter .*pin|click/i.test(lower);

  if (hasSafePattern && score === 0) {
    score = 8;
  }

  const boundedScore = Math.min(98, Math.max(5, score));
  const riskLevel: ScamAnalysisResult['riskLevel'] =
    boundedScore >= 60 ? 'HIGH' : boundedScore >= 28 ? 'MEDIUM' : 'LOW';

  let headline = 'Low scam indicators detected, though caution is always advised.';
  if (riskLevel === 'HIGH') {
    headline = 'High Scam Risk — Multiple classic phishing or payment trap patterns found.';
  } else if (riskLevel === 'MEDIUM') {
    headline = 'Caution Advised — Verify sender independently before taking any action.';
  }

  const explanation =
    riskLevel === 'HIGH'
      ? `This message exhibits ${redFlags.length} high-risk social engineering triggers (${matchedPhrases.slice(0, 3).join(', ')}). Genuine banks and UPI apps never ask you to click third-party links, share OTPs, or enter your UPI PIN to receive funds.`
      : riskLevel === 'MEDIUM'
      ? 'Some wording resembles promotional or verification pressure. Never trust caller IDs or SMS links blindly—open your official banking app directly to verify.'
      : 'This looks similar to a standard informational alert with no links, OTP requests, or advance-fee lures. Still double-check inside your official banking app if anything feels unfamiliar.';

  const recommendedActions =
    riskLevel === 'HIGH'
      ? [
          'Do NOT click any links, scan QR codes, or reply to the sender.',
          'Never share OTPs, UPI PINs, passwords, or screen-sharing access.',
          'Block and report the sender on Chakshu (sancharsaathi.gov.in) or 1930 cybercrime helpline if money was lost.',
        ]
      : [
          'Open your bank or UPI app manually instead of tapping message links.',
          'Verify balances and transaction references directly inside official apps.',
          'Remember: automated detection is educational and cannot guarantee 100% accuracy.',
        ];

  return {
    riskLevel,
    riskScore: boundedScore,
    headline,
    redFlags,
    matchedPhrases,
    explanation,
    recommendedActions,
    source: 'heuristic',
  };
}

export function simulateAssistantReply(
  query: string,
  state: FinwiseState,
  metrics: ReturnType<typeof computeFinancialMetrics>
): string {
  const q = query.toLowerCase();
  const topCat = metrics.categoryStats[0];

  if (q.includes('save') || q.includes('budget') || q.includes('spend') || q.includes('cut')) {
    const overText =
      metrics.overBudgetCategories.length > 0
        ? `Notice that **${metrics.overBudgetCategories.map((c) => c.category).join(', ')}** is currently over your set limit.`
        : 'Great news: none of your categories have breached their monthly limits.';
    return [
      `Based on your current snapshot (**${formatINR(state.monthlyIncome)}** income, **${formatINR(metrics.totalExpenses)}** spent, **${metrics.savingsRate}%** savings rate):`,
      `- **Top spending area:** ${topCat?.category ?? 'Food & Dining'} at **${formatINR(topCat?.spent ?? 0)}**. ${overText}`,
      `- **Quick ₹100/day win:** Trimming ₹100/day from discretionary orders or impulse buys adds **${formatINR(3000)}/month** (**${formatINR(36500)}/year**), boosting your savings rate to **${state.monthlyIncome > 0 ? Math.round(((metrics.monthlySavings + 3000) / state.monthlyIncome) * 1000) / 10 : 0}%**.`,
      `- **Next step:** Lock in ${formatINR(Math.round(metrics.monthlySavings * 0.5))} toward your **${state.goals[0]?.title ?? 'Emergency Buffer'}** right at the start of the month.`,
    ].join('\n');
  }

  if (q.includes('compound') || q.includes('interest')) {
    const sampleMonthly = Math.max(2000, Math.round(metrics.monthlySavings * 0.5 / 500) * 500);
    const yr1 = sampleMonthly * 12;
    const r = 0.09 / 12;
    const yr5 = Math.round(sampleMonthly * ((Math.pow(1 + r, 60) - 1) / r));
    return [
      `**Compound Interest** simply means earning returns on both your deposits *and* the returns you already earned.`,
      `- **With your numbers:** If you set aside **${formatINR(sampleMonthly)}/month**, after 1 year you deposit **${formatINR(yr1)}**.`,
      `- At an illustrative **9% annual rate** compounded monthly, after **5 years** your total deposits of **${formatINR(sampleMonthly * 60)}** could grow to roughly **${formatINR(yr5)}** (educational estimate; returns are not guaranteed).`,
      `- Try the **Your Financial Future** tab to test 1, 3, and 5-year scenarios live.`,
    ].join('\n');
  }

  if (q.includes('inflation')) {
    return [
      `**Inflation** means prices rise over time, so idle cash buys less next year than it does today.`,
      `- At **6% annual inflation**, something costing **₹1,000** today (like textbooks or mess fees) would cost roughly **₹1,338** in 5 years.`,
      `- Keep your **3-month emergency buffer** (**${formatINR(Math.round(metrics.totalExpenses * 3))}**) accessible in a safe bank/sweep account, and learn about inflation-beating goals for longer timelines.`,
    ].join('\n');
  }

  if (q.includes('scam') || q.includes('upi') || q.includes('otp')) {
    return [
      `**Golden Rules of UPI & Digital Safety:**`,
      `- **Never enter a UPI PIN to receive money.** PIN entry only authorizes outgoing payments.`,
      `- **Never share OTPs or click KYC links** in urgent SMS or WhatsApp messages—open your official bank app directly.`,
      `- Use the **Smart Scam Detector** tab anytime you want to scan a suspicious message.`,
    ].join('\n');
  }

  return [
    `Here is a quick financial checkup for **${state.profile.name}**:`,
    `- **Monthly Income:** ${formatINR(state.monthlyIncome)} · **Expenses:** ${formatINR(metrics.totalExpenses)} · **Available Savings:** ${formatINR(metrics.monthlySavings)} (${metrics.savingsRate}%)`,
    `- **Educational Health Score:** **${metrics.healthScore}/100** (${metrics.healthLabel})`,
    `- **Top Opportunity:** Your largest spend is **${topCat?.category ?? 'Food & Dining'}** (${formatINR(topCat?.spent ?? 0)}). Reducing it by 15% frees up **${formatINR(Math.round((topCat?.spent ?? 0) * 0.15))}/month** toward **${state.goals[0]?.title ?? 'your savings goal'}**.`,
    `Ask me about *budgeting*, *compound interest*, *inflation*, *student saving tips*, or *UPI safety*!`,
  ].join('\n');
}
