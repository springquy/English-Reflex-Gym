
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

export interface GameSettings {
  questionCount: number;
  timePerQuestion: number; // 0 for unlimited
  selectedCategory: Category;
  apiKey?: string; // Optional user-provided API Key
}

export interface Feedback {
  isCorrect: boolean;
  msg: string;
  aiCommentary?: string;
}
