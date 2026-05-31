'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Question, CATEGORY_LABELS } from '@/lib/fallbackQuestions';
import { saveRecord, generateId } from '@/lib/db';
import StarRating from '@/components/StarRating';

type Step = 'setup' | 'questions' | 'recording' | 'feedback' | 'saved';

interface RecordingState {
  phase: 'idle' | 'preparing' | 'recording' | 'done';
  countdown: number;
  elapsed: number;
  audioBlob?: Blob;
  audioUrl?: string;
}

interface FeedbackState {
  clarity: number;
  structure: number;
  voice: number;
  note: string;
}

const PREP_TIME = 15;
const ANSWER_TIME = 60;

export default function PracticePage() {
  const [step, setStep] = useState<Step>('setup');
  const [theme, setTheme] = useState('');
  const [language, setLanguage] = useState('en');
  const [level, setLevel] = useState('normal');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [source, setSource] = useState<'ai' | 'fallback'>('ai');
  const [selectedQ, setSelectedQ] = useState<Question | null>(null);
  const [rec, setRec] = useState<RecordingState>({ phase: 'idle', countdown: PREP_TIME, elapsed: 0 });
  const [feedback, setFeedback] = useState<FeedbackState>({ clarity: 3, structure: 3, voice: 3, note: '' });
  const [savedId, setSavedId] = useState('');
  const [error, setError] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => { clearTimer(); }, [clearTimer]);

  async function generateQuestions() {
    if (!theme.trim()) { setError('請輸入例會主題'); return; }
    setError('');
    setLoading(true);
    try {
      const userApiKey = typeof window !== 'undefined' ? localStorage.getItem('openai_api_key') || '' : '';
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme, language, level, count, userApiKey }),
      });
      const data = await res.json();
      setQuestions(data.questions);
      setSource(data.source);
      setStep('questions');
    } catch {
      setError('產生題目時發生錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  }

  function selectQuestion(q: Question) {
    setSelectedQ(q);
    setRec({ phase: 'idle', countdown: PREP_TIME, elapsed: 0 });
    setStep('recording');
  }

  function startPrepTimer() {
    setRec({ phase: 'preparing', countdown: PREP_TIME, elapsed: 0 });
    let remaining = PREP_TIME;
    timerRef.current = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearTimer();
        startRecording();
      } else {
        setRec((r) => ({ ...r, countdown: remaining }));
      }
    }, 1000);
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRec((r) => ({ ...r, phase: 'done', audioBlob: blob, audioUrl: url }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      setRec({ phase: 'recording', countdown: ANSWER_TIME, elapsed: 0 });
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed++;
        if (elapsed >= ANSWER_TIME) {
          clearTimer();
          mr.stop();
        } else {
          setRec((r) => ({ ...r, elapsed, countdown: ANSWER_TIME - elapsed }));
        }
      }, 1000);
    } catch {
      setError('無法存取麥克風，請確認瀏覽器已授權。');
      setRec({ phase: 'idle', countdown: PREP_TIME, elapsed: 0 });
    }
  }

  function stopRecording() {
    clearTimer();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }

  function resetRecording() {
    clearTimer();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRec({ phase: 'idle', countdown: PREP_TIME, elapsed: 0 });
  }

  function proceedToFeedback() {
    setStep('feedback');
  }

  async function saveRecordFn() {
    const id = generateId();
    await saveRecord({
      id,
      theme,
      question: selectedQ!.question,
      category: selectedQ!.category,
      language,
      level,
      audioBlob: rec.audioBlob,
      durationSeconds: rec.elapsed,
      createdAt: new Date().toISOString(),
      selfScore: { clarity: feedback.clarity, structure: feedback.structure, voice: feedback.voice },
      note: feedback.note,
    });
    setSavedId(id);
    setStep('saved');
  }

  function startOver() {
    setStep('setup');
    setQuestions([]);
    setSelectedQ(null);
    setRec({ phase: 'idle', countdown: PREP_TIME, elapsed: 0 });
    setFeedback({ clarity: 3, structure: 3, voice: 3, note: '' });
    setSavedId('');
    setError('');
  }

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ──────────────── SETUP STEP ────────────────
  if (step === 'setup') return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">🎯 建立主題題庫</h1>
        <p className="page-subtitle">輸入本週例會主題，AI 產生即興演講題目</p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label className="form-label">例會主題 *</label>
            <input
              type="text"
              placeholder="例如：Life is a long journey / 勇氣 / Dreams"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateQuestions()}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">語言</label>
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="zh">中文</option>
                <option value="bilingual">中英雙語</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">難度</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="beginner">新手</option>
                <option value="normal">一般</option>
                <option value="challenge">挑戰</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">題目數量</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
                <option value={5}>5 題</option>
                <option value={10}>10 題</option>
                <option value={15}>15 題</option>
              </select>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            className="btn-primary"
            style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={generateQuestions}
            disabled={loading}
          >
            {loading ? <><span className="spinner" /> 產生中…</> : '✨ 產生題目'}
          </button>
        </div>

        <div className="alert alert-warning" style={{ marginTop: '20px' }}>
          💡 如需使用 AI 產生題目，請前往<a href="/settings">設定</a>填入你的 OpenAI API Key，或由管理員設定伺服器端 Key。沒有 Key 也可以使用內建示範題目。
        </div>
      </div>
    </main>
  );

  // ──────────────── QUESTIONS STEP ────────────────
  if (step === 'questions') {
    const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
      if (!acc[q.category]) acc[q.category] = [];
      acc[q.category].push(q);
      return acc;
    }, {});

    return (
      <main className="page">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <button className="btn-ghost" onClick={() => setStep('setup')}>← 返回</button>
            <h1 className="page-title" style={{ margin: 0 }}>📋 選擇題目</h1>
          </div>
          <p className="page-subtitle">
            主題：<strong>{theme}</strong>　
            {source === 'fallback' && <span className="badge badge-gold">示範題目</span>}
            {source === 'ai' && <span className="badge badge-green">AI 產生</span>}
          </p>

          {Object.entries(grouped).map(([cat, qs]) => (
            <div key={cat} style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                {CATEGORY_LABELS[cat] || cat}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {qs.map((q, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{ cursor: 'pointer', padding: '18px 20px', transition: 'box-shadow 0.15s, border-color 0.15s' }}
                    onClick={() => selectQuestion(q)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.borderColor = 'var(--gold-light)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.borderColor = 'var(--border-soft)';
                    }}
                  >
                    <p style={{ color: 'var(--text-primary)', marginBottom: '6px', fontWeight: 500 }}>{q.question}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      💡 {q.suggestedStructure}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  // ──────────────── RECORDING STEP ────────────────
  if (step === 'recording' && selectedQ) return (
    <main className="page">
      <div className="container">
        <button className="btn-ghost" onClick={() => { resetRecording(); setStep('questions'); }} style={{ marginBottom: '20px' }}>
          ← 返回選題
        </button>

        <div className="card" style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {CATEGORY_LABELS[selectedQ.category] || selectedQ.category}
          </p>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>
            {selectedQ.question}
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            💡 建議架構：{selectedQ.suggestedStructure}
          </p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          {rec.phase === 'idle' && (
            <>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎙</div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>準備好了嗎？</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '24px' }}>
                點擊「開始準備」後會有 {PREP_TIME} 秒準備時間，接著自動開始錄音，最長 {ANSWER_TIME} 秒。
              </p>
              {error && <div className="alert alert-error" style={{ marginBottom: '16px' }}>{error}</div>}
              <button className="btn-primary" style={{ fontSize: '1rem', padding: '12px 32px' }} onClick={startPrepTimer}>
                ▶ 開始準備
              </button>
            </>
          )}

          {rec.phase === 'preparing' && (
            <>
              <div style={{ fontSize: '4rem', color: 'var(--gold)', fontFamily: 'Lora', fontWeight: 700, marginBottom: '8px' }}>
                {rec.countdown}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>秒後開始錄音</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '8px' }}>整理你的思路…</p>
            </>
          )}

          {rec.phase === 'recording' && (
            <>
              <div
                className="recording-pulse"
                style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'var(--red)', color: 'white', fontSize: '2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                🔴
              </div>
              <div style={{ fontSize: '2.5rem', color: 'var(--text-primary)', fontFamily: 'Lora', fontWeight: 600, marginBottom: '8px' }}>
                {fmtTime(rec.elapsed)}
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>剩餘 {fmtTime(rec.countdown)}</p>
              <button className="btn-danger" style={{ fontSize: '1rem', padding: '12px 28px', borderRadius: '8px' }} onClick={stopRecording}>
                ⏹ 停止錄音
              </button>
            </>
          )}

          {rec.phase === 'done' && (
            <>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>✅</div>
              <p style={{ color: 'var(--green)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '8px' }}>
                錄音完成！({fmtTime(rec.elapsed)})
              </p>
              {rec.audioUrl && (
                <audio controls src={rec.audioUrl} style={{ width: '100%', maxWidth: '360px', marginBottom: '20px', borderRadius: '8px' }} />
              )}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-secondary" onClick={resetRecording}>🔄 重新錄一次</button>
                <button className="btn-primary" onClick={proceedToFeedback}>繼續自評 →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );

  // ──────────────── FEEDBACK STEP ────────────────
  if (step === 'feedback') return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">⭐ 自我評分</h1>
        <p className="page-subtitle">誠實的自評是進步最快的方式</p>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--parchment)', borderRadius: 'var(--radius)', padding: '14px 16px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>你回答的題目</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedQ?.question}</p>
          </div>

          {(['clarity', 'structure', 'voice'] as const).map((key) => {
            const labels = { clarity: '清楚度', structure: '結構', voice: '聲音自然度' };
            const descs = {
              clarity: '說話是否清楚，重點是否明確',
              structure: '有沒有邏輯架構，是否有開頭、論點、結尾',
              voice: '語速、音量、抑揚頓挫是否自然',
            };
            return (
              <div key={key} className="form-group">
                <label className="form-label">{labels[key]}</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{descs[key]}</p>
                <StarRating
                  value={feedback[key]}
                  onChange={(v) => setFeedback((f) => ({ ...f, [key]: v }))}
                />
              </div>
            );
          })}

          <div className="form-group">
            <label className="form-label">下次想改善的地方</label>
            <textarea
              rows={3}
              placeholder="例如：下次可以先講結論，再補例子。語速可以再放慢一點。"
              value={feedback.note}
              onChange={(e) => setFeedback((f) => ({ ...f, note: e.target.value }))}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" onClick={() => setStep('recording')}>← 返回</button>
            <button className="btn-primary" onClick={saveRecordFn}>💾 保存練習紀錄</button>
          </div>
        </div>

        <div className="alert alert-warning" style={{ marginTop: '16px' }}>
          💾 錄音預設只保存在目前裝置與瀏覽器。清除瀏覽器資料或更換裝置，紀錄可能消失。請至紀錄頁面匯出備份。
        </div>
      </div>
    </main>
  );

  // ──────────────── SAVED STEP ────────────────
  if (step === 'saved') return (
    <main className="page">
      <div className="container" style={{ textAlign: 'center', paddingTop: '40px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--brown)', marginBottom: '12px' }}>練習已保存！</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          紀錄 ID：<code style={{ background: 'var(--parchment)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>{savedId}</code>
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/records">
            <button className="btn-secondary">📚 查看所有紀錄</button>
          </a>
          <button className="btn-primary" onClick={startOver}>🎙 再練習一題</button>
        </div>
      </div>
    </main>
  );

  return null;
}
