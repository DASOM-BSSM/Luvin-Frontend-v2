import { type QueryClient, useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

import { useAuthStore } from '@/src/features/auth/store/auth-store';
import { getRerollStatus, requestReroll } from '@/src/features/inferno/api/ai-season';
import type { AiRerollView } from '@/src/features/inferno/api/ai-season-types';
import { aiSeasonKeys } from '@/src/features/inferno/api/query-keys';
import { REBAKE_EPISODES } from '@/src/features/inferno/constants/rebake';
import { fetchEpisodeMessagesOrNull } from '@/src/features/inferno/hooks/use-ai-episode-messages';
import useGenerationTimeout from '@/src/features/inferno/hooks/use-generation-timeout';
import useViewedSeason from '@/src/features/inferno/hooks/use-viewed-season';
import {
  FAILED_REROLL_STATUS,
  isRerollUsed,
  isRerolledEpisodeReady,
} from '@/src/features/inferno/utils/rebake';

/** 새 대화가 다 만들어졌는지 다시 확인하는 간격. 회차 생성 폴링과 같다. */
const REROLL_POLL_MS = 3000;

/** 지금 보내 둔 다시 굽기 요청. `attempt` 는 "다시 시도" 때마다 폴링을 처음부터 하려고 센다. */
interface RebakeRequest {
  partnerId: string;
  baseVersionId: string;
  attempt: number;
}

type RerollProgress = 'waiting' | 'failed' | 'ready';

/**
 * 다시 굽기를 한 적이 없을 때 서버가 무엇을 주는지는 스펙에 없다. 404/409 로 막거나 data 를
 * 비워 주는 경우를 모두 "기록 없음"(null)으로 받는다 — 그 외 에러는 그대로 던진다.
 */
async function fetchRerollStatusOrNull(episodeNumber: number, seasonId?: string): Promise<AiRerollView | null> {
  try {
    return await getRerollStatus(episodeNumber, seasonId);
  } catch (error) {
    if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 409)) {
      return null;
    }

    throw error;
  }
}

/**
 * 작업이 실패했는지 보고, 아니면 회차 대화를 다시 받아 새 버전이 다 왔는지 본다. 다 왔으면
 * 화면이 보는 회차 캐시를 새 버전으로 통째로 바꾼다 — 서버가 회차를 새 버전으로 바꿔치기해서
 * 기존 메시지는 버려야 한다(use-inferno-conversation 주석). 반쯤 만들어진 대화는 캐시에 넣지
 * 않으므로 화면이 그 사이에 빈 대화로 깜빡이거나 생성 요청을 다시 보내지 않는다.
 */
async function checkRerollProgress(
  episodeNumber: number,
  baseVersionId: string,
  queryClient: QueryClient,
): Promise<RerollProgress> {
  const status = await fetchRerollStatusOrNull(episodeNumber);
  if (status?.jobStatus === FAILED_REROLL_STATUS) {
    return 'failed';
  }

  const episode = await fetchEpisodeMessagesOrNull(episodeNumber);
  if (!episode || !isRerolledEpisodeReady(episode, baseVersionId)) {
    return 'waiting';
  }

  queryClient.setQueryData(aiSeasonKeys.episode(episodeNumber), episode);
  queryClient.setQueryData(aiSeasonKeys.reroll(episodeNumber), status);
  return 'ready';
}

/**
 * "다시 굽기"(`/api/ai/seasons/episodes/{number}/rerolls`).
 *
 * 흐름: 투표지에서 상대를 고르면 `request` → `POST .../rerolls` → 새 대화가 도착할 때까지
 * `GET .../rerolls`(실패 확인)와 `GET .../episodes/{number}`(versionId 가 바뀌었는지)를 3초마다
 * 본다. 다 오면 `isReady`, 실패하거나 3분이 지나면 `hasFailed` 이고 `retry` 로 다시 보낸다.
 *
 * 들어올 때도 `GET .../rerolls` 를 한 번 읽어서 이미 썼는지(`isUsed`) 안다 — "잠시 나가기" 로
 * 나갔다 들어와도 다시 쓰지 못하게 하고, 그때 보이는 1:1 대화가 다시 굽기로 고른 상대와의
 * 대화라는 표시(흐린 폴더)를 남기기 위해서다.
 *
 * 다시 굽기는 시즌에 한 번이라(constants/rebake), 다른 회차(ep2 면 ep4, ep4 면 ep2)의 기록도 같이
 * 읽는다. 거기서 썼으면 `isUsedElsewhere` — 이 회차 폴더는 회색이 되지만, 이 회차 대화는 다시
 * 굽기로 바뀐 게 아니라서 "선택됨" 모양은 아니다. 서버도 시즌 한 번 제한을 걸 텐데, 그때 어떤
 * 응답이 오는지는 스펙에 없다(아래 NOTE).
 *
 * NOTE: 실제 서버로는 아직 확인하지 못했다(이 체크아웃에 API 주소가 없다). 특히 "기록 없음"
 * 응답 모양과, 서버가 시즌 한 번 제한을 어떻게 알려 주는지는 서버를 붙여 보고 맞출 것.
 *
 * 지난 시즌을 다시 볼 때(use-viewed-season)는 그 시즌 기록만 읽어서 폴더 모양을 맞추고, 요청은 보내지
 * 않는다 — 다시 굽기 요청은 늘 최신 시즌에 들어간다. 화면도 다시 보기에서는 다시 굽기를 열지 않는다.
 */
