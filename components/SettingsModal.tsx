
import React from 'react';
import { X, Save, Settings as SettingsIcon, Infinity, Clock } from 'lucide-react';
import { GameSettings } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose }) => {
  const [tempSettings, setTempSettings] = React.useState(settings);

  const getTimeModeDescription = (time: number) => {
    switch (time) {
      case 5: return "Chế độ Ác quỷ: Phản xạ tức thời.";
      case 10: return "Chế độ Ám ảnh: Áp lực cao.";
      case 15: return "Chế độ Tiêu chuẩn: Vừa đủ để suy nghĩ.";
      case 0: return "Chế độ Thư giãn: Không giới hạn thời gian.";
      default: return `Bạn có ${time}s cho mỗi câu.`;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <SettingsIcon className="w-6 h-6 text-slate-500" />
            </div>
            Cài đặt
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="space-y-10">
          {/* Section: Số lượng câu hỏi với Slider */}
          <section>
            <div className="flex justify-between items-end mb-6">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Số lượng câu hỏi <span className="text-indigo-600 ml-1 text-sm">({tempSettings.questionCount})</span>
              </label>
            </div>
            <div className="relative pt-2">
              <input 
                type="range" 
                min="5" 
                max="20" 
                step="5"
                value={tempSettings.questionCount}
                onChange={(e) => setTempSettings(s => ({ ...s, questionCount: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-300">
                <span className="w-4 text-center">5</span>
                <span className="w-4 text-center">10</span>
                <span className="w-4 text-center">15</span>
                <span className="w-4 text-center">20</span>
              </div>
            </div>
          </section>

          {/* Section: Thời gian suy nghĩ */}
          <section>
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mb-4">THỜI GIAN TRẢ LỜI</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 0].map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => setTempSettings(s => ({ ...s, timePerQuestion: time }))}
                  className={`py-4 rounded-2xl text-sm font-black transition-all border-2 ${
                    tempSettings.timePerQuestion === time
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {time === 0 ? <Infinity className="w-5 h-5 mx-auto" /> : `${time}s`}
                </button>
              ))}
            </div>
            <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl flex items-center gap-3 border border-indigo-100/50">
              <Clock className="w-5 h-5 text-indigo-500 shrink-0" />
              <p className="text-sm font-semibold text-indigo-900/70 leading-snug">
                {getTimeModeDescription(tempSettings.timePerQuestion)}
              </p>
            </div>
          </section>
        </div>

        <button 
          onClick={() => { 
            onSave(tempSettings); 
            onClose(); 
          }}
          className="w-full mt-12 py-5 bg-[#0f172a] text-white rounded-[1.5rem] font-bold text-lg hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
        >
          <Save className="w-5 h-5" /> Lưu cài đặt
        </button>
      </div>
    </div>
  );
};
