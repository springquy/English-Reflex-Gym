
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Volume2, Zap, HelpCircle, CheckCircle, XCircle, ArrowRight, BookOpen, PlayCircle, Loader2, MicOff, Mic } from 'lucide-react';
import { GameSettings, GameState, Question, Feedback } from '../types';
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

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const isComponentMounted = useRef(true);
  
  const currentQ = questions[qIndex];
  const isTimeUnlimited = settings.timePerQuestion === 0;

  const handleAnswer = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript || !isComponentMounted.current) return;
    setTranscript(finalTranscript);
    
    // Stop recognition immediately after getting a result to prevent overlaps
    if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
    }

    // 1. Local Check (Immediate Feedback)
    const isCorrectLocally = checkAnswerLocally(finalTranscript, currentQ);
    
    if (isCorrectLocally) {
      setScore(s => s + 1);
      setFeedback({ isCorrect: true, msg: "Chính xác! Phát âm rất tốt." });
      setGameState(GameState.REVIEWING);
    } else {
      // 2. AI Check (Fallback for semantic meaning)
      setIsAIEvaluating(true);
      setGameState(GameState.REVIEWING);
      const aiResult = await evaluateAnswerWithAI(finalTranscript, currentQ);
      
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

  const startListening = useCallback(() => {
    if (!recognitionRef.current || gameState !== GameState.THINKING && gameState !== GameState.LISTENING) return;
    
    // If we are already running, don't restart unless necessary
    try {
      recognitionRef.current.start();
      setGameState(GameState.LISTENING);
      setMicError(null);
    } catch (e: any) {
      // If error is "recognition has already started", we just ensure state is correct
      if (e?.message?.includes('already started')) {
         setGameState(GameState.LISTENING);
         setMicError(null);
      } else {
         console.warn("Recognition start error:", e);
      }
    }
  }, [gameState]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }
  }, []);

  const nextQuestion = useCallback(() => {
    setFeedback(null);
    setTranscript('');
    setShowHint(0);
    setMicError(null);
    if (qIndex < questions.length - 1) {
      setQIndex(prev => prev + 1);
      setGameState(GameState.THINKING);
    } else {
      onEnd(score, questions.length);
    }
  }, [qIndex, questions.length, onEnd, score]);

  // Speech Recognition Initialization
  useEffect(() => {
    isComponentMounted.current = true;
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimT = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            const result = event.results[i][0].transcript;
            handleAnswer(result);
          } else {
            interimT += event.results[i][0].transcript;
            setTranscript(interimT);
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setMicError("Vui lòng cho phép truy cập Micro.");
        } else if (event.error === 'no-speech') {
           // Ignore no-speech, let it loop
        } else if (event.error === 'network') {
           setMicError("Lỗi mạng. Vui lòng kiểm tra kết nối.");
        } else {
           // For other errors, we might want to let user retry manually
        }
      };

      recognition.onend = () => {
        // Only restart if we are still in LISTENING state and haven't gotten an answer
        if (isComponentMounted.current && gameState === GameState.LISTENING && !feedback) {
           try { 
             recognition.start(); 
           } catch(e) {
             // If auto-restart fails, we might leave it to the user to press the button
           }
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
  }, [gameState, handleAnswer, feedback]);

  // Thinking to Listening transition
  useEffect(() => {
    if (gameState === GameState.THINKING) {
      const t = setTimeout(() => {
         setTranscript('');
         startListening();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [gameState, startListening]);

  // Key Bindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameState === GameState.REVIEWING) {
        e.preventDefault();
        nextQuestion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, nextQuestion]);

  // Timer
  useEffect(() => {
    if (!isTimeUnlimited && gameState === GameState.LISTENING) {
      setTimeLeft(100);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0) {
            clearInterval(timerRef.current);
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
      {/* Game Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-5">
          <button 
            onClick={onExit}
            className="p-2.5 -ml-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-full transition-all"
          >
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
          <div className="bg-slate-900 text-white px-5 py-2 rounded-2xl font-black text-sm shadow-xl shadow-slate-200">
            {score} / {questions.length}
          </div>
        </div>
      </header>

      {/* Progress/Timer Bar */}
      {!isTimeUnlimited && (
        <div className="h-1.5 w-full bg-slate-100 shrink-0">
          <div 
            className={`h-full transition-all duration-100 ease-linear ${timeLeft < 30 ? 'bg-red-500' : 'bg-indigo-500'}`}
            style={{ width: `${timeLeft}%` }}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 flex flex-col items-center">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
          
          <div className="mb-10 animate-in fade-in slide-in-from-top-6 duration-700">
            <span className="inline-flex items-center px-4 py-1.5 bg-white border border-slate-200 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-sm">
              <span className={`w-2 h-2 rounded-full mr-2 ${currentQ.level === 'Easy' ? 'bg-green-400' : currentQ.level === 'Medium' ? 'bg-orange-400' : 'bg-red-500'}`}></span>
              {currentQ.level} • {currentQ.category}
            </span>
          </div>

          <div className="text-center space-y-12 w-full">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight animate-in fade-in duration-1000">
              {currentQ.vietnamese}
            </h2>

            <div className={`
              min-h-[140px] w-full p-8 rounded-[2.5rem] flex flex-col items-center justify-center relative transition-all duration-500 border-2
              ${gameState === GameState.REVIEWING 
                ? (feedback?.isCorrect ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100')
                : 'bg-white border-slate-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)]'
              }
            `}>
              {gameState === GameState.LISTENING && !micError && (
                <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                  <Visualizer />
                </div>
              )}

              <p className={`
                text-2xl md:text-3xl font-bold transition-all relative z-10 text-center leading-relaxed
                ${gameState === GameState.REVIEWING
                  ? (feedback?.isCorrect ? 'text-green-600' : 'text-red-500 line-through decoration-red-300 opacity-60')
                  : 'text-indigo-600'
                }
              `}>
                {transcript || (gameState === GameState.LISTENING ? "..." : "")}
              </p>

              {gameState === GameState.LISTENING && !transcript && !micError && (
                <span className="text-slate-300 font-bold text-lg animate-pulse tracking-wide uppercase">Lắng nghe...</span>
              )}

              {micError && (
                <div className="flex flex-col items-center gap-3 text-red-500 bg-red-50 p-6 rounded-2xl border border-red-100 z-20">
                  <MicOff className="w-8 h-8" />
                  <p className="text-sm font-bold text-center">{micError}</p>
                  <button 
                    onClick={() => { setMicError(null); startListening(); }}
                    className="mt-2 px-4 py-2 bg-white border border-red-200 rounded-xl text-xs font-black uppercase text-red-500 shadow-sm hover:bg-red-50"
                  >
                    Thử lại
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hints */}
          {gameState !== GameState.REVIEWING && (
            <div className="mt-12 w-full flex justify-center">
              {showHint === 0 ? (
                <button 
                  onClick={() => setShowHint(1)}
                  className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[11px] uppercase tracking-widest transition-all px-6 py-3 rounded-2xl hover:bg-white hover:shadow-sm"
                >
                  <HelpCircle className="w-5 h-5" /> Gợi ý cấu trúc
                </button>
              ) : showHint === 1 ? (
                <div 
                  className="bg-amber-50 border border-amber-100 p-6 rounded-[2rem] text-center animate-in slide-in-from-bottom-2 cursor-pointer shadow-sm"
                  onClick={() => setShowHint(2)}
                >
                  <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2">CẤU TRÚC GỢI Ý</p>
                  <p className="text-xl font-bold text-amber-900 font-mono tracking-tight">{currentQ.hint.structure}</p>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-[2rem] text-center animate-in slide-in-from-bottom-2 shadow-sm">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">TỪ KHÓA QUAN TRỌNG</p>
                  <p className="text-xl font-bold text-blue-900 font-mono tracking-tight">{currentQ.hint.vocab}</p>
                </div>
              )}
            </div>
          )}

          {/* Review Panel */}
          {gameState === GameState.REVIEWING && feedback && (
            <div className="mt-12 w-full bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-[0_25px_60px_rgba(0,0,0,0.08)] animate-in slide-in-from-bottom-12 duration-700">
              <div className="flex items-start gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className={`p-4 rounded-2xl ${feedback.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  {feedback.isCorrect ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />}
                </div>
                <div className="space-y-2">
                  <h3 className={`text-2xl font-black ${feedback.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {feedback.msg}
                  </h3>
                  {isAIEvaluating && (
                     <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm bg-indigo-50 px-3 py-1.5 rounded-xl w-fit">
                        <Loader2 className="w-4 h-4 animate-spin" /> AI đang xử lý...
                     </div>
                  )}
                  {!feedback.isCorrect && !isAIEvaluating && (
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ĐÁP ÁN CHÍNH</p>
                      <p className="text-2xl font-black text-slate-900 leading-tight tracking-tight">{currentQ.main_answer}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">CÁCH NÓI TƯƠNG TỰ</p>
                   <button 
                    onClick={() => playAudio(currentQ.main_answer)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-2xl text-xs font-black transition-all hover:bg-indigo-100 active:scale-95"
                  >
                    <PlayCircle className="w-5 h-5 fill-current" /> NGHE MẪU
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentQ.variations.map((v, i) => (
                    <span key={i} className="px-5 py-2.5 bg-slate-50 text-slate-600 rounded-2xl text-sm font-bold border border-slate-100">
                      {v}
                    </span>
                  ))}
                </div>

                <div className="p-6 bg-indigo-50/40 rounded-[2rem] flex gap-4 items-start border border-indigo-100/50">
                  <BookOpen className="w-6 h-6 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-slate-600 leading-relaxed italic">{currentQ.note}</p>
                </div>

                <div className="pt-4 text-center">
                  <span className="text-[10px] font-black text-slate-300 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 uppercase tracking-widest">
                    Bấm <span className="text-slate-800">SPACE</span> để qua câu
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="p-6 bg-white border-t border-slate-100 shrink-0 z-10">
        <div className="max-w-md mx-auto">
          {gameState === GameState.LISTENING && !micError && (
            <button 
               onClick={startListening}
               className="w-full py-5 bg-white border-2 border-indigo-100 text-indigo-600 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-4 animate-pulse shadow-sm hover:bg-indigo-50 transition-colors"
            >
               <div className="w-3.5 h-3.5 bg-red-500 rounded-full animate-ping"></div>
               ĐANG GHI ÂM...
            </button>
          )}

          {gameState === GameState.REVIEWING && !isAIEvaluating && (
            <button 
              onClick={nextQuestion}
              className="w-full py-5 bg-[#0f172a] hover:bg-slate-800 text-white rounded-[1.8rem] font-black text-xl shadow-2xl shadow-slate-300 flex items-center justify-center gap-4 transition-all active:scale-95 group"
            >
              <span>{qIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {gameState === GameState.THINKING && (
            <div className="w-full py-5 bg-slate-50 text-slate-400 rounded-[1.8rem] font-black text-lg flex items-center justify-center gap-3">
               <Loader2 className="w-5 h-5 animate-spin" /> CHUẨN BỊ...
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};
