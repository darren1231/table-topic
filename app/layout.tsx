import type { Metadata } from 'next';
import '@/styles/globals.css';
import Nav from '@/components/Nav';

export const metadata: Metadata = {
  title: 'Theme Voice Practice · 主題聲音練習室',
  description: '輸入例會主題，AI 產生即興演講題目，會員用語音回答並保存練習紀錄，藉此追蹤自己的表達成長。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
