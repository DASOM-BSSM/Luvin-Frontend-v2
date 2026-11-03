import { Pressable } from 'react-native';

import GoogleLogoIcon from '@/src/assets/icons/GoogleLogoIcon';
import Text from '@/src/components/ui/text';

interface GoogleSignInButtonProps {
  disabled?: boolean;
  onPress: () => void;
}

/**
 * 온보딩 "Google 계정으로 로그인" 버튼. Google 공식 브랜딩 가이드의 라이트 테마
 * (흰 바탕 · #747775 1px 테두리 · 컬러 G 로고)를 따른다(사용자 결정 — Figma 시안 없음).
 *
 * 라이브러리 `GoogleSigninButton` 은 230·312 x 48 고정 크기의 옛 디자인이라 옆의 Apple 공식 버튼과
 * 크기 · 모양이 맞지 않아 쓰지 않았다. 높이 40 · 모서리 8 · 가로 꽉은 `AppleSignInButton` 과 같다.
 * 글자는 가이드의 Roboto 대신 앱 폰트를 쓴다(§8 — 다른 폰트 금지).
 */
export default function GoogleSignInButton({ disabled, onPress }: GoogleSignInButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Google 계정으로 로그인"
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      onPress={onPress}
      className={`h-[40px] w-full flex-row items-center justify-center gap-[10px] rounded-[8px] border border-google-button-border bg-default-white ${disabled ? 'opacity-50' : ''}`}
    >
      <GoogleLogoIcon size={20} />
      <Text variant="body-m" className="text-text-primary">
        Google 계정으로 로그인
      </Text>
    </Pressable>
  );
}
