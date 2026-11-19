import type { ExpenseCategory, FinwiseState, LearningLesson, Mission } from '../types/finance';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Rent & Hostel',
  'Transport',
  'Study & Gear',
  'Subscriptions',
  'Shopping',
  'Utilities',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'Food & Dining': '#818cf8',
  'Rent & Hostel': '#10b981',
  'Transport': '#38bdf8',
  'Study & Gear': '#a78bfa',
  'Subscriptions': '#f59e0b',
  'Shopping': '#f472b6',
  'Utilities': '#34d399',
};

export const INITIAL_FINWISE_STATE: FinwiseState = {
  profile: {
    name: 'Aarav Sharma',
    roleLabel: 'B.Tech Student · Sample Demo Profile',
    targetSavingsRate: 25,
    dailyCoffeeBudget: 120,
  },
  monthlyIncome: 28500,
  expenses: [
    {
      id: 'exp-1',
      title: 'Hostel & Mess Base Fee',
      amount: 7200,
      category: 'Rent & Hostel',
      date: '2026-11-02',
      note: 'Monthly shared accommodation',
    },
    {
      id: 'exp-2',
      title: 'Campus Canteen & Zomato Orders',
      amount: 3450,
      category: 'Food & Dining',
      date: '2026-11-08',
      note: 'Includes 9 late-night delivery orders',
    },
    {
      id: 'exp-3',
      title: 'Metro Card & Auto Rides',
      amount: 1420,
      category: 'Transport',
      date: '2026-11-10',
      note: 'Daily commute + weekend travel',
    },
    {
      id: 'exp-4',
      title: 'Cloud Storage & OTT Bundle',
      amount: 848,
      category: 'Subscriptions',
      date: '2026-11-11',
      note: 'Spotify, YouTube & Google One',
    },
    {
      id: 'exp-5',
      title: 'Python Course & Lab Printouts',
      amount: 1650,
      category: 'Study & Gear',
      date: '2026-11-13',
      note: 'Skill certification + reference notes',
    },
    {
      id: 'exp-6',
      title: 'Mobile Data & Wi-Fi Share',
      amount: 699,
      category: 'Utilities',
      date: '2026-11-15',
      note: '84-day plan monthly split',
    },
    {
      id: 'exp-7',
      title: 'Sneakers & Weekend Hoodie',
      amount: 2153,
      category: 'Shopping',
      date: '2026-11-17',
      note: 'Festive campus sale',
    },
  ],
  categoryLimits: {
    'Food & Dining': 3500,
    'Rent & Hostel': 7500,
    'Transport': 1800,
    'Study & Gear': 2200,
    'Subscriptions': 700,
    'Shopping': 2000,
    'Utilities': 1000,
  },
  monthlyHistory: [
    { month: 'Jun', income: 24000, expenses: 19200, savings: 4800 },
    { month: 'Jul', income: 25500, expenses: 18900, savings: 6600 },
    { month: 'Aug', income: 26000, expenses: 20400, savings: 5600 },
    { month: 'Sep', income: 27000, expenses: 17800, savings: 9200 },
    { month: 'Oct', income: 28000, expenses: 18600, savings: 9400 },
    { month: 'Nov', income: 28500, expenses: 17420, savings: 11080 },
  ],
  goals: [
    {
      id: 'goal-1',
      title: 'Emergency Buffer (3 Months)',
      category: 'Emergency',
      saved: 28500,
      target: 45000,
      dueDate: '2027-03-31',
      monthlyTarget: 4125,
    },
    {
      id: 'goal-2',
      title: 'MacBook / Coding Laptop',
      category: 'Tech',
      saved: 52000,
      target: 72000,
      dueDate: '2027-01-30',
      monthlyTarget: 6500,
    },
    {
      id: 'goal-3',
      title: 'Grad Trip to Himachal',
      category: 'Travel',
      saved: 6400,
      target: 18000,
      dueDate: '2027-05-15',
      monthlyTarget: 1950,
    },
    {
      id: 'goal-4',
      title: 'Cloud Architect Exam Fee',
      category: 'Education',
      saved: 9600,
      target: 12000,
      dueDate: '2026-12-20',
      monthlyTarget: 2400,
    },
  ],
  completedMissionIds: ['mis-1'],
  completedLessonIds: ['les-1', 'les-6'],
  xp: 240,
  streakDays: 5,
  futureCurrentSavings: 45000,
  futureMonthlySaving: 6500,
};

