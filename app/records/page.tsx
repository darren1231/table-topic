'use client';
import { useState, useEffect } from 'react';
import { PracticeRecord, getAllRecords, deleteRecord, clearAllRecords } from '@/lib/db';
import { exportRecordsAsZip, importRecordsFromZip } from '@/lib/exportImport';
import StarRating from '@/components/StarRating';
import { CATEGORY_LABELS } from '@/lib/fallbackQuestions';

export default function RecordsPage() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [confirmClear, setConfirmClear] = useState(false);
  const [importing, setImporting] = useState(false);

  async function load() {
    setLoading(true);
    const r = await getAllRecords();
    setRecords(r);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function showMsg(text: string, type: 'success' | 'error' = 'success') {
    setMsg(text);
    setMsgType(type);
    setTimeout(() => setMsg(''), 3000);
  }

  async function handleDelete(id: string) {
    if (!confirm('確定要刪除這筆練習紀錄嗎？')) return;
    await deleteRecord(id);
    showMsg('已刪除');
    load();
  }

  async function handleExport() {
    if (records.length === 0) { showMsg('沒有資料可以匯出', 'error'); return; }
    await exportRecordsAsZip(records);
    showMsg('匯出成功！');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const count = await importRecordsFromZip(file);
      showMsg(`成功匯入 ${count} 筆紀錄`);
      load();
    } catch (err) {
      showMsg(String(err), 'error');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  }

  async function handleClearAll() {
    await clearAllRecords();
    setConfirmClear(false);
    showMsg('已清除所有資料');
    load();
  }

  const fmtDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }) +
      ' ' + d.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' });
  };

  const fmtDuration = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const avgScore = (r: PracticeRecord) =>
    ((r.selfScore.clarity + r.selfScore.structure + r.selfScore.voice) / 3).toFixed(1);

  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">📚 練習紀錄</h1>
        <p className="page-subtitle">共 {records.length} 筆紀錄</p>

        {msg && (
          <div className={`alert alert-${msgType === 'success' ? 'success' : 'error'}`} style={{ marginBottom: '16px' }}>
            {msg}
          </div>
        )}

        {/* Data management */}
        <div className="card" style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>資料管理</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginLeft: 'auto' }}>
            <button className="btn-secondary" onClick={handleExport} style={{ fontSize: '0.875rem' }}>
              ⬇ 匯出 ZIP 備份
            </button>
            <label style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
              background: 'var(--parchment)', border: '1.5px solid var(--border)',
              fontSize: '0.875rem', color: 'var(--brown)', fontWeight: 500,
            }}>
              {importing ? '匯入中…' : '⬆ 匯入 ZIP'}
              <input type="file" accept=".zip" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            {!confirmClear ? (
              <button className="btn-danger" onClick={() => setConfirmClear(true)} style={{ fontSize: '0.875rem' }}>
                🗑 清除全部
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--red)' }}>確定清除？</span>
                <button className="btn-danger" onClick={handleClearAll}>確定</button>
                <button className="btn-ghost" onClick={() => setConfirmClear(false)}>取消</button>
              </div>
            )}
          </div>
        </div>

        <div className="alert alert-warning" style={{ marginBottom: '24px' }}>
          💾 錄音預設只保存在目前裝置與瀏覽器。清除瀏覽器資料或更換裝置，紀錄可能會消失。重要資料請匯出備份。
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <span className="spinner" />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎙</div>
            <p>還沒有練習紀錄</p>
            <a href="/practice">
              <button className="btn-primary" style={{ marginTop: '16px' }}>開始第一次練習 →</button>
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {records.map((r) => (
              <div key={r.id} className="card" style={{ padding: '20px' }}>
                {/* Header row */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer' }}
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                      <span className="badge badge-gold">{r.theme}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmtDate(r.createdAt)}</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem', marginBottom: '4px' }}>
                      {r.question}
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⏱ {fmtDuration(r.durationSeconds)}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>⭐ 平均 {avgScore(r)}</span>
                      {r.category && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{CATEGORY_LABELS[r.category] || r.category}</span>}
                    </div>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem', flexShrink: 0 }}>
                    {expandedId === r.id ? '▲' : '▼'}
                  </span>
                </div>

                {/* Expanded detail */}
                {expandedId === r.id && (
                  <div style={{ marginTop: '16px', borderTop: '1.5px solid var(--border-soft)', paddingTop: '16px' }}>
                    {r.audioBlob && (() => {
                      const url = URL.createObjectURL(r.audioBlob);
                      return <audio controls src={url} style={{ width: '100%', marginBottom: '16px', borderRadius: '8px' }} />;
                    })()}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                      {(['clarity', 'structure', 'voice'] as const).map((k) => {
                        const labels = { clarity: '清楚度', structure: '結構', voice: '聲音' };
                        return (
                          <div key={k} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{labels[k]}</p>
                            <StarRating value={r.selfScore[k]} readOnly size="1.1rem" />
                          </div>
                        );
                      })}
                    </div>

                    {r.note && (
                      <div style={{ background: 'var(--parchment)', borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: '12px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>筆記</p>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{r.note}</p>
                      </div>
                    )}

                    <button className="btn-danger" onClick={() => handleDelete(r.id)}>🗑 刪除此筆紀錄</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
