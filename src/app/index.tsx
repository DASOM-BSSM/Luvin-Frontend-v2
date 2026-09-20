import { router } from 'expo-router';
import { useState } from 'react';
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
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';
import {
  INFERNO_EPISODE_HREFS,
  infernoIntroHref,
} from '@/src/features/inferno/constants/routes';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { findNextInfernoEpisode } from '@/src/features/inferno/utils/progress';
import type { BreadProfile, DiaryPreview } from '@/src/features/home/types';

// API 연동 전. 두 상수를 값으로 채우면 반죽이 있고 감정일기가 쌓인 상태가 된다.
// 이번주 에피소드는 상수가 아니라 러빈지옥 진행 상태(useInfernoStore)에서 나온다.
const MY_PROFILE: BreadProfile | null = null;

const DIARY_PREVIEW: DiaryPreview | null = null;

export default function HomeScreen() {
  const hasBread = MY_PROFILE !== null;
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);
  const completedOrders = useInfernoStore((state) => state.completedOrders);

  // ep0 을 끝내기 전에는 보여줄 회차가 없다. 끝내면 다음 회차가 이번주 에피소드가 된다.
  const hasStartedInferno = completedOrders.length > 0;
  const weeklyEpisode = hasStartedInferno ? findNextInfernoEpisode(completedOrders) : undefined;

  // 본문이 아직 없는 회차는 눌러도 갈 곳이 없다. 그런 회차는 카드를 누르지 못하게 둔다.
  const canOpenWeeklyEpisode =
    weeklyEpisode !== undefined && INFERNO_EPISODE_HREFS[weeklyEpisode.order] !== undefined;

  // 반죽이 없으면 러빈지옥을 시작할 수 없다. 막기만 하지 않고 설문으로 갈 길을 열어 준다.
  function handleInfernoStartPress() {
    if (hasBread) {
      router.push('/inferno');
      return;
    }

    setIsNoticeVisible(true);
  }

  // 이번주 에피소드는 시작 화면부터 본다. 본문으로 바로 뛰지 않는 건 ep0 과 같은 흐름이다.
  function handleWeeklyEpisodePress() {
    if (!weeklyEpisode) {
      return;
    }

    router.push(infernoIntroHref(weeklyEpisode.order));
  }

  function handleNoticeClose() {
    setIsNoticeVisible(false);
  }

  function handleNoticeSurveyPress() {
    setIsNoticeVisible(false);
    router.push('/survey');
  }

  function handleOvenNavigate() {
    router.push('/oven');
  }

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
            onActionPress={hasBread ? handleOvenNavigate : undefined}
          />
          {weeklyEpisode ? (
            <EpisodeThumbnailCard
              episode={weeklyEpisode}
              onPress={canOpenWeeklyEpisode ? handleWeeklyEpisodePress : undefined}
            />
          ) : (
            <EpisodeEmptyCard onStartPress={handleInfernoStartPress} />
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

      <InfernoNoticeModal
        visible={isNoticeVisible}
        onClose={handleNoticeClose}
        onSurveyPress={handleNoticeSurveyPress}
      />
    </Screen>
  );
}