export default function useInfernoRebake(
  episodeNumber: number,
  /** 지금 화면이 보고 있는 대화 버전. 이게 바뀌어야 새 대화가 도착한 것이다. */
  versionId: string | undefined,
  /** 이 회차에 다시 굽기가 있을 때만 서버에 묻는다. */
  enabled: boolean,
) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [currentRequest, setCurrentRequest] = useState<RebakeRequest | undefined>(undefined);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const { pastSeasonId, isPastSeason } = useViewedSeason();

  const statusQuery = useQuery({
    queryKey: aiSeasonKeys.reroll(episodeNumber, pastSeasonId),
    queryFn: () => fetchRerollStatusOrNull(episodeNumber, pastSeasonId),
    enabled: isAuthenticated && enabled,
  });

  const otherStatusQueries = useQueries({
    queries: REBAKE_EPISODES.filter((order) => order !== episodeNumber).map((order) => ({
      queryKey: aiSeasonKeys.reroll(order, pastSeasonId),
      queryFn: () => fetchRerollStatusOrNull(order, pastSeasonId),
      enabled: isAuthenticated && enabled,
    })),
  });

  const mutation = useMutation({
    mutationFn: (partnerId: string) => requestReroll(episodeNumber, partnerId),
  });
  const isRequestRejected = mutation.isError || mutation.data?.jobStatus === FAILED_REROLL_STATUS;

  const progressQuery = useQuery({
    queryKey: aiSeasonKeys.rerollProgress(
      episodeNumber,
      currentRequest?.baseVersionId ?? '',
      currentRequest?.attempt ?? 0,
    ),
    queryFn: () => checkRerollProgress(episodeNumber, currentRequest!.baseVersionId, queryClient),
    // 요청이 받아들여진 뒤에만 본다. 그 전에 보면 지난번 실패 기록이 남아 있어 곧장 실패로 읽힌다.
    enabled: currentRequest != null && mutation.isSuccess && !isRequestRejected && !hasTimedOut,
    refetchInterval: (query) => (query.state.data === 'waiting' ? REROLL_POLL_MS : false),
  });

  const isReady = progressQuery.data === 'ready';
  const hasFailed =
    currentRequest != null &&
    (isRequestRejected || hasTimedOut || progressQuery.isError || progressQuery.data === 'failed');
  const isWaiting = currentRequest != null && !hasFailed && !isReady;

  useGenerationTimeout(isWaiting, handleTimeout);

  function handleTimeout() {
    setHasTimedOut(true);
  }

  function send(partnerId: string, baseVersionId: string, attempt: number) {
    setHasTimedOut(false);
    setCurrentRequest({ partnerId, baseVersionId, attempt });
    mutation.mutate(partnerId);
  }

  /** 투표지에서 고른 상대로 다시 굽기를 보낸다. */
  function request(partnerId: string) {
    if (!versionId || isPastSeason) {
      return;
    }

    send(partnerId, versionId, 0);
  }

  /** 실패 안내의 "다시 시도". 같은 상대로 다시 보낸다. */
  function retry() {
    if (!currentRequest) {
      return;
    }

    send(currentRequest.partnerId, currentRequest.baseVersionId, currentRequest.attempt + 1);
  }

  return {
    /** 이미 다시 굽기를 썼는지. 들어올 때 서버가 썼다고 했거나, 이번에 다 끝났다. */
    isUsed: isReady || isRerollUsed(statusQuery.data),
    /** 시즌의 다른 회차에서 이미 다시 굽기를 썼는지. */
    isUsedElsewhere: otherStatusQueries.some((query) => isRerollUsed(query.data)),
    /** 썼는지 아직 모르면(이 회차든 다른 회차든 조회 중·조회 실패) 누르지 못하게 둔다. */
    isStatusKnown: statusQuery.isSuccess && otherStatusQueries.every((query) => query.isSuccess),
    isWaiting,
    isReady,
    hasFailed,
    request,
    retry,
  };
}
