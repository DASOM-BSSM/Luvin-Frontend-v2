import { router } from 'expo-router';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoAnalysisScene from '@/src/features/inferno/components/inferno-analysis-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoFinalMatchScene from '@/src/features/inferno/components/inferno-final-match-scene';
import InfernoHighlightScene from '@/src/features/inferno/components/inferno-highlight-scene';
import InfernoWrapUpScene from '@/src/features/inferno/components/inferno-wrap-up-scene';
import useInfernoEp5Flow from '@/src/features/inferno/hooks/use-inferno-ep5-flow';
import useInfernoSeasonSummary from '@/src/features/inferno/hooks/use-inferno-season-summary';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import type { InfernoSeasonSummary } from '@/src/features/inferno/types';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { SAMPLE_BREAD_PROFILE, useBreadStore } from '@/src/features/bread/store/bread-store';

const EPISODE_ORDER = 5;

/**
 * [DRAFT] 시즌 마무리. Figma 디자인이 아직 없는 상태에서 기능부터 먼저 만든 화면이다
 * (AGENTS.md §8 은 원래 디자인을 먼저 읽으라고 하지만, 이번엔 사용자 요청으로 예외).
 * 색상/자간/버튼 등은 전부 기존 토큰·컴포넌트를 그대로 조합한 임시 배치이니, 디자인이
 * 나오면 이 화면(과 아래 4개 씬 컴포넌트)을 다시 손봐야 한다는 걸 리뷰어가 알고 있을 것.
 *
 * ep3/ep4 와 같은 이유로 잠시 나가기 체크포인트를 두지 않는다 — 되돌릴 대화 상태가 없는
 * 단순 리포트라 다시 들어오면 1페이지부터 봐도 무방하다.
 */
export default function InfernoEp5Screen() {
  const completeEpisode = useInfernoStore((state) => state.completeEpisode);
  const episode = findInfernoEpisode(EPISODE_ORDER);
  // 설문 API 가 아직 없어 반죽이 없는 상태로도 이 화면을 봐야 할 수 있다(딥링크로 바로
  // 들어오는 경우 등) — bread-store.ts 의 SAMPLE_BREAD_PROFILE("API 연동 전까지 쓰는 값")로
  // 대신한다. 실제 서비스에서는 홈 화면의 openInferno 가드가 반죽 없이는 못 들어오게 막으므로
  // 이 대체값은 거의 쓰이지 않는다.
  const myProfile = useBreadStore((state) => state.profile) ?? SAMPLE_BREAD_PROFILE;
  const { summary, isLoading, isError } = useInfernoSeasonSummary(EPISODE_ORDER, myProfile);
  const flow = useInfernoEp5Flow();

  // "잠시 나가기" 는 스킵과 다르다. 본 것으로 치지 않아서 다시 들어오면 처음부터다.
  function handleExitPress() {
    router.dismissTo('/');
  }

  // AI가 아직 리포트를 안 만들었거나 실패했으면 빈 화면 대신 안내를 보여준다(§11, ep1~4 와
  // 같은 이유).
  if (!episode || !summary) {
    return (
      <InfernoEpisodeFrame episode={episode ?? { order: EPISODE_ORDER, title: '' }} surface="note" skipLabel="잠시 나가기" onSkipPress={handleExitPress}>
        <View className="flex-1 items-center justify-center px-[30px]">
          <Text variant="body-m" className="text-center text-default-black">
            {isError ? '리포트를 불러오지 못했어요' : isLoading ? 'AI가 리포트를 만들고 있어요...' : '리포트가 아직 없어요'}
          </Text>
        </View>
      </InfernoEpisodeFrame>
    );
  }

  // "다음 시즌 시작하기": 새 시즌의 첫 회차로 이어지는 동작이라 가이드(ep0)로 보낸다.
  function handleNextSeasonPress() {
    completeEpisode(EPISODE_ORDER);
    router.push('/inferno/ep0');
  }

  // "시즌 끝내기": 새로 시작하지 않고 허브(오븐 화면)로만 돌아간다.
  function handleEndSeasonPress() {
    completeEpisode(EPISODE_ORDER);
    router.push('/oven');
  }

  // summary 를 매개변수로 받는 이유: 위 가드로 좁혀진 타입이 중첩 함수 클로저 안에서는
  // 유지되지 않는다(TS18048) — 인자로 넘기면 호출부의 좁혀진 타입이 그대로 전달된다.
  // myProfile 은 처음부터 null 이 아니라(위 fallback) 이 문제가 없어 그냥 클로저로 쓴다.
  function renderPage(summary: InfernoSeasonSummary) {
    switch (flow.pageIndex) {
      case 0:
        return <InfernoFinalMatchScene result={summary.finalMatch} myProfile={myProfile} />;
      case 1:
        return <InfernoAnalysisScene report={summary.report} />;
      case 2:
        return <InfernoHighlightScene highlights={summary.highlights} />;
      default:
        return (
          <InfernoWrapUpScene
            onEndSeasonPress={handleEndSeasonPress}
            onNextSeasonPress={handleNextSeasonPress}
          />
        );
    }
  }

  return (
    <InfernoEpisodeFrame
      episode={episode}
      surface="note"
      skipLabel="잠시 나가기"
      onPreviousPress={flow.goPrevious}
      onNextPress={flow.goNext}
      onSkipPress={handleExitPress}
    >
      {renderPage(summary)}
    </InfernoEpisodeFrame>
  );
}
