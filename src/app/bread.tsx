import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import BottomNav from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import BreadTraitList from '@/src/features/bread/components/bread-trait-list';
import RecommendedVideoCard from '@/src/features/bread/components/recommended-video-card';
import type { RecommendedVideo } from '@/src/features/bread/types';
import BreadSurveyPromptCard from '@/src/features/home/components/bread-survey-prompt-card';
import MyProfileCard from '@/src/features/home/components/my-profile-card';
import type { BreadProfile } from '@/src/features/home/types';

// API 연동 전. 시안의 값을 그대로 넣어 뒀다.
// MY_PROFILE 을 null 로 바꾸면 설문 전(반죽 없음) 상태가 된다.
const MY_PROFILE: BreadProfile | null = {
  type: 'salt',
  state: 'dough',
  name: '쫀쫀한 소금빵 반죽',
  description: '저는 오직 제 사람에게만 따뜻해요',
};

const BREAD_TRAITS: string[] = [
  '담백하고 표현이 과하지 않음',
  '처음엔 차가워 보이나 가까워질 수록 따뜻해짐',
  '질투가 많음',
];

// 썸네일은 ID 로 주소를 만들어 원격에서 불러온다. 저장소에 이미지를 두지 않는다.
const RECOMMENDED_VIDEO: RecommendedVideo | null = {
  title: '[비치키] 원하면서 도망치는 이유',
  youtubeId: 'fhYqGTqvd7A',
};

/**
 * 내 성향 화면. Figma "Luvin-Design" / `내 성향-우린` (5747:4183).
 *
 * 상단 26 은 상태바(44) 아래 여백이라 SafeArea 와 합치면 시안의 top 70 이 된다.
 * 홈 화면과 같은 방식이다.
 */
export default function BreadScreen() {
  function handleBackPress() {
    // 탭으로 들어온 경우가 정상 경로고, 딥링크로 바로 열렸으면 돌아갈 곳이 없다.
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[20px] px-[30px] pb-[24px] pt-[26px]"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          accessibilityRole="button"
          className="w-full flex-row items-center gap-[4px]"
          onPress={handleBackPress}
        >
          {/* Figma 도 `uit:angle-up` 을 -90도 돌려 뒤로가기로 쓴다. */}
          <View className="-rotate-90">
            <AngleUpIcon />
          </View>
          <Text variant="body-s" className="text-default-black">
            돌아가기
          </Text>
        </Pressable>

        <View className="w-full flex-col items-center gap-[40px]">
          <View className="w-full flex-col items-center gap-[24px]">
            <Text variant="heading-h2" className="text-center text-default-black">
              나의 반죽 알아보기
            </Text>
            {MY_PROFILE ? <MyProfileCard profile={MY_PROFILE} /> : <BreadSurveyPromptCard />}
            {MY_PROFILE ? <BreadTraitList traits={BREAD_TRAITS} /> : null}
          </View>

          {RECOMMENDED_VIDEO ? (
            <View className="w-full flex-col items-start gap-[12px]">
              {/* Figma 에서 이 줄만 변수 바인딩 없이 #000000 이라 default/black 토큰으로 맞췄다. */}
              <Text variant="body-s" className="text-default-black">
                내 반죽에 맞는 심리학 영상 컨텐츠 추천
              </Text>
              <RecommendedVideoCard video={RECOMMENDED_VIDEO} />
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="bread" />
      </View>
    </Screen>
  );
}
