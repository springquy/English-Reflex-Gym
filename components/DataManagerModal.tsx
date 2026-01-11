
import React, { useState, useRef, useEffect } from 'react';
import { X, FolderPlus, FileJson, Copy, Check, Trash2, Plus, ArrowLeft, Pencil, Download, Upload, AlertCircle, Cloud, RefreshCw, LogIn, ShieldAlert, LogOut } from 'lucide-react';
import { CustomDeck, Question } from '../types';
import { initGoogleDrive, signInToGoogle, syncWithDrive, saveToDrive, disconnectGoogle } from '../services/driveService';
import { GOOGLE_CLIENT_ID } from '../constants';

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
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Drive State
  const [isDriveReady, setIsDriveReady] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Init Drive and Restore State
  useEffect(() => {
    // Check localStorage for persisted connection state
    const wasConnected = localStorage.getItem('english_gym_drive_connected') === 'true';
    if (wasConnected) {
        setIsDriveConnected(true);
    }

    if (GOOGLE_CLIENT_ID) {
        initGoogleDrive(GOOGLE_CLIENT_ID, (success) => {
            setIsDriveReady(success);
        });
    }
  }, []);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(GEMINI_PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setJsonInput('');
    setDeckName('');
    setEditingDeckId(null);
    setImportError(null);
  };

  // --- DRIVE ACTIONS ---
  
  // Connect logic
  const performConnection = async (forceSelectAccount = false) => {
    setAccessDenied(false);
    try {
        await signInToGoogle(forceSelectAccount);
        setIsDriveConnected(true);
        localStorage.setItem('english_gym_drive_connected', 'true');
        handleSyncDrive(); // Auto sync after connect
    } catch (e: any) {
        if (e.message === 'ACCESS_DENIED_TEST_USER') {
            setAccessDenied(true);
        } else {
            console.error(e);
            alert("Đăng nhập thất bại. Vui lòng thử lại.");
        }
    }
  };

  const handleConnectDrive = () => performConnection(false);

  const handleLogout = async () => {
      if (confirm("Bạn có chắc muốn đăng xuất khỏi Google Drive?")) {
        disconnectGoogle();
        localStorage.removeItem('english_gym_drive_connected');
        setIsDriveConnected(false);
      }
  };

  const handleSyncDrive = async () => {
      // Even if UI says connected, check if we actually have a valid token logic handled in service
      // If service throws AUTH_REQUIRED, we assume token expired (e.g. F5) and try to re-sign in silently/promptly
      
      setIsSyncing(true);
      try {
          const result = await syncWithDrive(customDecks);
          onSaveDecks(result.decks);
          setLastSyncedTime(new Date(result.lastSynced).toLocaleString());
      } catch (e: any) {
          if (e.message === 'AUTH_REQUIRED') {
             // Token missing (F5 reload case). Re-auth automatically.
             console.log("Token expired or missing, re-authenticating...");
             try {
                await signInToGoogle(); 
                // Retry sync once
                const result = await syncWithDrive(customDecks);
                onSaveDecks(result.decks);
                setLastSyncedTime(new Date(result.lastSynced).toLocaleString());
             } catch (retryErr) {
                alert("Phiên đăng nhập hết hạn. Vui lòng nhấn nút Kết nối lại.");
                setIsDriveConnected(false);
                localStorage.removeItem('english_gym_drive_connected');
             }
          } else {
             alert("Lỗi đồng bộ: " + e.message);
          }
      } finally {
          setIsSyncing(false);
      }
  };

  // --- LOGIC XUẤT FILE (BACKUP) ---
  const handleExportBackup = () => {
    if (customDecks.length === 0) {
        alert("Chưa có dữ liệu để xuất.");
        return;
    }
    const dataStr = JSON.stringify(customDecks, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.download = `english-gym-backup-${date}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- LOGIC NHẬP FILE (RESTORE) ---
  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target?.result as string;
            const parsed = JSON.parse(content);
            
            if (!Array.isArray(parsed)) throw new Error("File không hợp lệ (Không phải mảng).");
            
            // Validate sơ bộ cấu trúc
            const isValid = parsed.every(d => d.id && d.name && Array.isArray(d.questions));
            if (!isValid) throw new Error("Cấu trúc dữ liệu trong file không đúng format của English Gym.");

            const existingIds = new Set(customDecks.map(d => d.id));
            const newDecks = parsed.filter((d: CustomDeck) => !existingIds.has(d.id));

            if (newDecks.length === 0) {
                alert("Tất cả dữ liệu trong file đã tồn tại trong ứng dụng.");
            } else {
                const merged = [...parsed, ...customDecks.filter(d => !parsed.find((p: CustomDeck) => p.id === d.id))];
                onSaveDecks(merged); 
                alert(`Đã khôi phục thành công ${parsed.length} bộ dữ liệu.`);
                // If connected, sync to drive
                if (isDriveConnected) {
                    saveToDrive(merged).then(() => setLastSyncedTime(new Date().toLocaleString()));
                }
            }
        } catch (err: any) {
            alert("Lỗi khi đọc file: " + err.message);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };
    reader.readAsText(file);
  };

  const handleSave = async () => {
    try {
      if (!jsonInput.trim()) return;
      if (!deckName.trim()) { setImportError("Vui lòng đặt tên cho bộ dữ liệu."); return; }
      
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

      let newDecks = [];

      if (editingDeckId) {
        // Update existing deck
        newDecks = customDecks.map(deck => 
          deck.id === editingDeckId 
            ? { ...deck, name: deckName, questions: normalizedQuestions } 
            : deck
        );
      } else {
        // Create new deck
        const newDeck: CustomDeck = {
          id: crypto.randomUUID(),
          name: deckName,
          questions: normalizedQuestions,
          createdAt: Date.now()
        };
        newDecks = [newDeck, ...customDecks];
      }

      onSaveDecks(newDecks);

      if (isDriveConnected) {
         saveToDrive(newDecks).then(() => setLastSyncedTime(new Date().toLocaleString()));
      }

      resetForm();
      setView('list');
    } catch (e: any) {
      setImportError("Lỗi JSON: " + e.message);
    }
  };

  const handleEdit = (deck: CustomDeck) => {
    setDeckName(deck.name);
    // Format JSON with indentation for easier editing
    setJsonInput(JSON.stringify(deck.questions, null, 2));
    setEditingDeckId(deck.id);
    setView('add');
    setImportError(null);
  };

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc muốn xoá bộ dữ liệu này không?")) {
      const filtered = customDecks.filter(d => d.id !== id);
      onSaveDecks(filtered);
      if (isDriveConnected) {
         saveToDrive(filtered).then(() => setLastSyncedTime(new Date().toLocaleString()));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className={`bg-white rounded-[2rem] w-full max-w-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden ${view === 'add' ? 'h-auto max-h-[90vh]' : 'h-[80vh]'}`}>
        
        {/* Header - Compact */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0 transition-all">
          <div className="flex items-center gap-3">
             {view === 'add' && (
                <button onClick={() => { setView('list'); resetForm(); }} className="p-1.5 hover:bg-slate-50 rounded-full -ml-2 mr-1 transition-colors">
                   <ArrowLeft className="w-5 h-5 text-slate-500" />
                </button>
             )}
             <div className="p-2 bg-green-50 rounded-xl border border-green-100">
               <FolderPlus className="w-5 h-5 text-green-600" />
             </div>
             <h2 className="text-lg md:text-xl font-black text-slate-800">
                {view === 'list' ? 'Quản lý kho dữ liệu' : (editingDeckId ? 'Chỉnh sửa bộ dữ liệu' : 'Thêm bộ dữ liệu mới')}
             </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
           
           {view === 'list' ? (
              <div className="space-y-4">
                 {/* Main Action: Add New */}
                 <button 
                    onClick={() => { resetForm(); setView('add'); }}
                    className="w-full py-4 border-2 border-dashed border-green-300 bg-green-50/40 hover:bg-green-50 text-green-700 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                 >
                    <Plus className="w-5 h-5" /> Thêm bộ dữ liệu mới
                 </button>

                 {/* Google Drive Section */}
                 <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100/50">
                    {!isDriveConnected ? (
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleConnectDrive}
                                disabled={!isDriveReady || !GOOGLE_CLIENT_ID}
                                className="w-full py-3 bg-white border border-blue-200 text-blue-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors shadow-sm relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-blue-100/50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                                <LogIn className="w-4 h-4 relative z-10" /> 
                                <span className="relative z-10">{!GOOGLE_CLIENT_ID ? 'Chưa cấu hình Client ID' : 'Kết nối Google Drive'}</span>
                            </button>
                            
                            {!GOOGLE_CLIENT_ID ? (
                                <p className="text-[10px] text-red-500 text-center">
                                    Developer note: Hãy thêm Client ID vào file constants.ts
                                </p>
                            ) : accessDenied && (
                                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                                   <div className="flex items-center gap-2 mb-1.5">
                                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                                      <p className="text-[10px] text-amber-800 font-bold">Lỗi 403: Chưa được cấp quyền truy cập</p>
                                   </div>
                                   <p className="text-[10px] text-amber-700 mb-2 leading-relaxed">
                                      Do ứng dụng đang ở chế độ <b>Testing</b>, bạn cần thêm email của mình vào danh sách <b>Test users</b> trên Google Cloud.
                                   </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm min-w-0">
                                <Cloud className="w-5 h-5 shrink-0" />
                                <div className="flex flex-col truncate">
                                    <span>Đã kết nối Drive</span>
                                    <span className="text-[10px] font-normal text-slate-500 truncate">
                                        {lastSyncedTime ? `Lần cuối: ${lastSyncedTime}` : 'Dữ liệu được bảo vệ an toàn'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button 
                                    onClick={handleLogout}
                                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-lg font-bold text-[10px] flex items-center gap-1.5 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors whitespace-nowrap"
                                >
                                    <LogOut className="w-3 h-3" /> Đăng xuất
                                </button>
                                <button 
                                    onClick={handleSyncDrive}
                                    disabled={isSyncing}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-bold text-[10px] flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                                >
                                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} /> 
                                    {isSyncing ? 'Đang bộ...' : 'Đồng bộ ngay'}
                                </button>
                            </div>
                        </div>
                    )}
                 </div>

                 {/* Backup & Restore Tools */}
                 <div className="grid grid-cols-2 gap-3">
                     <input 
                        type="file" 
                        accept=".json" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleImportFile}
                     />
                     <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="py-3 px-4 bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        title="Tải file JSON backup từ máy tính lên"
                     >
                        <Upload className="w-4 h-4" /> Nhập file JSON
                     </button>
                     <button 
                        onClick={handleExportBackup}
                        className="py-3 px-4 bg-slate-50 border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all"
                        title="Tải toàn bộ dữ liệu về máy tính"
                     >
                        <Download className="w-4 h-4" /> Xuất file JSON
                     </button>
                 </div>

                 <div className="space-y-3 mt-4 pt-4 border-t border-slate-100">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Danh sách hiện có ({customDecks.length})</h3>
                    {customDecks.length === 0 && (
                       <div className="text-center py-8">
                          <AlertCircle className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-slate-400 italic text-sm">Chưa có dữ liệu nào.<br/>Hãy thêm mới hoặc nhập file JSON.</p>
                       </div>
                    )}
                    {customDecks.map(deck => (
                       <div key={deck.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-slate-300 transition-all group">
                          <div className="flex-1 min-w-0 pr-4">
                             <h4 className="font-bold text-slate-800 text-base mb-0.5 truncate">{deck.name}</h4>
                             <p className="text-[11px] text-slate-400 font-bold">{deck.questions.length} câu hỏi • {new Date(deck.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-1">
                             <button 
                                onClick={() => handleEdit(deck)}
                                className="p-2 text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                title="Sửa"
                             >
                                <Pencil className="w-4 h-4" />
                             </button>
                             <button 
                                onClick={() => handleDelete(deck.id)}
                                className="p-2 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xoá"
                             >
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4 h-full flex flex-col pb-2">
                  {/* Step 1 */}
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">1. TÊN BỘ DỮ LIỆU</label>
                     <input 
                        type="text" 
                        value={deckName}
                        onChange={e => setDeckName(e.target.value)}
                        placeholder="Ví dụ: Gia đình, Du lịch..."
                        className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 placeholder:text-slate-300 placeholder:font-medium"
                     />
                  </div>

                  {/* Step 2 */}
                  <div>
                     <div className="flex justify-between items-end mb-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2. Tạo JSON bằng AI</label>
                        <button 
                           onClick={handleCopyPrompt}
                           className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center gap-1 hover:bg-green-100 transition-colors"
                        >
                           {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Đã copy" : "Copy Prompt Mẫu"}
                        </button>
                     </div>
                     <p className="text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 leading-relaxed">
                        Copy prompt mẫu - Gửi cho Gemini - Copy JSON trả về.
                     </p>
                  </div>

                  {/* Step 3 */}
                  <div className="flex-1 flex flex-col min-h-0">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">3. NỘI DUNG</label>
                     <div className="relative">
                        <textarea 
                           value={jsonInput}
                           onChange={(e) => setJsonInput(e.target.value)}
                           placeholder='['
                           className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none leading-relaxed"
                           spellCheck={false}
                        />
                        <FileJson className="absolute bottom-3 right-3 w-4 h-4 text-slate-300 pointer-events-none" />
                     </div>
                     {importError && <p className="text-[10px] text-red-500 font-bold mt-1.5 bg-red-50 p-1.5 rounded-lg border border-red-100">{importError}</p>}
                  </div>

                  <button 
                     onClick={handleSave}
                     className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-base shadow-lg shadow-green-100 active:scale-95 transition-all shrink-0 mt-2"
                  >
                     {editingDeckId ? 'Cập nhật' : 'Lưu Bộ Dữ Liệu'}
                  </button>
              </div>
           )}

        </div>
      </div>
    </div>
  );
};
