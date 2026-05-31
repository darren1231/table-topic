'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="page">
      <div className="container">
        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '20px 0 48px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎙</div>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--brown)', marginBottom: '12px', fontFamily: 'Lora, serif' }}>
            主題聲音練習室
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', maxWidth: '480px', margin: '0 auto 8px' }}>
            輸入例會主題，AI 產生即興演講題目
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 32px' }}>
            用語音回答並保存練習紀錄，追蹤你的表達成長
          </p>
          <Link href="/practice">
            <button className="btn-primary" style={{ fontSize: '1rem', padding: '14px 36px', borderRadius: '30px' }}>
              開始練習 →
            </button>
          </Link>
        </div>

        {/* Privacy notice */}
        <div className="alert alert-info" style={{ marginBottom: '40px', textAlign: 'center' }}>
          🔒 你的錄音預設只保存在目前瀏覽器本機，不會自動上傳。
        </div>

        {/* Feature cards */}
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <Link href="/practice" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎯</div>
              <h3 style={{ color: 'var(--brown)', marginBottom: '8px', fontSize: '1.1rem' }}>建立主題題庫</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                輸入本週例會主題，AI 即時產生分類即興演講題目
              </p>
            </div>
          </Link>

          <Link href="/practice" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎙</div>
              <h3 style={{ color: 'var(--brown)', marginBottom: '8px', fontSize: '1.1rem' }}>開始語音練習</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                選題、倒數準備、錄音回答，並完成自我評分
              </p>
            </div>
          </Link>

          <Link href="/records" style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
              onMouseOver={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
              onMouseOut={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-sm)')}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📚</div>
              <h3 style={{ color: 'var(--brown)', marginBottom: '8px', fontSize: '1.1rem' }}>查看練習紀錄</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                回聽錄音、查看歷史評分，追蹤表達能力進步
              </p>
            </div>
          </Link>
        </div>

        {/* How it works */}
        <div style={{ marginTop: '56px' }}>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--brown)', marginBottom: '24px', textAlign: 'center' }}>
            如何使用
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { step: '1', title: '輸入例會主題', desc: '例如「Life is a long journey」或「勇氣」，選擇語言與難度' },
              { step: '2', title: 'AI 產生題目', desc: '系統依主題產生 5 種類型、共 10 題即興演講題目' },
              { step: '3', title: '選題錄音', desc: '選一題，準備 15 秒，回答 1 分鐘，完成後可重錄' },
              { step: '4', title: '自我評分', desc: '從清楚度、結構、聲音自然度三個維度為自己評分並記錄心得' },
              { step: '5', title: '追蹤進步', desc: '所有練習紀錄存在瀏覽器本機，可隨時回聽和匯出備份' },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'var(--gold-dim)', color: 'var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '0.875rem', flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>{item.title}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
