import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import TourIllustration from '@/src/features/welcome/components/tour-illustration';
import TourPage from '@/src/features/welcome/components/tour-page';
import TourPageDots from '@/src/features/welcome/components/tour-page-dots';
import WelcomeTitle from '@/src/features/welcome/components/welcome-title';
import {
  TOUR_BUTTON_LABEL,
  TOUR_FEATURE_PAGES,
  TOUR_GREETING_DESCRIPTION,
  TOUR_PAGE_COUNT,
} from '@/src/features/welcome/constants/tour';
import useWelcomeTour from '@/src/features/welcome/hooks/use-welcome-tour';
import { buildWelcomeTitle } from '@/src/features/welcome/utils/tour';

/**
 * 앱 소개 투어. 로그인 전, 앱을 처음 켰을 때 로딩 화면 다음에 이 기기에서 한 번만 보인다(사용자 결정 —
 * 로그인 전에 앱이 무엇인지 알 수 있어야 한다). 언제 오는지는 `resetToOnboarding` 이 정하고,
 * 끝까지 넘기면 본 것으로 기록한 뒤 온보딩(로그인)으로 간다(features/welcome/lib/tour-seen).
 * 예전에는 첫 로그인 직후에 보였다.
 *
 * 인사 → 반죽(성향 테스트) → 러빈지옥 → 미니게임 → 감정일기 → 반죽 만들러 가기 순서로
 * 서비스 전체를 한 장씩 소개한다. 손으로 밀어도, 다음 버튼으로도 넘어간다.
 *
 * Figma 시안이 없어서 온보딩(5461:3552)의 토큰·버튼·여백(가로 30px)을 그대로 빌려 왔다.
 * 디자인이 나오면 맞출 것.
 */
export default function WelcomeScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const tour = useWelcomeTour();

  // 로그인 전 화면이라, 이미 로그인된 채로 들어오면(딥링크 등) 홈으로 보낸다.
  useEffect(() => {
    if (!isHydrating && isAuthenticated) {
      router.replace('/');
    }
  }, [isHydrating, isAuthenticated]);

  return (
    <View className="flex-1 bg-default-bg">
      <View className="h-[70px]" />

      {/* 마지막 장에서는 건너뛸 곳이 없어 숨기되, 자리는 남겨 장마다 위치가 흔들리지 않게 한다. */}
      <View className={`w-full flex-row justify-end px-[30px] ${tour.isLastPage ? 'opacity-0' : ''}`}>
        <Pressable
          accessibilityRole="button"
          disabled={tour.isLastPage}
          hitSlop={12}
          onPress={tour.handleSkipPress}
        >
          <Text variant="body-s" className="text-text-muted">
            {TOUR_BUTTON_LABEL.skip}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={tour.scrollRef}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={tour.handleScroll}
      >
        <TourPage
          visited={tour.hasVisited(0)}
          illustration={<TourIllustration kind="greeting" />}
          title={<WelcomeTitle title={buildWelcomeTitle(undefined)} />}
          description={TOUR_GREETING_DESCRIPTION}
        />
        {TOUR_FEATURE_PAGES.map((feature, index) => (
          <TourPage
            key={feature.key}
            visited={tour.hasVisited(index + 1)}
            illustration={<TourIllustration kind={feature.key} />}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </ScrollView>

      <View className="w-full items-center gap-[24px] px-[30px]">
        <TourPageDots count={TOUR_PAGE_COUNT} page={tour.page} />

        {/* 장마다 버튼 자리 높이를 같게 둬서, 마지막 장에서 점이 밀려 올라가지 않게 한다. */}
        <View className="h-[76px] w-full items-center gap-[14px]">
          {tour.isLastPage ? (
            <Button label={TOUR_BUTTON_LABEL.start} variant="primary" onPress={tour.handleStartPress} />
          ) : (
            <Button label={TOUR_BUTTON_LABEL.next} variant="primary" onPress={tour.handleNextPress} />
          )}
        </View>
      </View>

      <View className="h-[44px]" />
    </View>
  );
}
