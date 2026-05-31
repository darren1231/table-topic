export interface Question {
  category: string;
  question: string;
  suggestedStructure: string;
}

export const CATEGORY_LABELS: Record<string, string> = {
  '經驗分享題': '📖 Experience',
  '觀點表達題': '💡 Opinion',
  '想像創意題': '🌈 Imagination',
  '價值觀題': '⭐ Values',
  '輕鬆破冰題': '😊 Icebreaker',
};

export function getFallbackQuestions(theme: string, count: number = 10): Question[] {
  const base: Question[] = [
    {
      category: '經驗分享題',
      question: `What is one memorable experience related to "${theme}" that changed your perspective?`,
      suggestedStructure: 'Situation → Action → Result → Lesson',
    },
    {
      category: '經驗分享題',
      question: `Can you share a time when "${theme}" played an important role in your life?`,
      suggestedStructure: 'Past → Present → Future',
    },
    {
      category: '觀點表達題',
      question: `In your opinion, why is "${theme}" important in today's world?`,
      suggestedStructure: 'Point → Reason → Example → Point',
    },
    {
      category: '觀點表達題',
      question: `How do you think "${theme}" will evolve in the next ten years?`,
      suggestedStructure: 'Current state → Trend → Prediction → Impact',
    },
    {
      category: '想像創意題',
      question: `If you could design the perfect experience around "${theme}", what would it look like?`,
      suggestedStructure: 'Vision → Key Elements → Why it matters',
    },
    {
      category: '想像創意題',
      question: `If "${theme}" were a person, what kind of personality would they have and why?`,
      suggestedStructure: 'Description → Traits → Story',
    },
    {
      category: '價值觀題',
      question: `What values do you think are most important when it comes to "${theme}"?`,
      suggestedStructure: 'Value → Personal experience → Universal meaning',
    },
    {
      category: '價值觀題',
      question: `What does "${theme}" mean to you personally, and how has that meaning changed over time?`,
      suggestedStructure: 'Past belief → Turning point → Current view',
    },
    {
      category: '輕鬆破冰題',
      question: `If you had to describe "${theme}" using only three words, what would they be?`,
      suggestedStructure: 'Word 1 → Word 2 → Word 3 → Brief explanation',
    },
    {
      category: '輕鬆破冰題',
      question: `What is the first thing that comes to mind when you hear "${theme}"?`,
      suggestedStructure: 'Immediate reaction → Why → Story or example',
    },
  ];

  return base.slice(0, Math.min(count, base.length));
}
