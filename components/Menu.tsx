
import React from 'react';
import { Play, Settings, Mic, FolderPlus, Library, Zap, Plus, History } from 'lucide-react';
import { CATEGORIES, MOCK_DATA } from '../constants';
import { GameSettings, CustomDeck, DailyStats } from '../types';

interface MenuProps {
  onStart: () => void;
  onOpenSettings: () => void;
  onOpenDataManager: () => void;
  settings: GameSettings;
  setSettings: (s: GameSettings) => void;
  customDecks: CustomDeck[];
  dailyStats: DailyStats;
}

export const Menu: React.FC<MenuProps> = ({ 
  onStart, 
  onOpenSettings, 
  onOpenDataManager, 
  settings, 
  setSettings, 
  customDecks,
  dailyStats
}) => {
  const isCustom = settings.dataSource === 'custom';
  const dailyGoal = settings.dailyGoal || 20;
  const progressPercent = Math.min((dailyStats.correctAnswers / dailyGoal) * 100, 100);

  const toggleDataSource = () => {
    setSettings({
        ...settings,
        dataSource: isCustom ? 'builtin' : 'custom'
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 relative overflow-hidden font-sans">
      
      {/* --- HEADER --- */}
      <header className="px-6 py-8 flex justify-between items-center z-20 relative shrink-0">
        {/* Left: Toggle Switch (Bigger) */}
        <button 
           onClick={toggleDataSource}
           className="group flex items-center gap-2.5 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
           {isCustom ? (
               <>
                 <FolderPlus className="w-8 h-8 text-green-800" />
                 <span className="text-lg font-black text-slate-800 uppercase tracking-wide">Nâng cao</span>
               </>
           ) : (
               <>
                 <Library className="w-8 h-8 text-indigo-800" />
                 <span className="text-lg font-black text-slate-800 uppercase tracking-wide">Cơ bản</span>
               </>
           )}
        </button>

        {/* Center: Logo (Bigger) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
           <div className="flex items-center gap-3">
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                 English Reflex <span className="text-indigo-600">Gym</span>
              </h1>
           </div>
           <p className="text-sm font-bold text-slate-400 tracking-[0.25em] uppercase mt-2.5">Luyện phản xạ nói</p>
        </div>
        
        {/* Right: Settings (Bigger) */}
        <button 
           onClick={onOpenSettings}
           className="w-16 h-16 bg-white hover:bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all shadow-sm active:scale-95"
        >
           <Settings className="w-8 h-8" />
        </button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col justify-center w-full z-10 overflow-hidden relative">
        
        <div className="w-full">
            <h2 className="text-center text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-10">
               Chủ đề luyện tập
            </h2>
            
            <div className="flex overflow-x-auto gap-6 px-10 pb-12 snap-x snap-mandatory no-scrollbar items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
               {/* Custom Mode: Manage Button */}
               {isCustom && (
                  <button 
                     onClick={onOpenDataManager}
                     className="snap-start shrink-0 w-48 h-60 rounded-[2.5rem] border-2 border-dashed border-green-300 bg-green-50/40 hover:bg-green-100 flex flex-col items-center justify-center gap-5 text-green-600 transition-all active:scale-95 group"
                  >
                     <div className="p-5 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform group-hover:shadow-md">
                        <Plus className="w-8 h-8" />
                     </div>
                     <span className="font-bold text-lg">Quản lý</span>
                  </button>
               )}

               {(!isCustom ? CATEGORIES : customDecks).map((item, idx) => {
                  const isSelected = !isCustom 
                     ? settings.selectedCategory === item 
                     : settings.selectedDeckId === (item as CustomDeck).id;
                  
                  const label = !isCustom ? (item as string) : (item as CustomDeck).name;
                  
                  let count = 0;
                  if (isCustom) {
                     count = (item as CustomDeck).questions.length;
                  } else {
                     const cat = item as string;
                     count = cat === 'All' ? MOCK_DATA.length : MOCK_DATA.filter(q => q.category === cat).length;
                  }

                  const activeClass = isCustom 
                    ? 'bg-green-600 text-white shadow-2xl shadow-green-200 scale-105 -translate-y-2' 
                    : 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-105 -translate-y-2';
                  const icon = isCustom ? <FolderPlus className="w-8 h-8" /> : <Library className="w-8 h-8" />;

                  return (
                     <button
                        key={idx}
                        onClick={() => {
                           if (!isCustom) setSettings({...settings, selectedCategory: item as string});
                           else setSettings({...settings, selectedDeckId: (item as CustomDeck).id});
                        }}
                        className={`
                           snap-start shrink-0 w-48 h-60 rounded-[2.5rem] p-8 flex flex-col justify-between text-left transition-all duration-300
                           ${isSelected 
                              ? activeClass
                              : 'bg-white border border-slate-100 text-slate-500 hover:border-slate-300 shadow-sm hover:shadow-lg'
                           }
                        `}
                     >
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-50'}`}>
                           {icon}
                        </div>
                        <div>
                           <p className={`font-black text-2xl leading-tight line-clamp-2 mb-2 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                              {label === 'All' ? 'Tất cả' : label}
                           </p>
                           <p className={`text-base font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                              {count} câu
                           </p>
                        </div>
                     </button>
                  );
               })}
               
               <div className="w-4 shrink-0" />
            </div>
        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-50 px-6 py-8 z-20 shrink-0 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
         <div className="max-w-xl mx-auto space-y-6">
            
            {/* Progress Info */}
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-50 rounded-xl text-orange-500">
                     <Zap className="w-5 h-5 fill-orange-500" />
                  </div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                     Tiến độ hôm nay
                  </span>
               </div>
               <span className="text-base font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-xl">
                  {dailyStats.correctAnswers} / {dailyGoal}
               </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
               <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
               ></div>
            </div>

            {/* Start Button (Bigger) */}
            <button 
               onClick={onStart}
               className="w-full bg-white border-2 border-indigo-500 rounded-[2.5rem] p-5 flex items-center justify-between shadow-xl shadow-indigo-100 hover:shadow-2xl hover:shadow-indigo-200/50 transition-all active:scale-[0.98] group"
            >
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-50 rounded-[1.8rem] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                     <Play className="w-10 h-10 text-indigo-600 fill-indigo-600 ml-1.5" />
                  </div>
                  <div className="text-left">
                     <span className="block text-4xl font-black text-slate-900 leading-none mb-2">Tập Ngay</span>
                     <span className="text-base font-bold text-slate-400 uppercase tracking-wide">Luyện phản xạ nói</span>
                  </div>
               </div>
               <div className="pr-8 opacity-30 group-hover:opacity-60 transition-opacity">
                  <History className="w-10 h-10" />
               </div>
            </button>

         </div>
      </footer>
    </div>
  );
};
