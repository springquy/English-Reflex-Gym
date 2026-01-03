
import React, { useEffect } from 'react';
import { Award, RefreshCw, Home } from 'lucide-react';

interface ResultProps {
  score: number;
  total: number;
  onRestart: () => void;
  onHome: () => void;
}

export const Result: React.FC<ResultProps> = ({ score, total, onRestart, onHome }) => {
  const percentage = Math.round((score / total) * 100);
  
  let title = "Hoàn tất!";
  let message = "Cố gắng hơn lần tới nhé!";
  let colorClass = "text-slate-600";
  let bgGradient = "from-slate-400 to-slate-600";
  let iconBg = "bg-slate-100";

  if (percentage >= 90) {
    title = "Tuyệt vời!";
    message = "Phản xạ cực kỳ ấn tượng.";
    colorClass = "text-indigo-600";
    bgGradient = "from-indigo-500 to-purple-600";
    iconBg = "bg-indigo-50";
  } else if (percentage >= 60) {
    title = "Khá lắm!";
    message = "Bạn đang tiến bộ nhanh.";
    colorClass = "text-blue-600";
    bgGradient = "from-blue-500 to-indigo-600";
    iconBg = "bg-blue-50";
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyR') {
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="flex items-center justify-center min-h-screen p-6 bg-slate-50 animate-in zoom-in duration-500">
      <div className="max-w-5xl w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200 overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Visuals */}
        <div className={`md:w-1/2 p-12 flex flex-col items-center justify-center text-center relative overflow-hidden bg-slate-50`}>
           <div className={`absolute top-0 left-0 w-full h-3 bg-gradient-to-r ${bgGradient}`}></div>
           
           <div className={`w-40 h-40 ${iconBg} rounded-full flex items-center justify-center mb-8 shadow-inner`}>
              <Award className={`w-20 h-20 ${colorClass}`} />
           </div>

           <h2 className="text-4xl font-black text-slate-900 mb-3">{title}</h2>
           <p className="text-slate-500 font-medium px-4 text-xl">{message}</p>
        </div>

        {/* Right Side: Stats & Actions */}
        <div className="md:w-1/2 p-12 bg-white flex flex-col justify-center border-t md:border-t-0 md:border-l border-slate-100">
           <div className="text-center mb-10">
              <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">KẾT QUẢ CỦA BẠN</span>
              <div className="flex items-baseline justify-center mt-3">
                 <span className={`text-8xl font-black ${colorClass}`}>{score}</span>
                 <span className="text-4xl text-slate-300 font-bold ml-1">/{total}</span>
              </div>
           </div>

           <div className="space-y-4">
             <button 
                onClick={onRestart}
                className="group w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xl flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                title="Phím tắt: R"
              >
                <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" /> 
                <span>Thử lại</span>
                <span className="ml-2 bg-slate-700 text-slate-300 px-3 py-1 rounded-lg border-b-2 border-slate-950 text-base font-bold shadow-sm">R</span>
              </button>

              <button 
                onClick={onHome}
                className="w-full py-5 bg-white text-slate-600 border border-slate-200 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors"
              >
                <Home className="w-6 h-6" /> Home
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};
