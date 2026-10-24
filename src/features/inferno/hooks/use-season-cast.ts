/**
 * [DRAFT] 반죽 소개 모달이 쓰는 시즌 출연진. 전체대화 칩을 누르면 1화와 똑같이 관계·특징이 나오게 한다.
 *
 * 1. 지금 회차 본문에 stageIntro 가 있으면(1화) 그걸 쓰고 시즌 단위로 저장한다.
 * 2. 없으면(2화부터) 저장해 둔 1화 출연진을 쓴다.
 * 3. 이 기기에 저장된 게 없으면(새 기기·재설치) 1화 본문을 받아 와서 채운다. 1화는 이미 본 회차라
 *    새로 만들지 않고 저장된 본문을 읽기만 한다.
 *
 * 특징 문구는 서버 시즌 출연진(`characters[].description`, 백엔드 요청 중)이 오면 그쪽이 먼저다
 * — 그 판단은 utils/dough-profile.ts 가 한다. 여기서는 출연진 목록만 모은다.
 */
import { useEffect } from 'react';

import type { AiCharacterWithDescription } from '@/src/features/inferno/api/story-types';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import useEpisodeContent from '@/src/features/inferno/hooks/use-episode-content';
import { readStageCast, useStageCastStore } from '@/src/features/inferno/store/stage-cast-store';
import type { StageCastMember } from '@/src/features/inferno/types/story';

const FIRST_ORDER = 1;
const NO_CHARACTERS: AiCharacterWithDescription[] = [];

export default function useSeasonCast(
  seasonKey: string,
  order: number,
  currentCast: StageCastMember[] | undefined,
) {
  const cached = useStageCastStore((state) => state.casts[seasonKey]);
  const save = useStageCastStore((state) => state.save);
  const stored = readStageCast(seasonKey, cached);
  const needsFirst = order !== FIRST_ORDER && !currentCast?.length && stored.length === 0;
  const first = useEpisodeContent(FIRST_ORDER, needsFirst);
  const fetchedCast = first.data?.stageIntro?.cast;
  const status = useAiSeasonStatus();

  // 받은 출연진을 시즌 단위로 남겨 둔다. 서버 응답을 기기 저장소로 옮기는 일이라 effect 에서 한다.
  const toSave = currentCast?.length ? currentCast : fetchedCast;
  useEffect(() => {
    if (toSave?.length) save(seasonKey, toSave);
  }, [seasonKey, toSave, save]);

  return {
    stageCast: currentCast?.length ? currentCast : stored.length ? stored : (fetchedCast ?? []),
    characters: (status.data?.characters ?? NO_CHARACTERS) satisfies AiCharacterWithDescription[],
  };
}
