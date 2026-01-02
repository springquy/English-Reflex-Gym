
import React, { useState } from 'react';
import { Menu } from './components/Menu';
import { Game } from './components/Game';
import { Result } from './components/Result';
import { SettingsModal } from './components/SettingsModal';
import { GameView, GameSettings, Category } from './types';

const DEFAULT_SETTINGS: GameSettings = {
  questionCount: 5,
  timePerQuestion: 0,
  selectedCategory: 'All'
};

export default function App() {
  const [view, setView] = useState<GameView>(GameView.MENU);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [results, setResults] = useState({ score: 0, total: 0 });

  const startGame = () => setView(GameView.GAME);
  const finishGame = (score: number, total: number) => {
    setResults({ score, total });
    setView(GameView.RESULT);
  };
  const goHome = () => setView(GameView.MENU);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {view === GameView.MENU && (
        <Menu 
          onStart={startGame} 
          onOpenSettings={() => setShowSettings(true)}
          settings={settings}
          setSettings={setSettings}
        />
      )}

      {view === GameView.GAME && (
        <Game 
          settings={settings} 
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
          onSave={setSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}
    </div>
  );
}
