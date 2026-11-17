import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import BackHeader from '@/src/components/ui/back-header';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import BreadIntroCard from '@/src/features/bread/components/bread-intro-card';
import { BREAD_INTROS } from '@/src/features/bread/constants/bread-intros';

/**
 * 빵 8종 소개 화면. "내 성향" 탭의 "다른 빵들도 알아보기" 버튼으로 연다.
 *
 * Figma 시안 없이 만든 초안이다(LUV-113, 사용자 결정) — 시안이 나오면 맞출 것.
 * 문구는 정적 데이터라 불러오기/오류 상태가 없다.
 */
export default function BreadsScreen() {
  function handleBackPress() {
    // 딥링크로 바로 열렸으면 돌아갈 곳이 없다 — 내 성향 탭으로 보낸다.
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/bread');
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[20px] px-[30px] pb-[24px] pt-[26px]"
        showsVerticalScrollIndicator={false}
      >
        <BackHeader title="우리 빵 알아보기" onBackPress={handleBackPress} />
        <Text variant="body-s" className="text-text-primary">
          러빈의 빵은 모두 8종류예요. 빵마다 마음을 표현하는 방식이 조금씩 달라요.
        </Text>
        <View className="w-full flex-col gap-[16px]">
          {BREAD_INTROS.map((intro) => (
            <BreadIntroCard key={intro.type} intro={intro} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
