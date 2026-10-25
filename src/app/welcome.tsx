import { useEffect } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { resetToOnboarding } from '@/src/features/auth/lib/reset-to-onboarding';
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
 * 첫 로그인(=가입) 직후 한 번만 보이는 환영 투어. 계정 탈퇴 후 다시 가입했을 때도 보인다.
 * 언제 오는지는 `getPostLoginHref`(features/auth/utils/welcome.ts)가 정한다.
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
  const nickname = useAuthStore((state) => state.user?.nickname);
  const tour = useWelcomeTour();

  // 로그인 안 된 채로 들어오면(딥링크 등) 온보딩으로 돌려보낸다. 홈과 같은 규칙이다.
  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      resetToOnboarding();
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
          title={<WelcomeTitle title={buildWelcomeTitle(nickname)} />}
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

        {/* 버튼이 하나일 때와 둘일 때 높이를 같게 둬서, 마지막 장에서 점이 밀려 올라가지 않게 한다. */}
        <View className="h-[76px] w-full items-center gap-[14px]">
          {tour.isLastPage ? (
            <>
              <Button label={TOUR_BUTTON_LABEL.start} variant="primary" onPress={tour.handleStartPress} />
              <Pressable accessibilityRole="button" hitSlop={8} onPress={tour.handleLaterPress}>
                <Text variant="body-s" className="text-text-muted">
                  {TOUR_BUTTON_LABEL.later}
                </Text>
              </Pressable>
            </>
          ) : (
            <Button label={TOUR_BUTTON_LABEL.next} variant="primary" onPress={tour.handleNextPress} />
          )}
        </View>
      </View>

      <View className="h-[44px]" />
    </View>
  );
}
