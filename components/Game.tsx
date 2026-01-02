
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, Zap, HelpCircle, CheckCircle, XCircle, ArrowRight, BookOpen, Loader2, MicOff, Mic, Tag, BarChart, Sparkles } from 'lucide-react';
import { GameSettings, GameState, Feedback } from '../types';
import { MOCK_DATA } from '../constants';
import { checkAnswerLocally } from '../services/textUtils';
import { playAudio } from '../services/speechService';
import { evaluateAnswerWithAI } from '../services/aiService';
import { Visualizer } from './Visualizer';

interface GameProps {
  settings: GameSettings;
  onEnd: (score: number, total: number) => void;
  onExit: () => void;
}

export const Game: React.FC<GameProps> = ({ settings, onEnd, onExit }) => {
  const [questions] = useState(() => {
    let filtered = settings.selectedCategory === 'All' 
      ? MOCK_DATA 
      : MOCK_DATA.filter(q => q.category === settings.selectedCategory);
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    return settings.questionCount >= 999 ? shuffled : shuffled.slice(0, settings.questionCount);
  });

  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>(GameState.THINKING);
  const [transcript, setTranscript] = useState('');
  const [timeLeft, setTimeLeft] = useState(100);
  const [showHint, setShowHint] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isAIEvaluating, setIsAIEvaluating] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);
  const isProcessingRef = useRef(false);
  
  const sessionFinalTranscriptRef = useRef(''); 
  const latestTranscriptRef = useRef('');

  const currentQ = questions[qIndex];
  const isTimeUnlimited = settings.timePerQuestion === 0;

  const processAnswer = useCallback(async (textToProcess: string) => {
    if (!textToProcess || !isComponentMounted.current || isProcessingRef.current) return;
    
    isProcessingRef.current = true;
    setTranscript(textToProcess);

    // BƯỚC 1: KIỂM TRA LOCAL (MIỄN PHÍ & NHANH)
    const isCorrectLocally = checkAnswerLocally(textToProcess, currentQ);
    
    if (isCorrectLocally) {
      setScore(s => s + 1);
      setFeedback({ isCorrect: true, msg: "Chính xác! Phát âm rất tốt." });
      setGameState(GameState.REVIEWING);
    } else {
      // BƯỚC 2: NẾU SAI LOCAL, GỌI AI ĐỂ CỨU CÁNH (XỬ LÝ ĐỒNG NGHĨA)
      setGameState(GameState.REVIEWING);
      setIsAIEvaluating(true); // Bật trạng thái loading AI
      
      const aiResult = await evaluateAnswerWithAI(textToProcess, currentQ);
      
      if (!isComponentMounted.current) return;
      setIsAIEvaluating(false);
      
      if (aiResult.isCorrect) {
        setScore(s => s + 1);
        setFeedback({ isCorrect: true, msg: aiResult.feedback });
      } else {
        setFeedback({ isCorrect: false, msg: aiResult.feedback });
      }
    }
  }, [currentQ]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  }, []);

  const startListening = useCallback(() => {
    if (isProcessingRef.current || gameState === GameState.REVIEWING) return;
    if (!recognitionRef.current) return;

    try {
      sessionFinalTranscriptRef.current = '';
      latestTranscriptRef.current = ''; 
      setTranscript('');
      
      recognitionRef.current.start();
      setGameState(GameState.LISTENING);
      setMicError(null);
    } catch (e: any) {
      if (!e?.message?.includes('already started')) {
         console.warn("Recognition start error:", e);
      }
    }
  }, [gameState]);

  const nextQuestion = useCallback(() => {
    isProcessingRef.current = false;
    setFeedback(null);
    setTranscript('');
    setShowHint(0);
    setMicError(null);
    setIsSpacePressed(false);
    
    if (qIndex < questions.length - 1) {
      setQIndex(prev => prev + 1);
      setTimeLeft(100); 
      setGameState(GameState.THINKING);
    } else {
      onEnd(score, questions.length);
    }
  }, [qIndex, questions.length, onEnd, score]);

  const toggleHints = useCallback(() => {
    setShowHint(prev => {
      if (prev === 0) return 1;
      if (prev === 1) return 2;
      return 1;
    });
  }, []);

  useEffect(() => {
    isComponentMounted.current = true;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true; 
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimT = '';
        let newFinals = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
             newFinals += event.results[i][0].transcript + ' ';
          } else {
            interimT += event.results[i][0].transcript;
          }
        }

        if (newFinals) {
          sessionFinalTranscriptRef.current += newFinals;
        }

        const display = (sessionFinalTranscriptRef.current + interimT).trim();
        setTranscript(display);
        latestTranscriptRef.current = display;
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setMicError("Vui lòng cho phép truy cập Micro.");
        }
      };

      recognitionRef.current = recognition;
    } else {
      setMicError("Trình duyệt không hỗ trợ (Dùng Chrome/Edge).");
    }

    return () => {
      isComponentMounted.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch(e) {}
      }
    };
  }, []); 

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Escape') { onExit(); return; }
      if (e.code === 'Tab') {
        e.preventDefault();
        if (gameState === GameState.REVIEWING && !isAIEvaluating) { nextQuestion(); }
        return;
      }
      if (e.code === 'KeyQ') {
        if (gameState !== GameState.REVIEWING) { toggleHints(); }
        return;
      }
      if (e.code === 'Space') {
        if ((gameState === GameState.THINKING || gameState === GameState.LISTENING) && !isProcessingRef.current) {
           e.preventDefault();
           setIsSpacePressed(true);
           startListening();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (gameState === GameState.LISTENING) {
        setIsSpacePressed(false);
        stopListening();
        setTimeout(() => {
            const fullText = latestTranscriptRef.current.trim();
            if (fullText.length > 0) {
                processAnswer(fullText);
            } else {
                setGameState(GameState.THINKING); 
            }
        }, 200);
      }
    };

    const handleBlur = () => {
      if (gameState === GameState.LISTENING) {
        setIsSpacePressed(false);
        stopListening();
        setGameState(GameState.THINKING);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, isAIEvaluating, nextQuestion, startListening, stopListening, processAnswer, toggleHints, onExit]);

  useEffect(() => {
    if (!isTimeUnlimited && (gameState === GameState.LISTENING || gameState === GameState.THINKING)) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timerRef.current);
            isProcessingRef.current = true;
            stopListening();
            setFeedback({ isCorrect: false, msg: "Hết thời gian suy nghĩ!" });
            setGameState(GameState.REVIEWING);
            return 0;
          }
          return prev - (100 / (settings.timePerQuestion * 10));
        });
      }, 100);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState, isTimeUnlimited, settings.timePerQuestion, stopListening]);

  return (
    <div className="h-screen flex flex-col bg-slate-50 overflow-hidden">
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shrink-0 h-16">
        <div className="flex items-center gap-5">
          <button onClick={onExit} className="p-2 -ml-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-full transition-all group relative" title="Thoát (ESC)">
            <X className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              {isTimeUnlimited ? <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> : <Zap className="w-3.5 h-3.5 text-orange-500" />}
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isTimeUnlimited ? 'Relaxing Mode' : `${settings.timePerQuestion}s Blitz`}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800">
              Câu {qIndex + 1} <span className="text-slate-400 font-medium">/ {questions.length}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 text-white px-4 py-1.5 rounded-xl font-black text-sm shadow-xl shadow-slate-200">
            {score} / {questions.length}
          </div>
        </div>
      </header>

      {!isTimeUnlimited && (
        <div className="h-1 w-full bg-slate-100 shrink-0">
          <div className={`h-full transition-all duration-100 ease-linear ${timeLeft < 30 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${timeLeft}%` }}></div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-12 items-start md:items-center h-full md:h-auto">
          
          <div className="md:col-span-7 flex flex-col gap-6 md:gap-10">
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className={`
                 px-3 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-sm
                 ${currentQ.level === 'Easy' ? 'bg-green-50 border-green-100 text-green-700' : 
                   currentQ.level === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-700' : 
                   'bg-rose-50 border-rose-100 text-rose-700'}
              `}>
                 <BarChart className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-black uppercase tracking-wider">{currentQ.level}</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-slate-100 bg-white text-slate-500 flex items-center gap-1.5 shadow-sm">
                 <Tag className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-black uppercase tracking-wider">{currentQ.category}</span>
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
               {currentQ.vietnamese}
            </h2>

            <div className={`
              min-h-[120px] md:min-h-[160px] w-full p-6 md:p-8 rounded-[2rem] flex flex-col items-center justify-center relative transition-all duration-200 border-2
              ${gameState === GameState.REVIEWING 
                ? (feedback?.isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100')
                : (isSpacePressed 
                    ? 'bg-indigo-50 border-indigo-200 shadow-[0_0_0_4px_rgba(99,102,241,0.2)] scale-[1.02]' 
                    : 'bg-white border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]')
              }
            `}>
              {isSpacePressed && !micError && !isProcessingRef.current && (
                <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                  <Visualizer />
                </div>
              )}

              <p className={`
                text-xl md:text-3xl font-bold transition-all relative z-10 text-center leading-relaxed
                ${gameState === GameState.REVIEWING
                  ? (feedback?.isCorrect ? 'text-green-600' : 'text-red-500 line-through decoration-red-300 opacity-60')
                  : 'text-indigo-600'
                }
              `}>
                {transcript}
              </p>

              {!isSpacePressed && !transcript && gameState !== GameState.REVIEWING && (
                 <div className="flex flex-col items-center gap-3 text-slate-300">
                    <div className="p-3 rounded-full bg-slate-50 border border-slate-100">
                        <Mic className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wide">Giữ phím SPACE để nói</span>
                 </div>
              )}
              
              {isSpacePressed && !transcript && (
                 <span className="text-indigo-400 font-bold text-lg animate-pulse tracking-wide uppercase">Đang nghe...</span>
              )}

              {micError && (
                <div className="flex flex-col items-center gap-2 text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 z-20 absolute inset-4 justify-center">
                  <MicOff className="w-6 h-6" />
                  <p className="text-xs font-bold text-center">{micError}</p>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-5 w-full">
            {gameState !== GameState.REVIEWING && (
              <div className="flex flex-col items-center justify-center space-y-4 md:min-h-[300px]">
                {showHint === 0 ? (
                  <button 
                    onClick={() => setShowHint(1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[11px] uppercase tracking-widest transition-all px-6 py-4 rounded-2xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 group"
                  >
                    <HelpCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                    Gợi ý <span className="ml-1 bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded text-[9px] border border-slate-200">Q</span>
                  </button>
                ) : showHint === 1 ? (
                  <div 
                    className="w-full bg-amber-50 border border-amber-100 p-6 md:p-8 rounded-[2rem] text-center animate-in slide-in-from-right-4 cursor-pointer shadow-sm hover:shadow-md transition-all group"
                    onClick={() => setShowHint(2)}
                  >
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-3">CẤU TRÚC GỢI Ý</p>
                    <p className="text-xl md:text-2xl font-bold text-amber-900 font-mono tracking-tight">{currentQ.hint.structure}</p>
                    <p className="text-[10px] text-amber-400 mt-4 font-bold group-hover:text-amber-600 transition-colors">Bấm (hoặc Q) để xem từ vựng</p>
                  </div>
                ) : (
                  <div 
                    className="w-full bg-blue-50 border border-blue-100 p-6 md:p-8 rounded-[2rem] text-center animate-in slide-in-from-right-4 shadow-sm cursor-pointer hover:shadow-md transition-all group"
                    onClick={() => setShowHint(1)}
                  >
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3">TỪ KHÓA QUAN TRỌNG</p>
                    <p className="text-xl md:text-2xl font-bold text-blue-900 font-mono tracking-tight">{currentQ.hint.vocab}</p>
                    <p className="text-[10px] text-blue-400 mt-4 font-bold group-hover:text-blue-600 transition-colors">Bấm (hoặc Q) để xem cấu trúc</p>
                  </div>
                )}
              </div>
            )}

            {gameState === GameState.REVIEWING && feedback && (
              <div className="w-full bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] animate-in slide-in-from-right-8 duration-500">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`p-3 rounded-2xl shrink-0 ${feedback.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {feedback.isCorrect ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                  </div>
                  <div className="w-full pt-1">
                    <h3 className={`text-lg md:text-xl font-black leading-tight ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {feedback.msg}
                    </h3>
                    {isAIEvaluating && (
                       <div className="mt-2 flex items-center gap-2 text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl w-fit animate-pulse">
                          <Sparkles className="w-3.5 h-3.5" /> 
                          <span className="text-xs font-bold">AI đang kiểm tra kỹ hơn...</span>
                       </div>
                    )}
                  </div>
                </div>

                {!isAIEvaluating && (
                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">ĐÁP ÁN ĐÚNG</p>
                    <div 
                       onClick={() => playAudio(currentQ.main_answer)}
                       className="flex items-center gap-3 cursor-pointer hover:text-indigo-600 transition-colors group"
                    >
                       <div className="p-2 rounded-full border border-slate-200 text-slate-400 group-hover:border-indigo-200 group-hover:text-indigo-500 bg-white">
                          <Volume2 className="w-4 h-4" />
                       </div>
                       <p className="text-lg font-black text-slate-900 leading-tight group-hover:text-indigo-900">{currentQ.main_answer}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">CÁCH NÓI KHÁC</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentQ.variations.map((v, i) => (
                      <button 
                        key={i} 
                        onClick={() => playAudio(v)}
                        className="px-3 py-2 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 rounded-lg text-xs font-bold border border-slate-100 flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Volume2 className="w-3 h-3 opacity-50" />
                        {v}
                      </button>
                    ))}
                  </div>

                  <div className="p-4 bg-indigo-50/40 rounded-2xl flex gap-3 items-start border border-indigo-100/50">
                    <BookOpen className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed italic">{currentQ.note}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 bg-white border-t border-slate-100 shrink-0 z-10 h-24 flex items-center justify-center">
        <div className="w-full max-w-md">
          {gameState === GameState.REVIEWING ? (
            <div 
              onClick={nextQuestion}
              className="w-full py-4 bg-[#0f172a] text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-800 transition-all active:scale-95 group"
            >
              <span className="flex items-center gap-2">Nhấn <span className="bg-slate-700 px-2 py-0.5 rounded-md border border-slate-600 text-sm">Tab</span> để tiếp tục</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          ) : isProcessingRef.current ? (
             <div className="w-full py-4 bg-slate-50 border-2 border-slate-100 text-slate-400 rounded-2xl font-black text-base flex items-center justify-center gap-3 cursor-wait">
               <Loader2 className="w-5 h-5 animate-spin" /> ĐANG XỬ LÝ...
            </div>
          ) : isSpacePressed ? (
            <div className="w-full py-4 bg-indigo-50 border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-base flex items-center justify-center gap-3 animate-pulse shadow-sm">
               <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
               THẢ SPACE ĐỂ GỬI
            </div>
          ) : (
             <div className="w-full py-4 bg-white border-b-4 border-slate-100 text-slate-400 rounded-2xl font-bold text-base flex items-center justify-center gap-2">
               Giữ <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-slate-600 font-black">Space</span> để nói
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
