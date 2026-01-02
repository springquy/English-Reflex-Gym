
import React from 'react';
import { Award, RefreshCw, Home, ChevronRight, Share2 } from 'lucide-react';

interface ResultProps {
  score: number;
  total: number;
  onRestart: () => void;
  onHome: () => void;
}

export const Result: React.FC<ResultProps> = ({ score, total, onRestart, onHome }) => {
  const percentage = Math.round((score / total) * 100);
  
  let title = "Luyện tập hoàn tất!";
  let message = "Hãy cố gắng hơn trong lần tới nhé!";
  let colorClass = "text-slate-600";
  let bgGradient = "from-slate-400 to-slate-600";

  if (percentage >= 90) {
    title = "Tuyệt vời!";
    message = "Phản xạ của bạn thực sự ấn tượng.";
    colorClass = "text-indigo-600";
    bgGradient = "from-indigo-500 to-purple-600";
  } else if (percentage >= 60) {
    title = "Khá lắm!";
    message = "Bạn đang tiến bộ rất nhanh đấy.";
    colorClass = "text-blue-600";
    bgGradient = "from-blue-500 to-indigo-600";
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white animate-in zoom-in duration-500">
      <div className="max-w-md w-full space-y-10 text-center">
        
        <div className="relative inline-block">
          <div className={`absolute -inset-4 bg-gradient-to-br ${bgGradient} blur-2xl rounded-full opacity-20`}></div>
          <Award className={`w-32 h-32 mx-auto relative ${colorClass}`} />
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">{title}</h2>
          <p className="text-slate-500 font-medium text-lg">{message}</p>
        </div>

        <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className={`text-8xl font-black mb-3 ${colorClass}`}>{score}<span className="text-slate-300 text-4xl ml-1">/{total}</span></div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-sm">Điểm phản xạ</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={onRestart}
            className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
          >
            <RefreshCw className="w-6 h-6" /> Thử lại bài này
          </button>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={onHome}
              className="py-5 bg-white text-slate-600 border border-slate-200 rounded-[1.8rem] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Home className="w-5 h-5" /> Về Home
            </button>
            <button 
              className="py-5 bg-white text-slate-600 border border-slate-200 rounded-[1.8rem] font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
            >
              <Share2 className="w-5 h-5" /> Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
