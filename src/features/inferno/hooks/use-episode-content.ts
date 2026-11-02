/**
 * [DRAFT] 회차 본문. `status: 'generating'` 이면 2초마다 다시 요청하고, 4분을 넘기면
 * EpisodeGenerationTimeoutError 로 멈춰서 "다시 시도" 버튼을 띄운다(보정 문서 3장).
 * 생성 중에도 확정된 블록이 먼저 온다(블록 단위 반환). 새 블록이 붙으면 생성이 나아가는 중이라
 * 4분은 마지막으로 블록이 늘어난 때부터 다시 센다.
 * `failed` 도 오류로 바꿔서 같은 버튼을 쓴다 — 다시 요청하면 서버가 다시 만든다.
 */
import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';

import { getEpisodeContent, isStoryMock, syncMockAge } from '@/src/features/inferno/api/story';
import { storyKeys } from '@/src/features/inferno/api/query-keys';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import { EpisodeGenerationTimeoutError } from '@/src/features/inferno/utils/story-error';
import { toKnownAge } from '@/src/features/my-page/utils/age';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

const POLL_INTERVAL_MS = 2000;
/**
 * 생성 대기 상한. 처음엔 60초였는데, AI 가 문장을 다시 다듬는 단계(`progress.regenerating`)까지 거치면
 * 1분을 넘겨도 정상이라 서버는 계속 생성 중인데 앱이 먼저 타임아웃을 띄웠다(실서버 로그, 5화). 서버 안내대로
 * 오래 걸려도 같은 요청을 이어 보내면 되므로 기다린다. AI 는 재시도까지 최대 165초, 백엔드 작업 점유(worker
 * lease)는 210초라(AI·백엔드 스테이징 배포 01d73fe) 서버가 포기하기 전에 앱이 먼저 끊지 않도록 240초로 둔다.
 */
const POLL_LIMIT_MS = 240000;

export class EpisodeGenerationFailedError extends Error {
  constructor() {
    super('Episode generation failed');
    this.name = 'EpisodeGenerationFailedError';
  }
}

export default function useEpisodeContent(order: number, enabled = true) {
  const myBreadType = useBreadStore((state) => state.profile?.type);
  const myBreadName = useBreadStore((state) => state.profile?.name);
  const myProfile = useMyProfile();
  const profileAge = toKnownAge(myProfile.data?.age);
  // 목 모드는 내 프로필 나이를 목 서버에 넘겨야 해서(syncMockAge) 프로필을 받은 뒤에 요청한다. 먼저 요청하면
  // 나이가 있어도 목 서버가 AGE_REQUIRED 로 막았다. 실제 서버는 서버가 나이를 알아서 기다리지 않는다.
  const profileReady = !isStoryMock || myProfile.isFetched;
  /** 생성 대기를 처음 본 시각. 다시 시도하면 비운다. */
  const waitingSince = useRef<number | null>(null);
  /** 마지막으로 받은 블록 수. 늘어나면 대기 시작 시각을 다시 잡는다. */
  const receivedBlocks = useRef(0);

  const query = useQuery({
    queryKey: storyKeys.content(order),
    enabled: enabled && profileReady,
    // 생성 대기·실패는 아래에서 직접 다룬다. 같은 실패를 자동으로 또 부르지 않는다.
    retry: false,
    queryFn: async () => {
      syncMockAge(profileAge);
      const content = await getEpisodeContent(order, { myBreadType, myBreadName });
      // 실패·대기 초과로 끝나면 대기 시작 시각을 비운다. 안 비우면 다음 생성이 예전 시각부터 세어져 시작하자마자
      // 타임아웃이 났다(실서버 로그, 5화 09:08·11:47).
      if (content.status === 'failed') {
        waitingSince.current = null;
        throw new EpisodeGenerationFailedError();
      }
      if (content.status === 'generating') {
        if (content.blocks.length > receivedBlocks.current) waitingSince.current = Date.now();
        receivedBlocks.current = content.blocks.length;
        waitingSince.current ??= Date.now();
        if (Date.now() - waitingSince.current > POLL_LIMIT_MS) {
          waitingSince.current = null;
          throw new EpisodeGenerationTimeoutError();
        }
      } else {
        waitingSince.current = null;
      }
      return content;
    },
    // 실패(대기 상한 초과 포함)하면 멈춘다. 오류가 나도 이전 데이터(`generating`)가 남아 있어서 상태도 같이 봐야
    // 한다 — 안 보면 타임아웃 뒤에도 2초마다 계속 요청했다(실서버 로그로 확인). 다시 시도(retry)가 다시 연다.
    refetchInterval: (current) =>
      current.state.status !== 'error' && current.state.data?.status === 'generating'
        ? POLL_INTERVAL_MS
        : false,
  });

  function retry() {
    waitingSince.current = null;
    return query.refetch();
  }

  return { ...query, isGenerating: query.data?.status === 'generating', retry };
}
