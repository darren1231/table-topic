import { NextRequest, NextResponse } from 'next/server';
import { getFallbackQuestions } from '@/lib/fallbackQuestions';

export async function POST(req: NextRequest) {
  const { theme, language, level, count, userApiKey } = await req.json();

  const apiKey = userApiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      questions: getFallbackQuestions(theme, count),
      source: 'fallback',
    });
  }

  const langMap: Record<string, string> = {
    zh: '繁體中文',
    en: 'English',
    bilingual: '中英雙語（每題先中文再英文）',
  };
  const levelMap: Record<string, string> = {
    beginner: '新手（問題簡單，適合第一次練習）',
    normal: '一般（適合有一點演講經驗的會員）',
    challenge: '挑戰（需要深度思考與清晰論點）',
  };

  const prompt = `你是 Toastmasters Table Topics Master。
請根據以下例會主題產生適合即興演講的問題。

主題：${theme}
語言：${langMap[language] || language}
難度：${levelMap[level] || level}
題目數量：${count}
回答時間：1 分鐘

請把問題分成：
1. 經驗分享題
2. 觀點表達題
3. 想像創意題
4. 價值觀題
5. 輕鬆破冰題

要求：
- 問題要友善、清楚、適合公開場合
- 適合 Toastmasters 會員練習口說
- 避免過度隱私、成人內容、政治攻擊、宗教爭議、歧視或冒犯
- 請輸出 JSON array，每個項目包含：category、question、suggestedStructure
- suggestedStructure 給簡單回答架構，例如：Point → Reason → Example → Point

只輸出 JSON array，不要任何其他說明文字。`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices[0].message.content as string;
    const clean = text.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(clean);

    return NextResponse.json({ questions, source: 'ai' });
  } catch (err) {
    console.error('AI generation failed, using fallback:', err);
    return NextResponse.json({
      questions: getFallbackQuestions(theme, count),
      source: 'fallback',
      error: String(err),
    });
  }
}
