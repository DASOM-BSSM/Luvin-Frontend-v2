import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
} from 'react-native';

import { TOUR_PAGE_COUNT } from '@/src/features/welcome/constants/tour';
import { pageFromOffset } from '@/src/features/welcome/utils/tour';

/**
 * 환영 투어의 장 넘기기. 손으로 밀어도, 다음/건너뛰기 버튼을 눌러도 같은 장 번호가 된다.
 *
 * 한 번이라도 펼쳐 본 장을 기억한다(`hasVisited`). 각 장은 처음 펼쳐질 때 그려져야 등장
 * 애니메이션이 그 순간에 시작한다 — 처음부터 다 그려 두면 옆 장의 애니메이션은 보이지도
 * 않는 사이에 끝나 버린다.
 */
export default function useWelcomeTour() {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [visitedPages, setVisitedPages] = useState<readonly number[]>([0]);

  const isLastPage = page === TOUR_PAGE_COUNT - 1;

  function markVisited(index: number) {
    setVisitedPages((previous) => (previous.includes(index) ? previous : [...previous, index]));
  }

  function showPage(next: number) {
    setPage(next);
    markVisited(next);
  }

  function scrollToPage(next: number) {
    scrollRef.current?.scrollTo({ x: next * width, animated: true });
    showPage(next);
  }

  function hasVisited(index: number) {
    return visitedPages.includes(index);
  }

  // 손으로 미는 동안, 화면에 걸치기 시작한 옆 장을 바로 그린다 — 다 넘어간 뒤에 그리면 미는 내내
  // 빈 장이 보였다. 점은 절반을 넘긴 쪽 장으로 바뀐다. 같은 값이면 state 가 안 바뀌어 다시 그리지 않는다.
  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const { x } = event.nativeEvent.contentOffset;
    const position = width > 0 ? x / width : 0;
    markVisited(pageFromOffset(Math.floor(position) * width, width, TOUR_PAGE_COUNT));
    markVisited(pageFromOffset(Math.ceil(position) * width, width, TOUR_PAGE_COUNT));
    setPage(pageFromOffset(x, width, TOUR_PAGE_COUNT));
  }

  function handleNextPress() {
    scrollToPage(Math.min(page + 1, TOUR_PAGE_COUNT - 1));
  }

  // 건너뛰어도 마지막 장(반죽 만들기 안내)은 보여준다 — 다음에 뭘 해야 하는지는 알고 가야 한다.
  function handleSkipPress() {
    scrollToPage(TOUR_PAGE_COUNT - 1);
  }

  // 뒤로가기로 투어에 다시 오지 않도록 교체한다. 설문 화면의 "나가기"는 돌아갈 곳이 없으면 홈으로 간다.
  function handleStartPress() {
    router.replace('/survey');
  }

  function handleLaterPress() {
    router.replace('/');
  }

  return {
    scrollRef,
    page,
    isLastPage,
    hasVisited,
    handleScroll,
    handleNextPress,
    handleSkipPress,
    handleStartPress,
    handleLaterPress,
  };
}
