
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
      <header className="px-6 py-5 flex justify-between items-center z-20 relative shrink-0">
        {/* Left: Toggle Switch */}
        <button 
           onClick={toggleDataSource}
           className="group flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
           {isCustom ? (
               <>
                 <FolderPlus className="w-5 h-5 text-green-700" />
                 <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Nâng cao</span>
               </>
           ) : (
               <>
                 <Library className="w-5 h-5 text-indigo-700" />
                 <span className="text-sm font-black text-slate-700 uppercase tracking-wide">Cơ bản</span>
               </>
           )}
        </button>

        {/* Center: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
           <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                 English Reflex <span className="text-indigo-600">Gym</span>
              </h1>
           </div>
           <p className="text-[10px] font-bold text-slate-400 tracking-[0.25em] uppercase mt-1">Luyện phản xạ nói</p>
        </div>
        
        {/* Right: Settings */}
        <button 
           onClick={onOpenSettings}
           className="w-10 h-10 bg-white hover:bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all shadow-sm active:scale-95"
        >
           <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col justify-center w-full z-10 overflow-hidden relative py-4">
        
        <div className="w-full">
            <h2 className="text-center text-xs font-black text-slate-400 uppercase tracking-[0.25em] mb-6">
               Chủ đề luyện tập
            </h2>
            
            <div className="flex overflow-x-auto gap-4 px-6 pb-8 snap-x snap-mandatory no-scrollbar items-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
               {/* Custom Mode: Manage Button */}
               {isCustom && (
                  <button 
                     onClick={onOpenDataManager}
                     className="snap-start shrink-0 w-40 h-52 rounded-[2rem] border-2 border-dashed border-green-300 bg-green-50/40 hover:bg-green-100 flex flex-col items-center justify-center gap-3 text-green-600 transition-all active:scale-95 group"
                  >
                     <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform group-hover:shadow-md">
                        <Plus className="w-6 h-6" />
                     </div>
                     <span className="font-bold text-sm">Quản lý</span>
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
                    ? 'bg-green-600 text-white shadow-xl shadow-green-200 scale-105 -translate-y-1' 
                    : 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-105 -translate-y-1';
                  const icon = isCustom ? <FolderPlus className="w-6 h-6" /> : <Library className="w-6 h-6" />;

                  return (
                     <button
                        key={idx}
                        onClick={() => {
                           if (!isCustom) setSettings({...settings, selectedCategory: item as string});
                           else setSettings({...settings, selectedDeckId: (item as CustomDeck).id});
                        }}
                        className={`
                           snap-start shrink-0 w-40 h-52 rounded-[2rem] p-6 flex flex-col justify-between text-left transition-all duration-300
                           ${isSelected 
                              ? activeClass
                              : 'bg-white border border-slate-100 text-slate-500 hover:border-slate-300 shadow-sm hover:shadow-md'
                           }
                        `}
                     >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-50'}`}>
                           {icon}
                        </div>
                        <div>
                           <p className={`font-black text-xl leading-tight line-clamp-2 mb-1.5 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                              {label === 'All' ? 'Tất cả' : label}
                           </p>
                           <p className={`text-xs font-bold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
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
      <footer className="bg-white border-t border-slate-50 px-6 py-6 z-20 shrink-0 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
         <div className="max-w-md mx-auto space-y-4">
            
            {/* Progress Info */}
            <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-50 rounded-lg text-orange-500">
                     <Zap className="w-4 h-4 fill-orange-500" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Tiến độ hôm nay
                  </span>
               </div>
               <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg">
                  {dailyStats.correctAnswers} / {dailyGoal}
               </span>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-1">
               <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
               ></div>
            </div>

            {/* Start Button */}
            <button 
               onClick={onStart}
               className="w-full bg-white border-2 border-indigo-500 rounded-[2rem] p-3 flex items-center justify-between shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200/50 transition-all active:scale-[0.98] group"
            >
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-indigo-50 rounded-[1.2rem] flex items-center justify-center group-hover:scale-105 transition-transform shadow-inner">
                     <Play className="w-7 h-7 text-indigo-600 fill-indigo-600 ml-1" />
                  </div>
                  <div className="text-left">
                     <span className="block text-2xl font-black text-slate-900 leading-none mb-1">Tập Ngay</span>
                     <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Luyện phản xạ nói</span>
                  </div>
               </div>
               <div className="pr-5 opacity-30 group-hover:opacity-60 transition-opacity">
                  <History className="w-7 h-7" />
               </div>
            </button>

         </div>
      </footer>
    </div>
  );
};
