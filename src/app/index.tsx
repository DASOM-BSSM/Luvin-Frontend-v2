import { ScrollView, View } from 'react-native';

import ProfileIcon from '@/src/assets/icons/ProfileIcon';
import LuvinLogo from '@/src/assets/images/LuvinLogo';
import BottomNav from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';
import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import DiaryPreviewCard from '@/src/features/home/components/diary-preview-card';
import EpisodeThumbnailCard from '@/src/features/home/components/episode-thumbnail-card';
import MyProfileCard from '@/src/features/home/components/my-profile-card';
import type { BreadProfile, DiaryPreview, WeeklyEpisode } from '@/src/features/home/types';

// HTTP 클라이언트가 아직 정해지지 않아 API 연동 전이다(AGENTS.md §2).
// 값은 Figma `메인-우린` 시안의 내용을 그대로 쓰고, 서버가 붙으면 이 상수만 쿼리로 교체한다.
const MY_PROFILE: BreadProfile = {
  type: 'salt',
  state: 'dough',
  name: '쫀쫀한 소금빵 반죽',
  description: '저는 오직 제 사람에게만 따뜻해요',
};

const WEEKLY_EPISODE: WeeklyEpisode = {
  order: 1,
  title: '안녕하세요 소금빵입니다!',
};

const DIARY_PREVIEW: DiaryPreview = {
  authorType: 'castella',
  authorState: 'dough',
  authorName: '쫀쫀한 카스테라',
  relativeTime: '1시간 전',
  message: '쫀쫀한 카스테라님이 15:00의 질문을 생성했어요!\n질문에 대한 나의 일기를 채워주세요',
};

export default function HomeScreen() {
  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[40px] px-[30px] pb-[24px] pt-[26px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full flex-col items-start gap-[28px]">
          <View className="w-full flex-col items-start gap-[24px]">
            <View className="w-full flex-row items-start justify-between">
              <LuvinLogo />
              <ProfileIcon />
            </View>
            <View className="w-full flex-col items-start px-[4px]">
              <Text variant="heading-h2" className="text-default-black">
                타이밍을 놓치기 전에,
              </Text>
              <Text variant="body-m" className="text-default-black">
                러빈과 함께 가장 따뜻한 사랑을 만들어요
              </Text>
            </View>
          </View>
          <MyProfileCard profile={MY_PROFILE} />
        </View>

        <View className="w-full flex-col items-start gap-[12px]">
          <SectionHeader title="이번주 에피소드" actionLabel="러빈지옥 바로가기→" />
          <EpisodeThumbnailCard episode={WEEKLY_EPISODE} />
        </View>

        <View className="w-full flex-col items-start gap-[12px]">
          <SectionHeader title="쫀쫀한 조합들" actionLabel="감정일기 바로가기→" />
          <DiaryPreviewCard diary={DIARY_PREVIEW} />
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="home" />
      </View>
    </Screen>
  );
}
