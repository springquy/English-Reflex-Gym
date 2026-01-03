
export enum GameView {
  MENU = 'MENU',
  GAME = 'GAME',
  RESULT = 'RESULT'
}

export enum GameState {
  THINKING = 'THINKING',
  LISTENING = 'LISTENING',
  REVIEWING = 'REVIEWING'
}

export type Category = 'Giao tiếp' | 'Công việc' | 'Cảm xúc' | 'Du lịch' | 'Nhà hàng' | 'Hàng ngày' | 'All' | string;

export interface Question {
  id: number;
  category?: Category; // Optional
  level?: 'Easy' | 'Medium' | 'Hard'; // Optional
  vietnamese: string;
  main_answer: string;
  variations: string[];
  hint?: {
    structure?: string;
    vocab?: string;
  };
  note?: string;
}

export interface CustomDeck {
  id: string;
  name: string;
  questions: Question[];
  createdAt: number;
}

export interface GameSettings {
  questionCount: number;
  timePerQuestion: number; // 0 for unlimited
  selectedCategory: Category; // Used for Built-in
  selectedDeckId?: string; // Used for Custom
  apiKey?: string;
  dataSource: 'builtin' | 'custom';
  dailyGoal: number; // Target number of correct answers per day
}

export interface Feedback {
  isCorrect: boolean;
  msg: string;
  aiCommentary?: string;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  questionsAttempted: number;
  correctAnswers: number;
  apiRequestsEstimated: number; // Estimate based on AI checks
}
