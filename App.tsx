
import React, { useState, useEffect } from 'react';
import { Menu } from './components/Menu';
import { Game } from './components/Game';
import { Result } from './components/Result';
import { SettingsModal } from './components/SettingsModal';
import { GameView, GameSettings, Question } from './types';
import { MOCK_DATA } from './constants';

const DEFAULT_SETTINGS: GameSettings = {
  questionCount: 5,
  timePerQuestion: 0,
  selectedCategory: 'All',
  apiKey: '' 
};

export default function App() {
  const [view, setView] = useState<GameView>(GameView.MENU);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [results, setResults] = useState({ score: 0, total: 0 });
  
  // State chứa câu hỏi tuỳ chỉnh
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);

  // Load settings & custom data
  useEffect(() => {
    const savedSettings = localStorage.getItem('english-gym-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (e) { console.error("Error loading settings", e); }
    }

    const savedData = localStorage.getItem('english-gym-custom-data');
    if (savedData) {
      try {
        setCustomQuestions(JSON.parse(savedData));
      } catch (e) { console.error("Error loading custom data", e); }
    }
  }, []);

  const handleSaveSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    localStorage.setItem('english-gym-settings', JSON.stringify(newSettings));
  };

  const handleSaveCustomData = (data: Question[]) => {
    setCustomQuestions(data);
    if (data.length > 0) {
      localStorage.setItem('english-gym-custom-data', JSON.stringify(data));
      // Tự động chuyển category về 'Custom' hoặc 'All'
      setSettings(s => ({ ...s, selectedCategory: 'All' }));
    } else {
      localStorage.removeItem('english-gym-custom-data');
    }
  };

  const startGame = () => setView(GameView.GAME);
  const finishGame = (score: number, total: number) => {
    setResults({ score, total });
    setView(GameView.RESULT);
  };
  const goHome = () => setView(GameView.MENU);

  // Quyết định nguồn câu hỏi: Custom > MOCK
  const activeQuestions = customQuestions.length > 0 ? customQuestions : MOCK_DATA;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {view === GameView.MENU && (
        <Menu 
          onStart={startGame} 
          onOpenSettings={() => setShowSettings(true)}
          settings={settings}
          setSettings={handleSaveSettings}
          hasCustomData={customQuestions.length > 0}
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
          score={results.score} 
          total={results.total} 
          onRestart={startGame} 
          onHome={goHome} 
        />
      )}

      {showSettings && (
        <SettingsModal 
          settings={settings} 
          onSave={(s) => { handleSaveSettings(s); setShowSettings(false); }} 
          onClose={() => setShowSettings(false)}
          customData={customQuestions}
          onSaveCustomData={handleSaveCustomData}
        />
      )}
    </div>
  );
}
