/**
 * [DRAFT] 회차 본문을 받기 전 단계: 회차 열기(토큰)와 생성 대기.
 *
 * - 4화 이상을 아직 열지 않았으면 본문을 요청하지 않고 회차 열기 화면부터 보여준다(계약 v3 순서:
 *   이전 회차 완료 → 회차 열기 → content). 409 `EPISODE_NOT_UNLOCKED` 가 와도 같은 화면이다.
 * - 생성 대기(`status: generating`) 중에는 빵 줄넘기 연출을 띄운다. 생성이 끝나도 퇴장 애니메이션을
 *   마칠 때까지 남겨 둔다. 60초를 넘기면 연출을 내리고 "다시 시도" 화면을 보여준다.
 */
import useEpisodeContent from '@/src/features/inferno/hooks/use-episode-content';
import useGenerationLoader from '@/src/features/inferno/hooks/use-generation-loader';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import { episodeAccess } from '@/src/features/inferno/utils/episode-unlock';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

export default function useEpisodeSource(order: number) {
  const story = useStoryState();
  const locked = story.data !== undefined && episodeAccess(order, story.data) === 'locked';
  const content = useEpisodeContent(order, story.data !== undefined && !locked);
  const loader = useGenerationLoader(content.isGenerating);

  function handleUnlocked() {
    // 409 로 막혔던 본문은 다시 요청한다. 처음부터 잠겨 있었으면 열리는 순간 알아서 요청된다.
    if (content.error) void content.retry();
  }

  return {
    story,
    content,
    showUnlock: locked || getStoryErrorCode(content.error) === 'EPISODE_NOT_UNLOCKED',
    showLoader: loader.isShowing && !content.error,
    tokenCost: story.data?.episodeTokenCost ?? null,
    handleUnlocked,
    handleLoaderExitComplete: loader.handleExitComplete,
  };
}
