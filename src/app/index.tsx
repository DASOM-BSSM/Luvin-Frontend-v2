import { ScrollView, View } from 'react-native';

import ProfileIcon from '@/src/assets/icons/ProfileIcon';
import LuvinLogo from '@/src/assets/images/LuvinLogo';
import BottomNav from '@/src/components/bottom-nav';
import Screen from '@/src/components/ui/screen';
import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import BreadSurveyPromptCard from '@/src/features/home/components/bread-survey-prompt-card';
import CreateQuestionCard from '@/src/features/home/components/create-question-card';
import DiaryPreviewCard from '@/src/features/home/components/diary-preview-card';
import DiaryStartCard from '@/src/features/home/components/diary-start-card';
import EpisodeEmptyCard from '@/src/features/home/components/episode-empty-card';
import EpisodeThumbnailCard from '@/src/features/home/components/episode-thumbnail-card';
import MyProfileCard from '@/src/features/home/components/my-profile-card';
import type { BreadProfile, DiaryPreview, WeeklyEpisode } from '@/src/features/home/types';

// API 연동 전. 세 상수를 null 로 바꾸면 빵을 만들기 전 상태가 된다.
const MY_PROFILE: BreadProfile | null = null;

const WEEKLY_EPISODE: WeeklyEpisode | null = null;

const DIARY_PREVIEW: DiaryPreview | null = null;

export default function HomeScreen() {
  const hasBread = MY_PROFILE !== null;

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
          {MY_PROFILE ? <MyProfileCard profile={MY_PROFILE} /> : <BreadSurveyPromptCard />}
        </View>

        <View className="w-full flex-col items-start gap-[12px]">
          <SectionHeader
            title="이번주 에피소드"
            actionLabel={hasBread ? '러빈지옥 바로가기→' : undefined}
          />
          {WEEKLY_EPISODE ? (
            <EpisodeThumbnailCard episode={WEEKLY_EPISODE} />
          ) : (
            <EpisodeEmptyCard />
          )}
        </View>

        <View className="w-full flex-col items-start gap-[12px]">
          <SectionHeader
            title={hasBread ? '쫀쫀한 조합들' : '감정일기'}
            actionLabel={hasBread ? '감정일기 바로가기→' : undefined}
          />
          {DIARY_PREVIEW ? (
            <>
              <DiaryPreviewCard diary={DIARY_PREVIEW} />
              <CreateQuestionCard />
            </>
          ) : (
            <DiaryStartCard />
          )}
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="home" />
      </View>
    </Screen>
  );
}
