
import React, { useState } from 'react';
import { X, FolderPlus, FileJson, Copy, Check, Trash2, Plus, ArrowLeft } from 'lucide-react';
import { CustomDeck, Question } from '../types';

interface DataManagerModalProps {
  customDecks: CustomDeck[];
  onSaveDecks: (decks: CustomDeck[]) => void;
  onClose: () => void;
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
3. Nếu nội dung đầu vào là danh sách ví dụ, hãy tạo câu hỏi tương ứng.

Nội dung đầu vào: [DÁN NỘI DUNG HOẶC ẢNH CỦA BẠN VÀO ĐÂY]`;

export const DataManagerModal: React.FC<DataManagerModalProps> = ({ customDecks, onSaveDecks, onClose }) => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [jsonInput, setJsonInput] = useState('');
  const [deckName, setDeckName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(GEMINI_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    try {
      if (!jsonInput.trim()) return;
      if (!deckName.trim()) { setImportError("Vui lòng đặt tên cho bộ bài."); return; }
      
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Dữ liệu phải là một Mảng (Array) JSON.");
      
      const valid = parsed.every(q => q.vietnamese && q.main_answer);
      if (!valid) throw new Error("JSON thiếu trường 'vietnamese' hoặc 'main_answer'.");

      const normalizedQuestions: Question[] = parsed.map((q, idx) => ({
        ...q,
        id: q.id || Date.now() + idx,
        variations: q.variations || [],
        hint: q.hint || { structure: "...", vocab: "..." },
        note: q.note || ""
      }));

      const newDeck: CustomDeck = {
        id: crypto.randomUUID(),
        name: deckName,
        questions: normalizedQuestions,
        createdAt: Date.now()
      };

      onSaveDecks([newDeck, ...customDecks]);
      setView('list');
      setJsonInput('');
      setDeckName('');
      setImportError(null);
    } catch (e: any) {
      setImportError("Lỗi JSON: " + e.message);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xoá bộ bài này không?")) {
      const filtered = customDecks.filter(d => d.id !== id);
      onSaveDecks(filtered);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-200 h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-4">
             {view === 'add' && (
                <button onClick={() => setView('list')} className="p-2.5 hover:bg-slate-50 rounded-full mr-2">
                   <ArrowLeft className="w-6 h-6 text-slate-500" />
                </button>
             )}
             <div className="p-3 bg-green-50 rounded-xl border border-green-100">
               <FolderPlus className="w-7 h-7 text-green-600" />
             </div>
             <h2 className="text-2xl font-black text-slate-800">
                {view === 'list' ? 'Quản lý kho dữ liệu' : 'Thêm bộ bài mới'}
             </h2>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-7 h-7 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10">
           
           {view === 'list' ? (
              <div className="space-y-6">
                 <button 
                    onClick={() => setView('add')}
                    className="w-full py-6 border-3 border-dashed border-green-200 bg-green-50/30 hover:bg-green-50 text-green-700 rounded-3xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
                 >
                    <Plus className="w-6 h-6" /> Thêm bộ dữ liệu mới (Import JSON)
                 </button>

                 <div className="space-y-4 mt-8">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Danh sách hiện có ({customDecks.length})</h3>
                    {customDecks.length === 0 && (
                       <p className="text-center text-slate-400 py-10 italic text-lg">Chưa có dữ liệu nào. Hãy thêm mới!</p>
                    )}
                    {customDecks.map(deck => (
                       <div key={deck.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                          <div>
                             <h4 className="font-bold text-slate-800 text-xl mb-1">{deck.name}</h4>
                             <p className="text-sm text-slate-400 font-medium">{deck.questions.length} câu hỏi • Tạo lúc {new Date(deck.createdAt).toLocaleDateString()}</p>
                          </div>
                          <button 
                             onClick={() => handleDelete(deck.id)}
                             className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                             title="Xoá"
                          >
                             <Trash2 className="w-6 h-6" />
                          </button>
                       </div>
                    ))}
                 </div>
              </div>
           ) : (
              <div className="space-y-8 animate-in slide-in-from-right-8">
                  {/* Step 1 */}
                  <div className="space-y-3">
                     <label className="text-sm font-black text-slate-400 uppercase tracking-widest">1. Tên bộ bài</label>
                     <input 
                        type="text" 
                        value={deckName}
                        onChange={e => setDeckName(e.target.value)}
                        placeholder="Ví dụ: Luyện Speaking Part 1, Từ vựng Du lịch..."
                        className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 text-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                     />
                  </div>

                  {/* Step 2 */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-end">
                        <label className="text-sm font-black text-slate-400 uppercase tracking-widest">2. Tạo JSON bằng AI</label>
                        <button 
                           onClick={handleCopyPrompt}
                           className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-xl flex items-center gap-2 hover:bg-green-100 transition-colors"
                        >
                           {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {copied ? "Đã copy" : "Copy Prompt Mẫu"}
                        </button>
                     </div>
                     <p className="text-sm text-slate-500 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
                        Copy prompt mẫu - Gửi cho Gemini kèm nội dung học - Copy JSON trả về.
                     </p>
                  </div>

                  {/* Step 3 */}
                  <div className="space-y-3">
                     <label className="text-sm font-black text-slate-400 uppercase tracking-widest">3. Dán JSON vào đây</label>
                     <div className="relative">
                        <textarea 
                           value={jsonInput}
                           onChange={(e) => setJsonInput(e.target.value)}
                           placeholder='Dán kết quả JSON từ Gemini vào đây...'
                           className="w-full h-48 bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none"
                        />
                        <FileJson className="absolute bottom-5 right-5 w-6 h-6 text-slate-300" />
                     </div>
                     {importError && <p className="text-sm text-red-500 font-bold">{importError}</p>}
                  </div>

                  <button 
                     onClick={handleImport}
                     className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-xl shadow-lg shadow-green-100 active:scale-95 transition-all"
                  >
                     Lưu Bộ Dữ Liệu
                  </button>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};
