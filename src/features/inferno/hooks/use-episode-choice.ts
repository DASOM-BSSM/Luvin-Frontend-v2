/**
 * [DRAFT] 3·5·6·8화 선택. 응답 블록은 회차 본문 캐시의 선택 블록 바로 뒤에 끼우고,
 * 응답 시즌으로 `GET /me` 캐시를 갈아끼운다(보정 문서 4장).
 *
 * 409 `CHOICE_ALREADY_MADE` 는 이미 한 선택의 결과로 진행한다 — 서버 본문에 그 결과가 들어
 * 있으므로 본문과 시즌을 다시 받는다. 같은 선택을 다시 보내면 같은 결과가 와서 네트워크
 * 재시도는 같은 body 로 해도 된다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { submitEpisodeChoice } from '@/src/features/inferno/api/story';
import { aiSeasonKeys, storyKeys } from '@/src/features/inferno/api/query-keys';
import type { AiSeasonStatusView } from '@/src/features/inferno/api/ai-season-types';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import type { ChoicePoint, EpisodeContent } from '@/src/features/inferno/types/story';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';
import { insertChoiceBlocks } from '@/src/features/inferno/utils/story-playlist';

interface ChoiceInput {
  choiceBlockId: string;
  pointId: ChoicePoint;
  breadId: string | null;
}

export default function useEpisodeChoice(order: number, onChosen: () => void) {
  const client = useQueryClient();
  const myBreadType = useBreadStore((state) => state.profile?.type);

  return useMutation({
    mutationFn: ({ pointId, breadId }: ChoiceInput) =>
      submitEpisodeChoice(order, pointId, breadId, { myBreadType }),
    onSuccess: (result, { choiceBlockId }) => {
      client.setQueryData<EpisodeContent>(storyKeys.content(order), (content) =>
        content
          ? { ...content, blocks: insertChoiceBlocks(content.blocks, choiceBlockId, result.blocks) }
          : content,
      );
      client.setQueryData<AiSeasonStatusView>(aiSeasonKeys.status, (season) =>
        season ? { ...season, story: result.seasonView } : season,
      );
      onChosen();
    },
    onError: async (error) => {
      if (getStoryErrorCode(error) !== 'CHOICE_ALREADY_MADE') return;
      await Promise.all([
        client.refetchQueries({ queryKey: storyKeys.content(order) }),
        client.refetchQueries({ queryKey: aiSeasonKeys.status }),
      ]);
      onChosen();
    },
  });
}
