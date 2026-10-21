import { useState } from 'react';

/** 본문 네 페이지. 공통 회차 시작 카드는 `/inferno?order=5`에서 표시한다. */
const PAGE_COUNT = 4;

export interface InfernoEp5Flow {
  pageIndex: number;
  /** 넘기지 않으면 해당 버튼이 연해지고 눌리지 않는다(다른 회차와 같은 규칙). */
  goPrevious?: () => void;
  goNext?: () => void;
}

/**
 * ep5 페이지 이동. 최종 매칭 → 행동 분석 → 하이라이트 → 시즌 마무리 순이다.
 *
 * "잠시 나가기" 로 나갔다 들어오면 보던 페이지에서 이어 본다(사용자 결정: 모든 회차가 이어보기).
 * 예전에는 단순 리포트라 1페이지부터 봐도 된다고 보고 이어보기를 두지 않았다.
 */
export default function useInfernoEp5Flow(
  /** 이어볼 페이지(use-episode-checkpoint). 처음 들어오면 0. */
  initialStep: number,
  /**
   * 마지막 "시즌 마무리" 페이지를 뺄지. 지난 시즌을 다시 볼 때 뺀다 — 그 페이지의 "시즌 끝내기",
   * "다음 시즌 시작하기" 는 지금 시즌을 바꾸는 버튼이다(use-viewed-season).
   */
  withoutWrapUp = false,
): InfernoEp5Flow {
  const pageCount = withoutWrapUp ? PAGE_COUNT - 1 : PAGE_COUNT;
  // 저장된 자리가 페이지 수를 넘으면(페이지 구성이 바뀐 경우) 마지막 페이지로 잘라낸다.
  const [pageIndex, setPageIndex] = useState(Math.min(Math.max(initialStep, 0), pageCount - 1));

  function showPreviousPage() {
    setPageIndex((index) => index - 1);
  }

  function showNextPage() {
    setPageIndex((index) => index + 1);
  }

  return {
    pageIndex,
    goPrevious: pageIndex > 0 ? showPreviousPage : undefined,
    goNext: pageIndex < pageCount - 1 ? showNextPage : undefined,
  };
}
