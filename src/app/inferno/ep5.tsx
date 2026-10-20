import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import InfernoAnalysisScene from '@/src/features/inferno/components/inferno-analysis-scene';
import InfernoEpisodeFrame from '@/src/features/inferno/components/inferno-episode-frame';
import InfernoFinalMatchReveal from '@/src/features/inferno/components/inferno-final-match-reveal';
import InfernoHighlightScene from '@/src/features/inferno/components/inferno-highlight-scene';
import InfernoWrapUpScene from '@/src/features/inferno/components/inferno-wrap-up-scene';
import {
  BAKE_WAIT_MESSAGE,
  BAKE_WAIT_SLOW_AFTER_MS,
  BAKE_WAIT_SLOW_MESSAGE,
} from '@/src/features/inferno/constants/bake';
import useEpisodeExit from '@/src/features/inferno/hooks/use-episode-exit';
import useEpisodeCheckpoint from '@/src/features/inferno/hooks/use-episode-checkpoint';
import useEp5Bake from '@/src/features/inferno/hooks/use-ep5-bake';
import useInfernoEp5Flow from '@/src/features/inferno/hooks/use-inferno-ep5-flow';
import useInfernoSeasonSummary from '@/src/features/inferno/hooks/use-inferno-season-summary';
import useWaitingTooLong from '@/src/features/inferno/hooks/use-waiting-too-long';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { usePartnerLetterStore } from '@/src/features/inferno/store/partner-letter-store';
import type { InfernoSeasonSummary } from '@/src/features/inferno/types';
import { findInfernoEpisode } from '@/src/features/inferno/utils/episodes';
import { buildPartnerLetterSender } from '@/src/features/inferno/utils/partner-letter';
import type { BreadProfile } from '@/src/features/home/types';

const EPISODE_ORDER = 5;

/**
 * [DRAFT] 시즌 마무리. Figma 디자인이 아직 없는 상태에서 기능부터 먼저 만든 화면이다
 * (AGENTS.md §8 은 원래 디자인을 먼저 읽으라고 하지만, 이번엔 사용자 요청으로 예외).
 * 색상/자간/버튼 등은 전부 기존 토큰·컴포넌트를 그대로 조합한 임시 배치이니, 디자인이
 * 나오면 이 화면(과 아래 4개 씬 컴포넌트)을 다시 손봐야 한다는 걸 리뷰어가 알고 있을 것.
 *
 * ep3/ep4 와 같은 이유로 잠시 나가기 체크포인트를 두지 않는다 — 되돌릴 대화 상태가 없는
 * 단순 리포트라 다시 들어오면 1페이지부터 봐도 무방하다.
 *
 * FRONTEND_CHANGES.md §4: `SAMPLE_BREAD_PROFILE` 폴백을 걷어냈다 — 서버 결과 없이 가짜
 * 반죽으로 화면을 보여주지 않는다. 내 반죽은 `useBreadProfile`(서버 설문 결과가 원천)로
 * 받고, 아직 없거나(`isSurveyMissing`)/로딩/에러 상태면 리포트 로딩·에러와 같은 안내
 * 화면으로 합쳐서 처리한다(§11 — 빈 화면 금지).
 */