export const MISSIONS_CATALOG: Mission[] = [
  {
    id: 'mis-1',
    title: 'Zero-Delivery Tuesday',
    description: 'Skip food delivery apps for 24 hours and eat at the mess or cook a meal to save ~₹250.',
    category: 'Daily Habit',
    xp: 100,
    completed: false,
  },
  {
    id: 'mis-2',
    title: 'Subscription Audit Check',
    description: 'Review recurring OTT, music, and cloud subscriptions. Cancel at least 1 unused renewal.',
    category: 'Saving Challenge',
    xp: 150,
    completed: false,
  },
  {
    id: 'mis-3',
    title: 'Spot the Fake UPI Collect Trap',
    description: 'Answer this payment safety scenario to prove you never authorize a collect request to receive money.',
    category: 'UPI Safety',
    xp: 120,
    completed: false,
    quizQuestion: {
      prompt: 'A buyer on OLX sends you a UPI QR code saying "Scan and enter your UPI PIN to receive ₹4,500". What should you do?',
      options: [
        'Scan and enter PIN quickly before the link expires',
        'Decline immediately — you NEVER enter a UPI PIN to receive money',
        'Send ₹1 first to verify their account is active',
      ],
      correctIndex: 1,
      explanation: 'Receiving money via UPI never requires scanning a QR code or entering your UPI PIN. PIN entry always debits your account.',
    },
  },
  {
    id: 'mis-4',
    title: 'The 48-Hour Wishlist Rule',
    description: 'Wait 48 hours before buying any non-essential item over ₹1,000 to filter impulse desires.',
    category: 'Daily Habit',
    xp: 110,
    completed: false,
  },
  {
    id: 'mis-5',
    title: 'Compound Interest Sprint',
    description: 'Test your intuition on why starting at age 20 beats starting at age 30.',
    category: 'Quiz',
    xp: 130,
    completed: false,
    quizQuestion: {
      prompt: 'If ₹3,000/month grows at an illustrative 10% p.a. compounded monthly, roughly how much comes from growth vs. your deposits after 10 years?',
      options: [
        'Growth is small — less than 15% of the final amount',
        'Growth contributes over ₹2.5 lakh on top of ₹3.6 lakh deposited',
        'Only your ₹3.6 lakh deposits count',
      ],
      correctIndex: 1,
      explanation: 'Depositing ₹3,000/mo for 10 years totals ₹3,60,000 principal, while illustrative 10% compounding adds ~₹2,59,000 in gains (total ~₹6.19L).',
    },
  },
  {
    id: 'mis-6',
    title: 'Emergency Buffer Milestone',
    description: 'Allocate at least ₹1,000 toward an emergency savings goal before spending on weekend outings.',
    category: 'Saving Challenge',
    xp: 160,
    completed: false,
  },
];

