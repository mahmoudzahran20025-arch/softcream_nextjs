/**
 * Health Insights Library
 * 
 * Curated library of health insights displayed in the cart based on
 * product health keywords and health score.
 */

import { type HealthKeyword } from './keywords';

export interface HealthInsightMessage {
  title: string;
  emoji: string;
  lines: string[]; // Max 3 lines
}

export interface HealthInsight {
  id: string;
  keywords: HealthKeyword[];
  scoreRange: [number, number]; // [min, max]
  message: HealthInsightMessage;
}

/**
 * Health Insights Library
 * 
 * 5 categories:
 * - high_protein: For protein-rich choices (score 60-100)
 * - low_sugar: For low-sugar choices (score 70-100)
 * - balanced: For balanced choices (score 50-70)
 * - indulgent: For indulgent choices (score 30-50)
 * - fallback: Default when no match (score 0-100)
 */
export const HEALTH_INSIGHTS: HealthInsight[] = [
  {
    id: 'high_protein',
    keywords: ['high-protein'],
    scoreRange: [60, 100],
    message: {
      title: 'قوة البروتين',
      emoji: '💪',
      lines: [
        'اختياراتك غنية بالبروتين - وقود ممتاز للعضلات!',
        'البروتين يساعد في الشعور بالشبع لفترة أطول.',
        'طعم لذيذ + فوائد صحية = الفوز المزدوج! 🏆'
      ]
    }
  },
  {
    id: 'low_sugar',
    keywords: ['low-sugar'],
    scoreRange: [70, 100],
    message: {
      title: 'اختيار واعي',
      emoji: '🌱',
      lines: [
        'رائع! اختياراتك منخفضة السكر تدعم طاقة متوازنة.',
        'أنت تثبت أن الطعم اللذيذ لا يحتاج لكميات كبيرة من السكر!',
        'استمر في هذا النهج الصحي! 💚'
      ]
    }
  },
  {
    id: 'balanced',
    keywords: ['balanced', 'calcium', 'fiber-rich'],
    scoreRange: [50, 70],
    message: {
      title: 'توازن مثالي',
      emoji: '⚖️',
      lines: [
        'اختياراتك تعكس توازناً جيداً بين المتعة والصحة!',
        'الاعتدال هو مفتاح نمط حياة صحي ومستدام.',
        'استمتع بكل لقمة بدون شعور بالذنب! 😊'
      ]
    }
  },
  {
    id: 'indulgent',
    keywords: ['indulgent', 'energy-boost'],
    scoreRange: [30, 50],
    message: {
      title: 'لحظة استمتاع',
      emoji: '🎉',
      lines: [
        'الحياة قصيرة لتفوت الحلويات اللذيذة!',
        'الاستمتاع من وقت لآخر جزء من نمط حياة متوازن.',
        'استمتع الآن، وازن لاحقاً! ✨'
      ]
    }
  },
  {
    id: 'fallback',
    keywords: [],
    scoreRange: [0, 100],
    message: {
      title: 'استمتع بالطعم',
      emoji: '🍦',
      lines: [
        'كل منتج في سلتك مصنوع بحب واهتمام بالجودة.',
        'التوازن على المدى الطويل أهم من الكمال في كل وجبة.',
        'استمتع بكل لحظة! 💚'
      ]
    }
  }
];

/**
 * Get insight by ID
 */
export function getInsightById(id: string): HealthInsight | undefined {
  return HEALTH_INSIGHTS.find(insight => insight.id === id);
}

/**
 * Get fallback insight
 */
export function getFallbackInsight(): HealthInsight {
  return HEALTH_INSIGHTS.find(insight => insight.id === 'fallback')!;
}

/**
 * Get all insight IDs
 */
export function getInsightIds(): string[] {
  return HEALTH_INSIGHTS.map(insight => insight.id);
}