export default function InfernoEp5Screen() {
  // 나가기·완료 기록. 지난 시즌을 다시 볼 때는 완료를 기록하지 않고 오븐으로 돌아간다(use-episode-exit).
  const exit = useEpisodeExit(EPISODE_ORDER);
  const requestNextSeasonNotice = useInfernoStore((state) => state.requestNextSeasonNotice);
  const queueLetter = usePartnerLetterStore((state) => state.queueLetter);
  const episode = findInfernoEpisode(EPISODE_ORDER);
  const breadProfile = useBreadProfile();
  const {
    summary,
    isLoading: isSummaryLoading,
    isGenerating,
    isError: isSummaryError,
    hasGenerationFailed,
    retryGeneration,
  } = useInfernoSeasonSummary(EPISODE_ORDER);
  // 지난번에 "잠시 나가기" 로 나갔다면 그 페이지에서 이어 본다. 처음 들어오는 회차면 0.
  const checkpoint = useEpisodeCheckpoint(EPISODE_ORDER);
  // 지난 시즌은 "시즌 마무리" 페이지 없이 하이라이트까지만 보여준다(use-inferno-ep5-flow 주석).
  const flow = useInfernoEp5Flow(checkpoint.initialStep, exit.isPastSeason);
  // 리포트가 막 도착하면 RESULT 자리에서 "반죽 → 연기 → 구운 빵" 등장 연출을 튼다. 리포트를 기다린 적이
  // 있을 때만 틀고, 지난 시즌·이어보기에서는 틀지 않는다(use-ep5-bake).
  const bake = useEp5Bake(isGenerating, !exit.isPastSeason && checkpoint.initialStep === 0);

  // "잠시 나가기" 는 스킵과 다르다. 회차를 본 것으로 치지 않고, 보던 자리만 기억해 둔다.
  function handleExitPress() {
    checkpoint.saveStep(flow.pageIndex);
    exit.leave();
  }

  const isLoading = isSummaryLoading || breadProfile.isLoading;
  const isError = isSummaryError || breadProfile.isError;
  const myProfile = breadProfile.profile;

  // 리포트를 기다리는 동안 띄우는 문구. 20초를 넘기면 "생각보다 오래 걸리고 있어요" 로 바꾼다(사용자 지시).
  // 실패·에러·설문 없음 안내가 먼저다 — 아래 안내 문구의 우선순위와 같다.
  const isWaitingForReport =
    !summary && isLoading && !hasGenerationFailed && !isError && !breadProfile.isSurveyMissing;
  const isWaitingLong = useWaitingTooLong(isWaitingForReport, BAKE_WAIT_SLOW_AFTER_MS);

  // AI가 아직 리포트를 안 만들었거나 실패했거나, 내 반죽(서버 설문 결과)이 아직 없으면
  // 빈 화면 대신 안내를 보여준다(§11, ep1~4 와 같은 이유).
  if (!episode || !summary || !myProfile) {
    return (
      <InfernoEpisodeFrame episode={episode ?? { order: EPISODE_ORDER, title: '' }} surface="note" skipLabel={exit.skipLabel} onSkipPress={handleExitPress}>
        <View className="flex-1 items-center justify-center gap-[12px] px-[30px]">
          <Text variant="body-m" className="text-center text-default-black">
            {hasGenerationFailed
              ? '리포트를 만들지 못했어요'
              : isError
                ? '정보를 불러오지 못했어요'
                : breadProfile.isSurveyMissing
                  ? '설문을 먼저 완료해주세요'
                  : isLoading
                    ? isWaitingLong
                      ? BAKE_WAIT_SLOW_MESSAGE
                      : BAKE_WAIT_MESSAGE
                    : '리포트가 아직 없어요'}
          </Text>
          {hasGenerationFailed ? (
            <Pressable accessibilityRole="button" accessibilityLabel="다시 시도" onPress={retryGeneration}>
              <Text variant="body-s" className="text-state-error">
                다시 시도
              </Text>
            </Pressable>
          ) : null}
        </View>
      </InfernoEpisodeFrame>
    );
  }

  // 시즌을 끝까지 봤으면 최종 매칭 상대가 쪽지를 보낸다. 지금 뜨지 않고 다음에 앱을 열 때 가장
  // 먼저 뜬다(partner-letter-store.ts). 두 마무리 버튼 모두 시즌을 끝까지 본 것이라 둘 다 보낸다.
  // 가드로 좁혀진 값을 여기서 상수로 꺼내 둔다 — 아래 핸들러 안에서는 summary 의 좁혀진 타입이
  // 유지되지 않는다(TS18048, renderPage 주석 참고).
  const finalMatch = summary.finalMatch;

  function queuePartnerLetter() {
    queueLetter(buildPartnerLetterSender(finalMatch, String(Date.now())));
  }

  // "다음 시즌 시작하기": 첫 시즌만 무료라 다음 시즌은 토큰이 필요하다(constants/season). 바로
  // 새 시즌으로 들어가지 않고 홈으로 돌아가 토큰 안내(NOTICE 모달)를 띄운다(사용자 결정).
  // 토큰이 충분하면 그 안내의 "토큰 N개로 시작하기"가 새 시즌을 연다(next-season-notice-modal.tsx).
  function handleNextSeasonPress() {
    queuePartnerLetter();
    requestNextSeasonNotice();
    exit.completeAndLeave();
  }

  // "시즌 끝내기": 새로 시작하지 않고 ep1~4 와 같이 홈으로 돌아간다.
  function handleEndSeasonPress() {
    queuePartnerLetter();
    exit.completeAndLeave();
  }

  // summary/myProfile 을 매개변수로 받는 이유: 위 가드로 좁혀진 타입이 중첩 함수 클로저
  // 안에서는 유지되지 않는다(TS18048) — 인자로 넘기면 호출부의 좁혀진 타입이 그대로 전달된다.
  function renderPage(summary: InfernoSeasonSummary, myProfile: BreadProfile) {
    switch (flow.pageIndex) {
      case 0:
        return (
          <InfernoFinalMatchReveal
            mine={myProfile}
            partner={summary.finalMatch.profile}
            summaryLine={summary.finalMatch.summaryLine}
            isPlaying={bake.isShowing}
            onComplete={bake.handleComplete}
          />
        );
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
      skipLabel={exit.skipLabel}
      onPreviousPress={flow.goPrevious}
      // 등장 연출이 끝나기 전에는 다음 페이지로 넘기지 않는다.
      onNextPress={bake.isShowing ? undefined : flow.goNext}
      onSkipPress={handleExitPress}
    >
      {renderPage(summary, myProfile)}
    </InfernoEpisodeFrame>
  );
}
