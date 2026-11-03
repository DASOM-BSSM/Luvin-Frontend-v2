import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';

/**
 * "앱 소개 | 개인정보처리방침" 작은 회색 링크. 로그인 전(온보딩)과 로그인 뒤(마이페이지) 모두에서
 * 볼 수 있어야 한다(Google 로그인 앱 게시 · App Store 심사 요건, 사용자 결정). 시안이 없어 작은 밑줄
 * 글씨로 뒀다.
 */
export default function LegalLinks() {
  function handleAboutLinkPress() {
    router.push('/about');
  }

  function handlePrivacyLinkPress() {
    router.push('/privacy');
  }

  return (
    <View className="flex-row items-center gap-[8px]">
      <Pressable accessibilityRole="link" hitSlop={8} onPress={handleAboutLinkPress}>
        <Text variant="body-xs" className="text-text-muted underline">
          앱 소개
        </Text>
      </Pressable>
      <Text variant="body-xs" className="text-text-muted">
        |
      </Text>
      <Pressable accessibilityRole="link" hitSlop={8} onPress={handlePrivacyLinkPress}>
        <Text variant="body-xs" className="text-text-muted underline">
          개인정보처리방침
        </Text>
      </Pressable>
    </View>
  );
}
