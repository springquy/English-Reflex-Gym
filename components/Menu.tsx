
import React from 'react';
import { Mic, Play, Settings, Zap, History, Target } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Category, GameSettings } from '../types';

interface MenuProps {
  onStart: () => void;
  onOpenSettings: () => void;
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
}

export const Menu: React.FC<MenuProps> = ({ onStart, onOpenSettings, settings, setSettings }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 animate-in fade-in zoom-in duration-500 overflow-hidden relative">
      {/* Settings Button - Bigger & Repositioned */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={onOpenSettings}
          className="p-4 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl shadow-sm border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-0.5"
        >
          <Settings className="w-8 h-8" />
        </button>
      </div>

      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-5">
          {/* Logo Section - Slightly more compact */}
          <div className="relative inline-block group">
            <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative w-28 h-28 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 rotate-3 group-hover:rotate-6 transition-transform">
              <Mic className="text-white w-12 h-12" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              English Reflex <span className="text-indigo-600">Gym</span>
            </h1>
            <p className="text-slate-500 text-base md:text-lg font-medium max-w-sm mx-auto">
              Luyện tập phản xạ nói.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Chủ đề luyện tập
            </h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSettings(s => ({ ...s, selectedCategory: cat }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    settings.selectedCategory === cat
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'Tất cả' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm text-left flex flex-col justify-between min-h-[120px]">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" /> Thống kê hôm nay
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-black text-slate-800">0</span>
                <span className="text-slate-400 font-bold text-[10px] mb-1.5 uppercase">Câu trả lời đúng</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
               <div className="h-full bg-indigo-400 w-[0%] transition-all duration-1000"></div>
            </div>
          </div>
        </div>

        <button 
          onClick={onStart}
          className="group relative w-full p-1 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-[2rem] shadow-xl hover:shadow-2xl hover:scale-[1.01] transition-all active:scale-[0.98]"
        >
          <div className="bg-white rounded-[1.8rem] px-6 py-6 flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="bg-indigo-50 p-3.5 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                <Play className="w-8 h-8 text-indigo-600 fill-indigo-600 ml-1" />
              </div>
              <div className="text-left">
                <span className="block font-black text-2xl md:text-3xl text-slate-900 group-hover:text-indigo-600 transition-colors">Tập Ngay</span>
                <span className="text-slate-400 font-medium text-sm md:text-base">Luyện phản xạ nói</span>
              </div>
            </div>
            <History className="w-6 h-6 text-slate-200 group-hover:text-indigo-200 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );
};
