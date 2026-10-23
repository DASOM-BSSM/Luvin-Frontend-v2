/**
 * [DRAFT] 새 10화 회차 본문. 회차 시작 화면과 나가기 흐름은 그대로 두고, 본문은 서버
 * `GET .../content` 의 블록을 배열 순서대로 재생한다(보정 문서 3장).
 *
 * - 선택: `POST .../choices` 응답 블록을 선택 블록 뒤에 끼워서 이어 재생한다(use-episode-choice).
 * - 완료: 마지막 블록 뒤 "에피소드 끝내기"에서 `POST .../complete`(use-complete-episode).
 * - 이미 완료한 회차(`completed: true`)는 다시 보기 — 선택은 이미 한 결과로 보여준다.
 * - legacy(기존 5화) 시즌은 없앴다(사용자 결정). episodeFormat 으로 갈라 보내지 않는다.
 */
import InfernoEpisodeBody from '@/src/features/inferno/components/inferno-episode-body';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoEpisodeStateView from '@/src/features/inferno/components/inferno-episode-state-view';
import useAiSeasonStatus from '@/src/features/inferno/hooks/use-ai-season-status';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';

export default function InfernoEpisodeScreen({ order }: { order: number }) {
  const status = useAiSeasonStatus();
  const owner = useInfernoStore((state) => state.ownerUserId);
  const sessionKey = `${owner ?? 'guest'}:${status.data?.seasonId ?? 'season'}`;
  // 플레이어는 위치를 들고 있어서 시즌을 받은 뒤에 한 번만 띄운다.
  if (status.isLoading)
    return (
      <InfernoEpisodeFrame episode={findInfernoEpisode(order) ?? { order, title: '' }}>
        <InfernoEpisodeStateView
          order={order}
          isLoading
          isGenerating={false}
          error={null}
          onRetry={status.refetch}
          onShowReport={status.refetch}
          onAgeRequired={status.refetch}
        />
      </InfernoEpisodeFrame>
    );
  return <InfernoEpisodeBody key={`${sessionKey}:${order}`} order={order} sessionKey={sessionKey} />;
}
