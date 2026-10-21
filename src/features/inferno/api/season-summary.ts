import type { InfernoSeasonSummary } from '@/src/features/inferno/types';

/**
 * EP5 개발용 샘플 요약. 실제 EP5 화면은 서버 리포트(use-inferno-season-summary)를 사용하며,
 * 이 값은 다른 회차 번호로 호출될 때만 반환된다. 화면 모양은 Figma `ep5-결과`(6818:5117),
 * `ep5-하이라이트`(5760:4351)에 맞춘 예시다.
 */

const EP5_SEASON_SUMMARY: InfernoSeasonSummary = {
  episodeOrder: 5,
  finalMatch: {
    profile: {
      type: 'donut',
      name: '차가운 도넛 반죽',
    },
    summaryLine: '이 시즌, 당신의 분신은 진짜 인연을 만났어요',
  },
  report: {
    tendency: '사용자는 적극적으로 호감을 표현하지만 갈등 상황에서는 회피하는 경향이 있습니다.',
    feedback: '상대방과 감정을 솔직하게 공유하는 연습이 필요합니다.',
    strengths: ['높은 공감 능력', '적극적인 대화'],
    weaknesses: ['갈등 회피 성향', '과격한 표현'],
  },
  highlights: [
    { episodeOrder: 2, text: '상대방의 연락이 늦어지면서 사용자가 먼저 연락했습니다.' },
    { episodeOrder: 4, text: '사용자가 상대방의 선택과 반대되는 행동을 했습니다.' },
  ],
};

/** ep5 하나뿐이라 다른 order 는 없다는 뜻으로 undefined. conversation.ts 의 CONVERSATIONS 와 같은 모양. */
const SEASON_SUMMARIES: Record<number, InfernoSeasonSummary | undefined> = {
  5: EP5_SEASON_SUMMARY,
};

export function getInfernoSeasonSummary(order: number): InfernoSeasonSummary | undefined {
  return SEASON_SUMMARIES[order];
}
