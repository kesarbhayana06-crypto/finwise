export type AppTab =
  | 'dashboard'
  | 'budget'
  | 'assistant'
  | 'goals'
  | 'simulator'
  | 'health'
  | 'future'
  | 'scam'
  | 'missions'
  | 'learn'
  | 'settings';

export type ExpenseCategory =
  | 'Food & Dining'
  | 'Rent & Hostel'
  | 'Transport'
  | 'Study & Gear'
  | 'Subscriptions'
  | 'Shopping'
  | 'Utilities';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note?: string;
}

export interface MonthlyHistoryPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: 'Emergency' | 'Tech' | 'Travel' | 'Education' | 'Other';
  saved: number;
  target: number;
  dueDate: string;
  monthlyTarget: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category: 'Daily Habit' | 'Saving Challenge' | 'UPI Safety' | 'Quiz';
  xp: number;
  completed: boolean;
  quizQuestion?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface LessonQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LearningLesson {
  id: string;
  title: string;
  duration: string;
  level: 'Beginner' | 'Essential' | 'Safety';
  summary: string;
  keyRule: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  indianExample: string;
  quizzes: LessonQuizQuestion[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: 'gemini' | 'simulated' | 'error';
}

export interface ScamAnalysisResult {
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  riskScore: number;
  headline: string;
  redFlags: string[];
  matchedPhrases: string[];
  explanation: string;
  recommendedActions: string[];
  source: 'gemini' | 'heuristic';
  apiError?: string;
}

export interface UserProfile {
  name: string;
  roleLabel: string;
  targetSavingsRate: number;
  dailyCoffeeBudget: number;
}

export interface FinwiseState {
  profile: UserProfile;
  monthlyIncome: number;
  expenses: Expense[];
  categoryLimits: Record<ExpenseCategory, number>;
  monthlyHistory: MonthlyHistoryPoint[];
  goals: SavingsGoal[];
  completedMissionIds: string[];
  completedLessonIds: string[];
  xp: number;
  streakDays: number;
  futureCurrentSavings: number;
  futureMonthlySaving: number;
}
