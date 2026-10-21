import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';

import BreadCluster from '@/src/components/bread-cluster';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import useAppleSignIn from '@/src/features/auth/hooks/use-apple-sign-in';
import useGoogleSignIn from '@/src/features/auth/hooks/use-google-sign-in';

/**
 * 애플 로그인은 iOS 에서만 띄운다 — Android 에는 애플 로그인 창이 없다(expo-apple-authentication 은
 * iOS 전용). 플랫폼마다 화면이 달라지는 몇 안 되는 곳이다(§1 예외: 꼭 필요한 경우).
 */
const IS_APPLE_SIGN_IN_SUPPORTED = Platform.OS === 'ios';

/**
 * 온보딩 화면. Figma "Luvin-Design" / `온보딩-우린` (5461:3552).
 *
 * 세로 위치: Figma 프레임(402 x 874)에서 본문 블록 위로 238px, 아래로 259px 이 남는다.
 * 고정 px 로 박으면 기기 높이마다 어긋나서, 같은 비율의 빈 spacer 뷰로 옮겼다(§16).
 * 가로 여백 30px 은 프레임 폭 402 - 본문 폭 342 를 반씩 나눈 값이다.
 *
 * 로그인 버튼은 Google·Apple 두 개다(6031:2839, 7635:3361). Android 는 Apple 버튼이 없어서, 빠진
 * 높이(버튼 40 + 간격 16)만큼 본문 위에 빈 자리를 둬 블록 전체를 그만큼 아래로 내린다 — Google 버튼이
 * iOS 의 Apple 버튼 자리에 온다(사용자 결정).
 */
export default function OnboardingScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const signInMutation = useGoogleSignIn();
  const appleSignInMutation = useAppleSignIn();
  // 한쪽 로그인이 진행 중이면 두 버튼 다 막는다 — 두 계정 로그인이 겹치지 않게 한다.
  const isSigningIn = signInMutation.isPending || appleSignInMutation.isPending;
  // 마지막으로 실패한 로그인. 두 버튼 아래 같은 자리에 안내를 띄운다.
  const signInError = signInMutation.error ?? appleSignInMutation.error;

  // 이미 로그인돼 있으면(재실행 등) 온보딩을 다시 보여주지 않는다.
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  // 로그인 성공(취소가 아닌 실제 성공) 시에만 홈으로 넘어간다.
  useEffect(() => {
    const isGoogleSignedIn = signInMutation.isSuccess && signInMutation.data;
    const isAppleSignedIn = appleSignInMutation.isSuccess && appleSignInMutation.data;
    if (isGoogleSignedIn || isAppleSignedIn) {
      router.replace('/');
    }
  }, [signInMutation.isSuccess, signInMutation.data, appleSignInMutation.isSuccess, appleSignInMutation.data]);

  function handleGoogleLoginPress() {
    appleSignInMutation.reset();
    signInMutation.mutate();
  }

  function handleAppleLoginPress() {
    signInMutation.reset();
    appleSignInMutation.mutate();
  }

  return (
    <View className="flex-1 items-center bg-default-bg px-[30px]">
      <View className="flex-[238]" />
      {/* Android 는 Apple 버튼이 빠진 만큼 아래로 내린다(위 주석). */}
      {IS_APPLE_SIGN_IN_SUPPORTED ? null : <View className="h-[56px]" />}

      <View className="w-full gap-[50px]">
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

        <View className="w-full items-center gap-[16px]">
          <Button
            label="Google로 로그인 하기"
            variant="login"
            disabled={isSigningIn}
            onPress={handleGoogleLoginPress}
          />
          {IS_APPLE_SIGN_IN_SUPPORTED ? (
            <Button
              label="Apple로 로그인 하기"
              variant="login"
              disabled={isSigningIn}
              onPress={handleAppleLoginPress}
            />
          ) : null}
          {signInError ? (
            <Text variant="body-s" className="text-state-error">
              {/* 개발 중에만 실제 원인을 보여준다 — 배포 빌드에서는 원인을 숨긴다(§11). */}
              {__DEV__
                ? `로그인 실패: ${signInError.message ?? String(signInError)}`
                : '로그인에 실패했어요. 다시 시도해주세요'}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="flex-[259]" />
    </View>
  );
}
