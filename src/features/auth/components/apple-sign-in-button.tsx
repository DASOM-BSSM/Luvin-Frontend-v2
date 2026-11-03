import * as AppleAuthentication from 'expo-apple-authentication';
import { cssInterop } from 'nativewind';
import { View } from 'react-native';

/** 공식 버튼은 크기를 style 로만 받아서 className 을 style 로 넘긴다(write-diary-form 의 TextInput 과 같다). */
const InteropAppleButton = cssInterop(AppleAuthentication.AppleAuthenticationButton, {
  className: 'style',
});

/** `GoogleSignInButton` 의 rounded-[8px] 과 같다. 공식 버튼은 모서리를 style 이 아니라 이 값으로만 받는다. */
const CORNER_RADIUS = 8;

interface AppleSignInButtonProps {
  disabled?: boolean;
  onPress: () => void;
}

/**
 * 온보딩 "Apple로 로그인" 버튼. Apple 공식 버튼(`ASAuthorizationAppleIDButton`)을 그대로 쓴다 —
 * Apple 로고 · 문구 · 색이 시스템이 그리는 승인된 모양이라 심사(HIG)에 안전하다(사용자 결정).
 * 문구는 기기 언어를 따른다(한국어면 "Apple로 로그인").
 *
 * 바탕색 · 모서리를 style 로 바꾸면 안 된다(Apple 규정) — 색은 `buttonStyle`, 모서리는 `cornerRadius` 로만.
 * 공식 버튼에는 disabled 가 없어서, 로그인 중에는 감싼 View 에서 터치를 막고 흐리게 한다.
 * iOS 전용이다 — Android 에서는 이 버튼을 그리지 않는다(onboarding).
 */
export default function AppleSignInButton({ disabled, onPress }: AppleSignInButtonProps) {
  return (
    <View
      pointerEvents={disabled ? 'none' : 'auto'}
      className={`w-full ${disabled ? 'opacity-50' : ''}`}
    >
      <InteropAppleButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={CORNER_RADIUS}
        onPress={onPress}
        className="h-[40px] w-full"
      />
    </View>
  );
}
