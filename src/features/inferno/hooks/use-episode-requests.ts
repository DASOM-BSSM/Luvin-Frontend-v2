/**
 * [DRAFT] 회차 화면의 선택·완료 요청과 그 오류 처리(보정 문서 4·5장, 사용자 제안 9번).
 *
 * - `CONTENT_NOT_READY`: 본문을 다시 받아(생성 대기로 돌아감) 준비되면 같은 요청을 한 번만 다시 보낸다.
 * - `CHOICE_REQUIRED`(완료): 선택 블록으로 돌아간다.
 * - `PREVIOUS_EPISODE_NOT_COMPLETED`(완료): 이전 회차 시작 화면으로 보낸다.
 * - `CHOICE_ALREADY_MADE`(선택): use-episode-choice 가 이미 한 결과로 진행한다.
 */
import { router } from 'expo-router';

import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import useCompleteEpisode from '@/src/features/inferno/hooks/use-complete-episode';
import useEpisodeChoice from '@/src/features/inferno/hooks/use-episode-choice';
import type { ChoicePoint } from '@/src/features/inferno/types/story';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

interface EpisodeRequestsOptions {
  order: number;
  onChosen: () => void;
  onCompleted: () => void;
  onChoiceRequired: () => void;
  /** 본문을 다시 받는다. 생성 대기 중이면 준비될 때까지 기다린다. */
  reloadContent: () => Promise<unknown>;
}

export default function useEpisodeRequests({
  order,
  onChosen,
  onCompleted,
  onChoiceRequired,
  reloadContent,
}: EpisodeRequestsOptions) {
  const choice = useEpisodeChoice(order, onChosen);
  const completion = useCompleteEpisode(order);

  function submitChoice(
    choiceBlockId: string,
    pointId: ChoicePoint,
    breadId: string | null,
    retried = false,
  ) {
    choice.mutate(
      { choiceBlockId, pointId, breadId },
      {
        onError: (error) => {
          if (!retried && getStoryErrorCode(error) === 'CONTENT_NOT_READY')
            void reloadContent().then(() => submitChoice(choiceBlockId, pointId, breadId, true));
        },
      },
    );
  }

  function submitCompletion(retried = false) {
    completion.mutate(undefined, {
      onSuccess: onCompleted,
      onError: (error) => {
        const code = getStoryErrorCode(error);
        if (code === 'CHOICE_REQUIRED') onChoiceRequired();
        else if (code === 'PREVIOUS_EPISODE_NOT_COMPLETED')
          router.replace(infernoIntroHref(Math.max(1, order - 1)));
        else if (code === 'CONTENT_NOT_READY' && !retried)
          void reloadContent().then(() => submitCompletion(true));
      },
    });
  }

  return { choice, completion, submitChoice, submitCompletion };
}
