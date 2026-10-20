import type { AiEpisodeMessagesView, AiRerollView } from '@/src/features/inferno/api/ai-season-types';
import { isEpisodeFullyGenerated } from '@/src/features/inferno/utils/map-ai-episode';

/**
 * 다시 굽기 작업의 `jobStatus` 중 실제로 확인된 값은 `'FAILED'` 뿐이다(생성 작업과 같다,
 * use-ai-episode-messages 주석 참고). 성공 값은 모르기 때문에 성공은 상태 문자열이 아니라
 * 회차 대화의 versionId 가 바뀌었는지로 판단한다(isRerolledEpisodeReady).
 */
export const FAILED_REROLL_STATUS = 'FAILED';

/**
 * 이 회차에서 다시 굽기를 이미 썼는지. 작업 기록이 있고 실패가 아니면 쓴 것으로 본다 —
 * 실패한 작업은 기회를 쓴 게 아니라서 다시 누를 수 있게 둔다.
 */
export function isRerollUsed(status: AiRerollView | null | undefined): boolean {
  return status != null && status.jobStatus !== FAILED_REROLL_STATUS;
}

/**
 * 다시 굽기 뒤의 새 대화가 다 도착했는지. 서버는 다시 굽기가 끝나면 회차 대화를 새 버전으로
 * 바꿔 두므로(use-inferno-conversation 주석), 요청 전 버전(`baseVersionId`)과 다르고 1:1 대화까지
 * 다 만들어졌으면 도착한 것이다.
 */
export function isRerolledEpisodeReady(
  episode: AiEpisodeMessagesView | null,
  baseVersionId: string,
): boolean {
  return (
    episode != null &&
    episode.versionId !== baseVersionId &&
    isEpisodeFullyGenerated(episode.episodeNumber, episode.messages)
  );
}