export const LEARNING_LESSONS: LearningLesson[] = [
  {
    id: 'les-1',
    title: 'Zero-Based & 50/30/20 Budgeting',
    duration: '4 min',
    level: 'Beginner',
    summary: 'Give every rupee a clear job before the month begins so money stops disappearing silently.',
    keyRule: '50% Needs · 30% Wants · 20% Savings (or 60/20/20 on tight student stipends)',
    sections: [
      {
        heading: 'Why budgets fail for students',
        body: 'Most beginners track expenses only after the money is already gone. A proactive budget assigns limits to Food, Hostel, Travel, and Fun on Day 1 of the month.',
      },
      {
        heading: 'How to adapt 50/30/20 in college',
        body: 'If hostel rent and mess take 55% of your ₹20,000 stipend, adjust wants down to 25% so your 20% saving habit stays intact.',
      },
    ],
    indianExample: 'On a ₹25,000 monthly stipend: ₹12,500 goes to hostel/food/commute, ₹7,500 covers outings/subscriptions, and ₹5,000 transfers automatically to savings on the 1st.',
    quizzes: [
      {
        question: 'When should you set aside your savings allocation?',
        options: [
          'Only whatever is left on the 30th of the month',
          'At the start of the month right after income arrives',
          'Only during festival bonuses',
        ],
        correctIndex: 1,
        explanation: 'Paying yourself first guarantees savings happen before lifestyle creep consumes your balance.',
      },
      {
        question: 'In the 50/30/20 guideline, which category includes streaming subscriptions and weekend café visits?',
        options: ['Needs (50%)', 'Wants (30%)', 'Savings (20%)'],
        correctIndex: 1,
        explanation: 'Entertainment and discretionary dining belong to Wants, making them the easiest lever to trim if expenses spike.',
      },
    ],
  },
  {
    id: 'les-2',
    title: 'Pay Yourself First & Micro-Saving',
    duration: '3 min',
    level: 'Beginner',
    summary: 'Automate small transfers and harness daily micro-habits to build effortless momentum.',
    keyRule: 'Habit consistency beats waiting for a high salary to start saving.',
    sections: [
      {
        heading: 'The willpower trap',
        body: 'Relying on end-of-month leftovers almost always leads to ₹0 saved. Treat savings like a fixed non-negotiable bill you owe your future self.',
      },
      {
        heading: 'The ₹100/day rule',
        body: 'Trimming one daily ₹100 impulse spend frees up ₹3,000/month — ₹36,500 in a single year without feeling deprived.',
      },
    ],
    indianExample: 'Setting a ₹1,500 recurring transfer on the 2nd of every month builds ₹18,000 in 12 months—enough for a semester exam fee or travel fund.',
    quizzes: [
      {
        question: 'How much does saving ₹100 every single day accumulate to in 1 year (365 days) even before interest?',
        options: ['₹12,000', '₹36,500', '₹24,000'],
        correctIndex: 1,
        explanation: '100 × 365 = ₹36,500. Small daily leaks add up fast in both directions!',
      },
    ],
  },
  {
    id: 'les-3',
    title: 'Needs vs. Wants Mastery',
    duration: '4 min',
    level: 'Essential',
    summary: 'Separate survival essentials from social pressure and frictionless 1-tap UPI checkout traps.',
    keyRule: 'Use the 48-hour cooling window for any Want above ₹1,000.',
    sections: [
      {
        heading: 'Blurred lines in digital checkout',
        body: 'Food is a need; a ₹380 midnight biryani with ₹75 delivery fees three times a week is a want. Naming the difference removes guilt and creates clarity.',
      },
      {
        heading: 'Cost-per-use filter',
        body: 'Before buying gadgets or fashion, divide the price by expected uses over 12 months. A ₹2,400 pair of running shoes worn 120 times costs ₹20/wear.',
      },
    ],
    indianExample: 'Replacing 8 delivery orders/month (₹320 avg) with mess meals or home snacks frees ₹2,560 monthly for your laptop goal.',
    quizzes: [
      {
        question: 'What is the purpose of the 48-hour wishlist rule?',
        options: [
          'To wait for credit card EMIs',
          'To let emotional impulse fade before spending on Wants',
          'To avoid checking account balance',
        ],
        correctIndex: 1,
        explanation: 'Most impulse cravings drop sharply after two days, helping you keep cash for high-priority goals.',
      },
    ],
  },
  {
    id: 'les-4',
    title: 'Compound Interest & Starting Early',
    duration: '5 min',
    level: 'Essential',
    summary: 'Understand how earning returns on past returns creates exponential growth over 5 to 20 years.',
    keyRule: 'Time in the system matters more than timing or starting big.',
    sections: [
      {
        heading: 'Linear vs. Compounding curves',
        body: 'Simple interest only rewards your original deposit. Compounding rewards both your deposit and every rupee of return earned previously.',
      },
      {
        heading: 'Why 20-year-olds have a superpower',
        body: 'Starting 5 years earlier often beats investing twice as much money later in life because the exponential curve bends sharply in later years.',
      },
    ],
    indianExample: 'Saving ₹5,000/month at an illustrative 9% annual rate grows from ₹60,000 in Year 1 to ~₹3,77,000 in Year 5 (educational estimate, returns not guaranteed).',
    quizzes: [
      {
        question: 'Which factor drives the steepest acceleration in compound growth?',
        options: [
          'Number of bank accounts opened',
          'Compounding duration (time)',
          'Checking portfolio hourly',
        ],
        correctIndex: 1,
        explanation: 'Because growth builds on prior growth, time is the exponent that drives long-term compounding.',
      },
    ],
  },
  {
    id: 'les-5',
    title: 'Inflation & Purchasing Power',
    duration: '4 min',
    level: 'Essential',
    summary: 'See why ₹10,000 sitting in zero-interest cash buys less every year—and how to outpace price rises.',
    keyRule: 'Real Return ≈ Nominal Return − Inflation Rate',
    sections: [
      {
        heading: 'The invisible tax on idle cash',
        body: 'If hostel fees, textbooks, and groceries rise 6% a year while cash earns 0–2.5%, your real purchasing power shrinks each year.',
      },
      {
        heading: 'Smart cash allocation',
        body: 'Keep emergency money liquid in a high-trust savings or sweep account, while longer-term multi-year goals need inflation-beating instruments appropriate to your risk comfort.',
      },
    ],
    indianExample: 'A ₹1,000 campus textbook today could cost ~₹1,338 in 5 years at 6% annual inflation.',
    quizzes: [
      {
        question: 'If your savings earn 3% interest while inflation is 6%, what happens to your purchasing power?',
        options: [
          'It grows by 3% in real terms',
          'It loses roughly 3% purchasing power per year',
          'It stays identical',
        ],
        correctIndex: 1,
        explanation: 'Real purchasing power falls whenever inflation exceeds the interest rate earned on idle money.',
      },
    ],
  },
  {
    id: 'les-6',
    title: 'Digital Payment & UPI Safety',
    duration: '4 min',
    level: 'Safety',
    summary: 'Spot OTP traps, fake KYC messages, QR collect scams, and lookalike links before tapping Pay.',
    keyRule: 'PIN is ONLY for sending money—never for receiving refunds, prizes, or KYC.',
    sections: [
      {
        heading: 'How UPI fraud actually works',
        body: 'Fraudsters exploit urgency ("Account blocked in 2 hours") or greed ("Claim ₹2,999 cashback") to trick victims into authorizing an outgoing Collect request or sharing an OTP.',
      },
      {
        heading: 'Three non-negotiable habits',
        body: '1. Never click shortened links in SMS for bank KYC. 2. Verify sender names on UPI screens before typing PIN. 3. Never install screen-sharing apps for "customer support".',
      },
    ],
    indianExample: 'Real bank alerts come from registered sender headers and direct you to log into the official app yourself—never to bit.ly or random WhatsApp numbers.',
    quizzes: [
      {
        question: 'A caller claiming to be from your bank asks you to read out a 6-digit OTP to "cancel an unauthorized charge". What is this?',
        options: [
          'Standard bank fraud prevention',
          'An OTP theft scam — banks never ask for OTPs over calls',
          'Safe if they know your name',
        ],
        correctIndex: 1,
        explanation: 'Scammers often already know your name or phone number from leaks. The OTP is the final lock protecting your account.',
      },
    ],
  },
  {
    id: 'les-7',
    title: 'Building an Emergency Fund',
    duration: '4 min',
    level: 'Safety',
    summary: 'Create a calm financial shock absorber for medical bills, laptop repairs, or internship gaps.',
    keyRule: 'Start with a ₹10,000 starter cushion, then build toward 3–6 months of core expenses.',
    sections: [
      {
        heading: 'Why students need an emergency fund too',
        body: 'A cracked laptop screen right before exams or sudden travel home shouldn’t force high-interest borrowing or credit card debt.',
      },
      {
        heading: 'Separate it from daily UPI spend',
        body: 'Keep your emergency buffer in a separate savings account or dedicated goal pot so everyday UPI scans cannot accidentally dip into it.',
      },
    ],
    indianExample: 'If your bare-minimum monthly expenses (hostel + food + transport) are ₹15,000, a 3-month emergency target is ₹45,000.',
    quizzes: [
      {
        question: 'Which expense qualifies as a true Emergency Fund withdrawal?',
        options: [
          'Flash sale on wireless earbuds',
          'Urgent laptop repair needed for semester projects',
          'Concert tickets with friends',
        ],
        correctIndex: 1,
        explanation: 'Emergency funds protect against unexpected, necessary, and urgent disruptions—not planned wants or sales.',
      },
    ],
  },
];

export const SCAM_SAMPLE_MESSAGES = [
  {
    label: 'Fake Bank KYC Block SMS',
    text: 'URGENT: Dear customer, your SBI YONO account will be BLOCKED within 2 hours due to pending PAN KYC update! Click http://bit.ly/sbi-kyc-verify99 and enter OTP to avoid permanent suspension.',
  },
  {
    label: 'UPI Cashback QR Trap',
    text: 'Congratulations! You won ₹4,999 PhonePe Diwali Cashback reward. Open link and enter your 6-digit UPI PIN immediately to claim money into your bank account before midnight.',
  },
  {
    label: 'Part-Time Telegram Job Bait',
    text: 'Work from home 1 hr/day! Earn ₹2,500-₹5,000 daily liking YouTube videos. Pay ₹999 refundable registration deposit on UPI ID hr.payouts@okaxis to activate your VIP task tier.',
  },
  {
    label: 'Genuine Bank Statement Alert',
    text: 'Your A/C XX4821 is debited for INR 340.00 on 18-11-26 via UPI Ref 631948201122. Available Bal: INR 11,080.00. If not done by you, report inside official bank app or call 1800-XXX-XXXX.',
  },
];
