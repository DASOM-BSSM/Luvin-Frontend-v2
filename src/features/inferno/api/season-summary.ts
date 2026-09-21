import { getInfernoConversation } from '@/src/features/inferno/api/conversation';
import type { InfernoHighlight, InfernoSeasonSummary } from '@/src/features/inferno/types';
import { pickEpisodeHighlight } from '@/src/features/inferno/utils/highlights';

/**
 * ep5(시즌 마무리) 데이터 출입구. conversation.ts 와 같은 이유로 지금은 상수를 그대로
 * 돌려주지만, 서버가 생기면 이 파일만 바꾸면 된다(§11).
 *
 * [DRAFT] Figma 디자인이 아직 없는 상태에서 먼저 짠 값이다. 실제 데이터 연동이 필요한
 * 지점은 아래 TODO 로 표시해 뒀다.
 */

/** ep1~4 회차 순서. 시즌이 끝나야 ep5 에 들어오므로 넷 다 있다고 본다. */
const PAST_EPISODE_ORDERS = [1, 2, 3, 4];

/**
 * 지난 회차 하나의 하이라이트. 그 회차 대화에서 실제로 하이라이트 줄에 등장한 상대 반죽과,
 * 결정적인 대화 줄(pickEpisodeHighlight)을 그대로 가져온다 — 문구를 새로 짓지 않는다.
 */
function buildHighlight(order: number): InfernoHighlight | undefined {
  const conversation = getInfernoConversation(order);
  if (!conversation) {
    return undefined;
  }

  const { lines, featuredParticipant } = pickEpisodeHighlight(conversation);
  const partner = featuredParticipant ?? conversation.participants.find((participant) => !participant.isMine);
  if (!partner) {
    return undefined;
  }

  return {
    episodeOrder: order,
    type: partner.type,
    state: 'baked',
    lines,
    // personalChatPages 가 있는 회차(ep2/ep4)만 매칭 뒤 1:1 대화가 있다.
    isPersonalChat: conversation.personalChatPages !== undefined,
  };
}

const EP5_SEASON_SUMMARY: InfernoSeasonSummary = {
  episodeOrder: 5,
  finalMatch: {
    profile: {
      type: 'donut',
      name: '차가운 도넛 반죽',
      attachmentLabel: '안정형',
    },
    summaryLine: '이 시즌, 당신의 분신은 안정형 성향과 이어졌어요',
  },
  // TODO: 실제 데이터 연동 — 성향별 호감도/반응 지표는 대화·투표 기록에서 집계해야 한다.
  behaviorMetrics: [
    { label: '다정함', value: 72 },
    { label: '솔직함', value: 58 },
    { label: '적극성', value: 45 },
  ],
  // TODO: 실제 데이터 연동 — 다시 굽기 사용 여부/선택은 InfernoRebake 진행 기록에서 가져와야 한다.
  rebakeUsage: {
    used: true,
    summaryLine: '다시굽기를 사용해 카스테라 반죽과 새로 이어졌어요',
  },
  // TODO: 실제 데이터 연동 — 공감 표시·AI 피드백 횟수를 쌓아 둘 곳이 아직 없다.
  engagement: {
    empathyCount: 12,
    aiFeedbackCount: 4,
  },
  insightLine: '당신은 갈등이 생기면 먼저 다가가서 풀려는 사람이에요',
  highlights: PAST_EPISODE_ORDERS.map(buildHighlight).filter((highlight) => highlight !== undefined),
};

/** ep5 하나뿐이라 다른 order 는 없다는 뜻으로 undefined. conversation.ts 의 CONVERSATIONS 와 같은 모양. */
const SEASON_SUMMARIES: Record<number, InfernoSeasonSummary | undefined> = {
  5: EP5_SEASON_SUMMARY,
};

export function getInfernoSeasonSummary(order: number): InfernoSeasonSummary | undefined {
  return SEASON_SUMMARIES[order];
}
