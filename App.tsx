
import React, { useState, useEffect } from 'react';
import { Menu } from './components/Menu';
import { Game } from './components/Game';
import { Result } from './components/Result';
import { SettingsModal } from './components/SettingsModal';
import { DataManagerModal } from './components/DataManagerModal';
import { GameView, GameSettings, CustomDeck, DailyStats, Question } from './types';
import { MOCK_DATA } from './constants';

const DEFAULT_SETTINGS: GameSettings = {
  questionCount: 5,
  timePerQuestion: 0,
  selectedCategory: 'All',
  apiKey: '',
  dataSource: 'builtin',
  dailyGoal: 20 // Default daily goal
};

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function App() {
  const [view, setView] = useState<GameView>(GameView.MENU);
  const [showSettings, setShowSettings] = useState(false);
  const [showDataManager, setShowDataManager] = useState(false);
  
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [customDecks, setCustomDecks] = useState<CustomDeck[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats>({
    date: getTodayString(),
    questionsAttempted: 0,
    correctAnswers: 0,
    apiRequestsEstimated: 0
  });

  const [lastGameScore, setLastGameScore] = useState({ score: 0, total: 0 });

  // Load data on mount
  useEffect(() => {
    // 1. Settings
    const savedSettings = localStorage.getItem('english-gym-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }

    // 2. Custom Decks
    const savedDecks = localStorage.getItem('english-gym-custom-decks');
    if (savedDecks) {
      try {
        const parsed = JSON.parse(savedDecks);
        if (Array.isArray(parsed)) setCustomDecks(parsed);
      } catch (e) {}
    }

    // 3. Stats
    const savedStats = localStorage.getItem('english-gym-stats');
    const today = getTodayString();
    if (savedStats) {
      try {
        const parsed: DailyStats = JSON.parse(savedStats);
        if (parsed.date === today) {
          setDailyStats(parsed);
        } else {
          // Reset stats for new day
          setDailyStats({ date: today, questionsAttempted: 0, correctAnswers: 0, apiRequestsEstimated: 0 });
        }
      } catch (e) {}
    }
  }, []);

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('english-gym-settings', JSON.stringify(newSettings));
  };

  const handleSaveDecks = (newDecks: CustomDeck[]) => {
    setCustomDecks(newDecks);
    localStorage.setItem('english-gym-custom-decks', JSON.stringify(newDecks));
    
    // If current selected deck was deleted, pick the first one or none
    if (settings.dataSource === 'custom' && settings.selectedDeckId) {
      const exists = newDecks.find(d => d.id === settings.selectedDeckId);
      if (!exists && newDecks.length > 0) {
        handleSaveSettings({ ...settings, selectedDeckId: newDecks[0].id });
      }
    }
    // Auto select newest if added
    if (newDecks.length > customDecks.length) {
       handleSaveSettings({ ...settings, selectedDeckId: newDecks[0].id, dataSource: 'custom' });
    }
  };

  const updateStats = (correct: number, total: number, aiRequests: number) => {
    setDailyStats(prev => {
      const newStats = {
        ...prev,
        date: getTodayString(),
        questionsAttempted: prev.questionsAttempted + total,
        correctAnswers: prev.correctAnswers + correct,
        apiRequestsEstimated: prev.apiRequestsEstimated + aiRequests
      };
      localStorage.setItem('english-gym-stats', JSON.stringify(newStats));
      return newStats;
    });
  };

  const startGame = () => {
    // Validate before start
    if (settings.dataSource === 'custom') {
      if (customDecks.length === 0) {
        alert("Bạn chưa có bộ dữ liệu nào. Hãy thêm mới!");
        setShowDataManager(true);
        return;
      }
      if (!settings.selectedDeckId) {
        handleSaveSettings({ ...settings, selectedDeckId: customDecks[0].id });
      }
    }
    setView(GameView.GAME);
  };

  const finishGame = (score: number, total: number) => {
    setLastGameScore({ score, total });
    // Assuming roughly 1 AI request per incorrect answer that wasn't caught locally
    // This is an estimation. Real logic implies tracking inside Game component.
    const wrong = total - score;
    const estimatedAI = Math.ceil(wrong * 0.8); 
    
    updateStats(score, total, estimatedAI);
    setView(GameView.RESULT);
  };

  const goHome = () => setView(GameView.MENU);

  // Determine active questions based on settings
  let activeQuestions: Question[] = MOCK_DATA;
  if (settings.dataSource === 'custom') {
    const deck = customDecks.find(d => d.id === settings.selectedDeckId);
    activeQuestions = deck ? deck.questions : [];
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {view === GameView.MENU && (
        <Menu 
          onStart={startGame} 
          onOpenSettings={() => setShowSettings(true)}
          onOpenDataManager={() => setShowDataManager(true)}
          settings={settings}
          setSettings={handleSaveSettings}
          customDecks={customDecks}
          dailyStats={dailyStats}
        />
      )}

      {view === GameView.GAME && (
        <Game 
          settings={settings} 
          questionsSource={activeQuestions}
          onEnd={finishGame} 
          onExit={goHome} 
        />
      )}

      {view === GameView.RESULT && (
        <Result 
          score={lastGameScore.score} 
          total={lastGameScore.total} 
          onRestart={startGame} 
          onHome={goHome} 
        />
      )}

      {showSettings && (
        <SettingsModal 
          settings={settings} 
          onSave={(s) => { handleSaveSettings(s); setShowSettings(false); }} 
          onClose={() => setShowSettings(false)}
        />
      )}

      {showDataManager && (
        <DataManagerModal
          customDecks={customDecks}
          onSaveDecks={handleSaveDecks}
          onClose={() => setShowDataManager(false)}
        />
      )}
    </div>
  );
}
