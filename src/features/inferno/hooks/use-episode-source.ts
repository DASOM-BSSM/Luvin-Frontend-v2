/**
 * [DRAFT] 회차 본문을 받기 전 단계: 회차 열기(토큰)와 생성 대기.
 *
 * - 4화 이상을 아직 열지 않았으면 본문을 요청하지 않고 회차 열기 화면부터 보여준다(계약 v3 순서:
 *   이전 회차 완료 → 회차 열기 → content). 409 `EPISODE_NOT_UNLOCKED` 가 와도 같은 화면이다.
 * - 생성 대기(`status: generating`) 중에는 빵 줄넘기 연출을 띄운다. 생성이 끝나도 퇴장 애니메이션을
 *   마칠 때까지 남겨 둔다. 4분을 넘기면 연출을 내리고 "다시 시도" 화면을 보여준다.
 * - 생성 중이어도 재생할 블록이 하나라도 오면 연출을 내리고 바로 재생한다(블록 단위 반환). 뒤 블록은
 *   재생하는 동안 이어서 받는다.
 */
import useEpisodeContent from '@/src/features/inferno/hooks/use-episode-content';
import useGenerationLoader from '@/src/features/inferno/hooks/use-generation-loader';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import { isPreviousCompleting } from '@/src/features/inferno/utils/completion';
import { episodeAccess } from '@/src/features/inferno/utils/episode-unlock';
import { playableBlocks } from '@/src/features/inferno/utils/story-playlist';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

export default function useEpisodeSource(order: number) {
  const story = useStoryState();
  // 바로 앞 회차를 서버가 아직 정리 중이면(완료를 기다리지 않고 나왔을 때) 열기·본문 요청을 미루고 생성
  // 대기 화면을 보여준다. 정리가 끝나면 use-completion-watcher 가 시즌을 갱신해서 여기가 풀린다.
  const waitingPrevious = isPreviousCompleting(order, story.data);
  const locked = story.data !== undefined && episodeAccess(order, story.data) === 'locked';
  const content = useEpisodeContent(order, story.data !== undefined && !locked && !waitingPrevious);
  const hasPlayable = playableBlocks(content.data?.blocks ?? []).length > 0;
  /** 줄넘기 연출이 돌아야 하는 동안. 꺼지면 퇴장 애니메이션을 마치고 본문으로 넘어간다. */
  const loaderActive = (content.isGenerating && !hasPlayable) || waitingPrevious;
  const loader = useGenerationLoader(loaderActive);

  function handleUnlocked() {
    // 409 로 막혔던 본문은 다시 요청한다. 처음부터 잠겨 있었으면 열리는 순간 알아서 요청된다.
    if (content.error) void content.retry();
  }

  return {
    story,
    content,
    showUnlock:
      !waitingPrevious && (locked || getStoryErrorCode(content.error) === 'EPISODE_NOT_UNLOCKED'),
    showLoader: loader.isShowing && !content.error,
    loaderActive,
    tokenCost: story.data?.episodeTokenCost ?? null,
    handleUnlocked,
    handleLoaderExitComplete: loader.handleExitComplete,
  };
}
