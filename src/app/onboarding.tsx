import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

import BreadCluster from '@/src/components/bread-cluster';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import useGoogleSignIn from '@/src/features/auth/hooks/use-google-sign-in';
import { getPostLoginHref } from '@/src/features/auth/utils/welcome';

/**
 * 온보딩 화면. Figma "Luvin-Design" / `온보딩-우린` (5461:3552).
 *
 * 세로 위치: Figma 프레임(402 x 874)에서 본문 블록 위로 238px, 아래로 259px 이 남는다.
 * 고정 px 로 박으면 기기 높이마다 어긋나서, 같은 비율의 빈 spacer 뷰로 옮겼다(§16).
 * 가로 여백 30px 은 프레임 폭 402 - 본문 폭 342 를 반씩 나눈 값이다.
 */
export default function OnboardingScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const signInMutation = useGoogleSignIn();

  // 이미 로그인돼 있으면(재실행 등) 온보딩을 다시 보여주지 않는다.
  //
  // 로그인 성공 시에도 useGoogleSignIn 의 onSuccess 가 setSession 을 먼저 부르므로 실제로는
  // 이 effect 가 먼저 화면을 넘긴다. 그래서 첫 로그인이면 환영 화면으로 보내는 판단도 여기서 한다.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace(getPostLoginHref(user));
    }
  }, [isAuthenticated, user]);

  // 로그인 성공(취소가 아닌 실제 성공) 시에만 홈으로 넘어간다.
  useEffect(() => {
    if (signInMutation.isSuccess && signInMutation.data) {
      router.replace(getPostLoginHref(signInMutation.data.user));
    }
  }, [signInMutation.isSuccess, signInMutation.data]);

  function handleLoginButtonPress() {
    signInMutation.mutate();
  }

  return (
    <View className="flex-1 items-center bg-default-bg px-[30px]">
      <View className="flex-[238]" />

      <View className="w-full gap-[40px]">
        <View className="w-full items-center gap-[40px]">
          <View className="w-full gap-[2px]">
            <Text variant="heading-h2" className="text-default-black">
              사랑은 타이밍이에요
            </Text>
            <Text variant="body-s" className="text-default-black">
              너무 빠르면 덜 익고, 너무 늦으면 타버리니깐요
            </Text>
          </View>

          <BreadCluster state="baked" className="h-[169.2px] w-[236px]" />
        </View>

        <View className="w-full items-center gap-[12px]">
          <Button
            label="로그인 하기"
            variant="primary"
            disabled={signInMutation.isPending}
            onPress={handleLoginButtonPress}
          />
          <Text variant="body-s" className="text-text-muted">
            구글 계정으로 로그인 됩니다
          </Text>
          {signInMutation.isError ? (
            <Text variant="body-s" className="text-state-error">
              {/* 개발 중에만 실제 원인을 보여준다 — 배포 빌드에서는 원인을 숨긴다(§11). */}
              {__DEV__
                ? `로그인 실패: ${signInMutation.error?.message ?? String(signInMutation.error)}`
                : '로그인에 실패했어요. 다시 시도해주세요'}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-[259]" />
    </View>
  );
}
