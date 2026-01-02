
import React, { useState } from 'react';
import { X, Save, Settings as SettingsIcon, Infinity, Clock, Key, Eye, EyeOff, ExternalLink, Database, FileJson, Copy, Check, Trash2 } from 'lucide-react';
import { GameSettings, Question } from '../types';

interface SettingsModalProps {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onClose: () => void;
  customData: Question[];
  onSaveCustomData: (data: Question[]) => void;
}

const GEMINI_PROMPT = `Hãy đóng vai một chuyên gia tạo dữ liệu học tiếng Anh JSON.
Từ nội dung văn bản hoặc hình ảnh tôi cung cấp, hãy trích xuất và tạo ra một mảng JSON các câu hỏi để luyện phản xạ nói.

Cấu trúc JSON yêu cầu cho mỗi phần tử:
{
  "id": số_ngẫu_nhiên,
  "vietnamese": "Nghĩa tiếng Việt của câu",
  "main_answer": "Câu tiếng Anh chuẩn",
  "variations": ["Cách nói khác 1", "Cách nói khác 2"],
  "note": "Ghi chú ngắn về ngữ pháp/từ vựng (nếu có)",
  "hint": {
      "structure": "Cấu trúc câu (ví dụ: S + V + adj)",
      "vocab": "Từ vựng chính"
  }
}

Yêu cầu:
1. Chỉ trả về một mảng JSON thuần túy (Array of Objects). Không thêm markdown, không thêm giải thích.
2. "variations": Hãy sáng tạo thêm 1-2 cách nói tự nhiên khác cùng nghĩa.
3. Nếu nội dung đầu vào là danh sách ví dụ (ví dụ: "I'm tired"), hãy tạo câu hỏi tương ứng.

Nội dung đầu vào: [DÁN NỘI DUNG HOẶC ẢNH CỦA BẠN VÀO ĐÂY]`;

