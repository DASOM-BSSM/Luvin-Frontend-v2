import { useWindowDimensions } from 'react-native';

import { getInfernoConversation } from '@/src/features/inferno/api/conversation';
import { useBreadStore } from '@/src/features/bread/store/bread-store';
import useAiEpisodeMessages from '@/src/features/inferno/hooks/use-ai-episode-messages';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import useViewedSeason from '@/src/features/inferno/hooks/use-viewed-season';
import type { InfernoConversation } from '@/src/features/inferno/types';
import {
  buildCharactersFromMessages,
  isEpisodeFullyGenerated,
  mapAiEpisodeToConversation,
} from '@/src/features/inferno/utils/map-ai-episode';
import { buildChatPageBudgets } from '@/src/features/inferno/utils/paginate-chat';

/**
 * ep1~4 모두 실제 AI 시즌 API(`ai-season-controller`, `/api/ai/seasons/*`)로 연결했다.
 *
 * 한때 `/api/episodes/*`(episode-controller)로 ep1 만 옮겨봤는데, 백엔드 확인 결과 그건
 * `com.luvin.simulation` 패키지의 완전히 별개 기능(구식 시뮬레이션, AI 시즌과 코드상
 * 무관)이었다 — 잘못 짚은 방향이라 되돌렸다. 회차 대화는 여전히 이 파일(ai-season.ts)
 * 하나로만 연결한다.
 *
 * ep4 의 "다시 굽기"(rebake)는 use-inferno-rebake 가 따로 맡는다 — 여기서는 후보만 채워 주고
 * (map-ai-episode), 요청과 새 대화 기다리기는 그 훅이 한다.
 *
 * 백엔드 확인: 새 1:1 대화는 새 엔드포인트가 아니라 `GET .../episodes/{number}` 재호출로
 * 받는다(reroll 성공 시 서버가 해당 회차의 내부 versionId 를 새 버전으로 바꿔치기해 둬서,
 * 같은 조회를 다시 하면 새 1:1 대화가 처음부터 내려온다 — 기존에 받아 둔 메시지는 버리고
 * 통째로 교체해야 한다). reroll 이 실패했는지는 `GET .../episodes/{number}/rerolls` 로 본다
 * (스펙에 추가됨, use-inferno-rebake 주석 참고).
 */
const AI_CONNECTED_EPISODES = new Set([1, 2, 3, 4]);

/**
 * 회차의 대화를 읽는다. 화면은 데이터가 어디서 오는지 몰라도 된다.
 *
 * AI 시즌 상태(참가자)와 회차 메시지를 둘 다 받아와 화면이 이미 알던 `InfernoConversation`
 * 모양으로 합친다. 메시지가 아직 생성 전이면(`messages` 빈 배열) `conversation`은
 * `undefined`고 `isLoading`이 true — 화면은 이 동안 "만들고 있어요" 같은 안내를 보여줘야
 * 한다(§11, 빈 화면 금지).
 */
export default function useInfernoConversation(order: number): {
  conversation: InfernoConversation | undefined;
  isLoading: boolean;
  isError: boolean;
  /** AI 생성 요청 자체가 실패로 응답한 상태. 폴링을 멈춘 채로 있으니 재시도가 필요하다. */
  hasGenerationFailed: boolean;
  /** 생성 실패 안내의 "다시 시도"가 부를 함수. */
  retryGeneration: () => void;
} {
  const isAiConnected = AI_CONNECTED_EPISODES.has(order);
  const myProfile = useBreadStore((state) => state.profile);
  const statusQuery = useAiSeasonStatus();
  const episodeQuery = useAiEpisodeMessages(order, isAiConnected);
  // 지난 시즌을 다시 볼 때는 참가자를 그 회차 메시지의 화자로 만든다 — `/me` 는 최신 시즌 참가자만
  // 준다(buildCharactersFromMessages 주석). 생성을 기다리지도 않으니 로딩·에러도 회차 조회만 본다.
  const { isPastSeason } = useViewedSeason();
  // 대화를 화면 높이에 맞춰 쪽으로 나누려고 창 크기를 읽는다(paginate-chat). 러빈지옥은 가로로
  // 잠기는데 잠기기 직전 한 순간은 세로 값이 올 수 있어서, 긴 쪽을 폭·짧은 쪽을 높이로 본다 —
  // 그래야 방향이 정리되는 동안 쪽 수가 바뀌어 흐름의 쪽 번호가 흔들리지 않는다.
  const windowSize = useWindowDimensions();
  const pageBudgets = buildChatPageBudgets(
    Math.max(windowSize.width, windowSize.height),
    Math.min(windowSize.width, windowSize.height),
  );

  if (!isAiConnected) {
    return {
      conversation: getInfernoConversation(order),
      isLoading: false,
      isError: false,
      hasGenerationFailed: false,
      retryGeneration: () => {},
    };
  }

  // group만 오고 one_to_one이 아직 없는 매칭 회차(ep2/ep4)를 "메시지가 있으니 완료"로
  // 오판하지 않는다 — 그러면 matchReveal이 계속 undefined인데 로딩 표시도 꺼져서 화면이
  // 그냥 멈춰 보인다(사용자 확인된 버그, isEpisodeFullyGenerated 주석 참고).
  const isReady = episodeQuery.data != null && isEpisodeFullyGenerated(order, episodeQuery.data.messages);
  const season = isPastSeason
    ? episodeQuery.data
      ? { characters: buildCharactersFromMessages(episodeQuery.data.messages) }
      : undefined
    : statusQuery.data;
  const conversation =
    season && episodeQuery.data && isReady
      ? mapAiEpisodeToConversation(season, episodeQuery.data, myProfile, pageBudgets)
      : undefined;

  return {
    conversation,
    // 지난 시즌에 대화가 없으면 기다려도 생기지 않는다 — 로딩이 아니라 "대화가 아직 없어요" 를 보여준다.
    isLoading: isPastSeason
      ? episodeQuery.isLoading
      : statusQuery.isLoading ||
        episodeQuery.isLoading ||
        (episodeQuery.isSuccess && !isReady && !episodeQuery.hasGenerationFailed),
    isError: isPastSeason ? episodeQuery.isError : statusQuery.isError || episodeQuery.isError,
    hasGenerationFailed: episodeQuery.hasGenerationFailed,
    retryGeneration: episodeQuery.retryGeneration,
  };
}
