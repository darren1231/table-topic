'use client';
import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    const k = localStorage.getItem('openai_api_key') || '';
    setApiKey(k);
    setHasKey(!!k);
  }, []);

  function handleSave() {
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey.trim());
      setHasKey(true);
    } else {
      localStorage.removeItem('openai_api_key');
      setHasKey(false);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleDelete() {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setHasKey(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className="page">
      <div className="container">
        <h1 className="page-title">⚙️ 設定</h1>
        <p className="page-subtitle">管理你的 API Key 與偏好設定</p>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            🔑 OpenAI API Key
          </h2>

          <div className="alert alert-info" style={{ marginBottom: '20px' }}>
            <strong>隱私說明：</strong>你的 API Key 預設只儲存在目前瀏覽器本機（localStorage），不會被上傳到我們的伺服器。請不要在公共電腦上使用。你可以隨時刪除。
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">API Key</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ paddingRight: '80px' }}
              />
              <button
                className="btn-ghost"
                style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', padding: '4px 10px' }}
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? '隱藏' : '顯示'}
              </button>
            </div>
          </div>

          {hasKey && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              ✅ 已儲存 API Key
            </div>
          )}

          {saved && (
            <div className="alert alert-success" style={{ marginBottom: '16px' }}>
              已更新！
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleSave}>
              💾 儲存 API Key
            </button>
            {hasKey && (
              <button className="btn-danger" onClick={handleDelete}>
                🗑 刪除 API Key
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '16px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            💡 AI 題目說明
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>1️⃣</span>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>使用者自己的 API Key（優先）</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>在此頁面填入你的 OpenAI API Key，系統優先使用它產生題目。費用從你的帳號扣除。</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>2️⃣</span>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>伺服器端 API Key（次選）</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>管理員可在 Vercel 設定 OPENAI_API_KEY 環境變數，供所有使用者共用。</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.5rem' }}>3️⃣</span>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>內建示範題目（保底）</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>沒有任何 API Key 時，系統自動使用內建示範題目，網站仍可正常使用。</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.1rem', color: 'var(--brown)', marginBottom: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
            ℹ️ 關於 Theme Voice Practice
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            這是一個給 Toastmasters 會員使用的 AI 主題式口說練習工具。<br />
            你的所有錄音和練習紀錄都只存在你自己的瀏覽器本機，不會上傳到任何伺服器。<br />
            建議定期匯出備份，以防資料遺失。
          </p>
        </div>
      </div>
    </main>
  );
}