export const SettingsModal: React.FC<SettingsModalProps> = ({ settings, onSave, onClose, customData, onSaveCustomData }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const [tempSettings, setTempSettings] = React.useState(settings);
  const [showKey, setShowKey] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getTimeModeDescription = (time: number) => {
    switch (time) {
      case 5: return "Chế độ Ác quỷ: Phản xạ tức thời.";
      case 10: return "Chế độ Ám ảnh: Áp lực cao.";
      case 15: return "Chế độ Tiêu chuẩn: Vừa đủ để suy nghĩ.";
      case 0: return "Chế độ Thư giãn: Không giới hạn thời gian.";
      default: return `Bạn có ${time}s cho mỗi câu.`;
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(GEMINI_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      if (!jsonInput.trim()) return;
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Dữ liệu phải là một Mảng (Array) JSON.");
      
      // Basic validation
      const valid = parsed.every(q => q.vietnamese && q.main_answer);
      if (!valid) throw new Error("JSON thiếu trường 'vietnamese' hoặc 'main_answer'.");

      // Normalize optional fields
      const normalized = parsed.map((q, idx) => ({
        ...q,
        id: q.id || Date.now() + idx,
        variations: q.variations || [],
        hint: q.hint || { structure: "...", vocab: "..." },
        note: q.note || ""
      }));

      onSaveCustomData(normalized);
      setJsonInput('');
      setImportError(null);
      alert(`Đã nhập thành công ${normalized.length} câu hỏi mới!`);
    } catch (e: any) {
      setImportError("Lỗi JSON: " + e.message);
    }
  };

  const handleClearData = () => {
    if (confirm("Bạn có chắc muốn xoá dữ liệu bài học tuỳ chỉnh và quay về mặc định?")) {
      onSaveCustomData([]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-200 h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
              <SettingsIcon className="w-6 h-6 text-slate-500" />
            </div>
            Cài đặt
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-slate-100 shrink-0">
          <button 
            onClick={() => setActiveTab('general')}
            className={`py-4 mr-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Chung
          </button>
          <button 
             onClick={() => setActiveTab('data')}
             className={`py-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'data' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Dữ liệu bài học
            {customData.length > 0 && <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded text-[10px]">{customData.length}</span>}
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {activeTab === 'general' ? (
            <div className="space-y-8">
              {/* Section: API Key */}
              <section className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                <label className="flex items-center justify-between text-[11px] font-black text-indigo-900/60 uppercase tracking-[0.15em] mb-2">
                  <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> Gemini API Key</span>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:underline cursor-pointer normal-case font-bold">
                    Lấy key <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={tempSettings.apiKey || ''}
                    onChange={(e) => setTempSettings(s => ({ ...s, apiKey: e.target.value }))}
                    placeholder="Dán API Key vào đây..."
                    className="w-full bg-white border border-indigo-100 text-slate-800 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-300 pr-10"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </section>

              {/* Section: Số lượng câu hỏi */}
              <section>
                <div className="flex justify-between items-end mb-4">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">
                    Số câu / Lượt <span className="text-indigo-600 ml-1 text-sm">({tempSettings.questionCount})</span>
                  </label>
                </div>
                <div className="relative pt-2">
                  <input 
                    type="range" min="5" max="20" step="5"
                    value={tempSettings.questionCount}
                    onChange={(e) => setTempSettings(s => ({ ...s, questionCount: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-300">
                    <span className="w-4 text-center">5</span><span className="w-4 text-center">10</span>
                    <span className="w-4 text-center">15</span><span className="w-4 text-center">20</span>
                  </div>
                </div>
              </section>

              {/* Section: Thời gian */}
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
                <div className="mt-4 flex items-center gap-3 text-slate-500">
                  <Clock className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-medium">{getTimeModeDescription(tempSettings.timePerQuestion)}</p>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Data Status */}
              <div className={`p-4 rounded-2xl flex items-center justify-between ${customData.length > 0 ? 'bg-green-50 border border-green-100' : 'bg-slate-50 border border-slate-100'}`}>
                 <div className="flex items-center gap-3">
                    <Database className={`w-5 h-5 ${customData.length > 0 ? 'text-green-600' : 'text-slate-400'}`} />
                    <div>
                       <p className={`text-sm font-black ${customData.length > 0 ? 'text-green-800' : 'text-slate-600'}`}>
                          {customData.length > 0 ? 'Đang dùng dữ liệu tuỳ chỉnh' : 'Đang dùng dữ liệu mặc định'}
                       </p>
                       <p className="text-xs text-slate-400 font-medium">{customData.length > 0 ? `${customData.length} câu hỏi đã nhập` : 'Chưa có bài học nào được nhập'}</p>
                    </div>
                 </div>
                 {customData.length > 0 && (
                    <button onClick={handleClearData} className="p-2 bg-white rounded-lg text-red-500 shadow-sm border border-slate-100 hover:bg-red-50 transition-colors" title="Xoá dữ liệu">
                       <Trash2 className="w-4 h-4" />
                    </button>
                 )}
              </div>

              {/* Step 1: Prompt */}
              <div className="space-y-3">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Bước 1: Tạo dữ liệu
                 </h3>
                 <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                       Copy đoạn Prompt bên dưới và gửi cho <strong>Gemini</strong> (hoặc ChatGPT) kèm theo ảnh chụp bài học hoặc văn bản bạn muốn học.
                    </p>
                    <button 
                      onClick={handleCopyPrompt}
                      className="w-full py-2 bg-white border border-indigo-100 text-indigo-600 rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Đã copy!" : "Copy Prompt Mẫu"}
                    </button>
                 </div>
              </div>

              {/* Step 2: Import */}
              <div className="space-y-3">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Bước 2: Nhập JSON
                 </h3>
                 <div className="relative">
                    <textarea 
                      value={jsonInput}
                      onChange={(e) => setJsonInput(e.target.value)}
                      placeholder='Dán kết quả JSON từ Gemini vào đây...'
                      className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                    />
                    <div className="absolute bottom-3 right-3">
                       <FileJson className="w-4 h-4 text-slate-300" />
                    </div>
                 </div>
                 {importError && <p className="text-xs text-red-500 font-bold">{importError}</p>}
                 
                 <button 
                    onClick={handleImport}
                    disabled={!jsonInput.trim()}
                    className="w-full py-3 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    Nhập dữ liệu
                  </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action */}
        <div className="p-8 border-t border-slate-100 bg-white shrink-0">
          <button 
            onClick={() => { onSave(tempSettings); onClose(); }}
            className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95"
          >
            <Save className="w-5 h-5" /> {activeTab === 'general' ? 'Lưu Cài đặt' : 'Đóng'}
          </button>
        </div>

      </div>
    </div>
  );
};
