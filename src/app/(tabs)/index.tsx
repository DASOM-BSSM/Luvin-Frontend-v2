import { router, useNavigation, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import ProfileIcon from '@/src/assets/icons/ProfileIcon';
import LuvinLogo from '@/src/assets/images/LuvinLogo';
import Screen from '@/src/components/ui/screen';
import SectionHeader from '@/src/components/ui/section-header';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import BreadSurveyPromptCard from '@/src/features/home/components/bread-survey-prompt-card';
import EpisodeCardSkeleton from '@/src/features/home/components/episode-card-skeleton';
import EpisodeEmptyCard from '@/src/features/home/components/episode-empty-card';
import EpisodeThumbnailCard from '@/src/features/home/components/episode-thumbnail-card';
import MyProfileCard from '@/src/features/home/components/my-profile-card';
import { resetToOnboarding } from '@/src/features/auth/lib/reset-to-onboarding';
import { useAuthStore } from '@/src/features/auth/store/auth-store';
import useBreadProfile from '@/src/features/bread/hooks/use-bread-profile';
import GroupFeedSection from '@/src/features/diaries/components/group-feed-section';
import type { RoomId } from '@/src/features/diaries/types';
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';
import InfernoUnlockNotice, {
  type UnlockTarget,
} from '@/src/features/inferno/components/inferno-unlock-notice';
import {
  INFERNO_EPISODE_HREFS,
  infernoIntroHref,
} from '@/src/features/inferno/constants/routes';
import { COMPLETED_SEASON_STATUS, SEASON_STAGE_TITLES } from '@/src/features/inferno/constants/season';
import NewSeasonCard from '@/src/features/oven/components/new-season-card';
import useCreateSeason from '@/src/features/inferno/hooks/use-create-season';
import useStartNextSeason from '@/src/features/inferno/hooks/use-start-next-season';
import useInfernoProgress from '@/src/features/inferno/hooks/use-inferno-progress';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import { isPreviousCompleting } from '@/src/features/inferno/utils/completion';
import { episodeAccess } from '@/src/features/inferno/utils/episode-unlock';
import { isStoryMock } from '@/src/features/inferno/api/story';
import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import { isProfileRequiredError } from '@/src/features/inferno/utils/is-profile-required-error';
import { findNextInfernoEpisode } from '@/src/features/inferno/utils/progress';
import { isAgeOrGenderMissing } from '@/src/features/my-page/utils/profile-completeness';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';
import useMySurveyResult from '@/src/features/survey/hooks/use-my-survey-result';

// 내 반죽은 useBreadStore, 이번주 에피소드는 useInfernoStore 에서 나온다.

/** 시즌 마지막 회차. 목 모드에서 시즌이 끝났는지 볼 때 쓴다. */
const LAST_EPISODE_ORDER = 10;

/** 나이·성별 안내의 버튼 문구. Figma `모달-우린` (6602:3957). */
const PROFILE_ACTION_LABEL = '마이페이지';

export default function HomeScreen() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrating = useAuthStore((state) => state.isHydrating);
  const { profile } = useBreadProfile();
  const hasBread = profile !== null;
  const [isNoticeVisible, setIsNoticeVisible] = useState(false);
  const [isProfileRequiredVisible, setIsProfileRequiredVisible] = useState(false);
  const myProfileQuery = useMyProfile();
  const storyQuery = useStoryState();
  const navigation = useNavigation();
  const [unlockTarget, setUnlockTarget] = useState<UnlockTarget | null>(null);
  /** 들어가기가 실패했을 때 다시 시도할 곳. null 이면 안내가 닫혀 있다. */
  const [failedEntry, setFailedEntry] = useState<{ href: Href; order?: number } | null>(null);
  // 기기 기록 + 서버 시즌 상태. 기기 기록만 보면 다시 로그인했을 때 처음부터로 돌아갔다(LUV-56).
  const { completedOrders, isSyncing: isProgressSyncing } = useInfernoProgress();
  const surveyResultQuery = useMySurveyResult();
  const createSeasonMutation = useCreateSeason();
  const startNextSeasonMutation = useStartNextSeason();
  /** 새 시즌 만들기가 실패했다는 안내가 떠 있는지. */
  const [isNewSeasonFailed, setIsNewSeasonFailed] = useState(false);

  // 로그인 안 된 채로 홈에 들어오면(딥링크 등) 온보딩으로 돌려보낸다. hydrate 가 끝나기
  // 전에는 아직 모르는 상태이므로 판단하지 않는다.
  //
  // 홈은 다른 화면 아래에 깔린 채로도 이 effect 가 돈다(예: 마이페이지에서 로그아웃). 그때 맨 위
  // 화면만 바꾸면 아래 화면이 남아 스택이 꼬이므로 전부 비우고 온보딩으로 보낸다(LUV-56).
  useEffect(() => {
    if (!isHydrating && !isAuthenticated) {
      resetToOnboarding();
    }
  }, [isHydrating, isAuthenticated]);

  // 홈은 다른 화면 아래 깔린 채 남아 있어서, 회차·오븐에서 돌아와도 예전 진행도를 그대로 보여줬다
  // (오븐에 다녀와야만 바뀌었다 — 사용자 지적). 홈이 다시 보일 때마다 진행도를 다시 받는다.
  // 화면 전환 이벤트 구독이라 effect 에서 한다.
  const refetchStory = storyQuery.refetch;
  useEffect(
    () =>
      navigation.addListener('focus', () => {
        void refetchStory();
      }),
    [navigation, refetchStory],
  );

  // 1화를 시작했으면(배경이 정해졌으면) 끝내지 않았어도 진행 중이다 — 가이드 ep0 을 없애서 "끝낸 회차가
  // 있는지"만 보면 1화를 보던 중에 "진행 중인 에피소드가 없어요"가 떴다. 시작 전에는 시작 버튼만 보인다.
  const hasStartedInferno = completedOrders.length > 0 || Boolean(storyQuery.data?.setting);
  const weeklyEpisode = hasStartedInferno ? findNextInfernoEpisode(completedOrders) : undefined;

  if (__DEV__) {
    // 홈 카드가 잘못된 회차를 보여준다는 신고를 조사하려고 실제 로컬 진행 기록을 찍는다 —
    // completedOrders 가 비어있지 않은데 잘못된 값이면 useInfernoStore.resetProgress 가
    // 실제로 안 먹은 것이고, [0,1]이 정말 들어있으면 로그인 이후 이 계정에서 0/1화를
    // 진짜로 완료 처리한 것이다(버그가 아니라 정상 진행).
    console.log(
      `[HomeScreen] completedOrders=${JSON.stringify(completedOrders)} weeklyEpisode=${weeklyEpisode?.order}`,
    );
  }

  // 본문이 아직 없는 회차는 눌러도 갈 곳이 없다. 그런 회차는 카드를 누르지 못하게 둔다.
  const canOpenWeeklyEpisode =
    weeklyEpisode !== undefined && INFERNO_EPISODE_HREFS[weeklyEpisode.order] !== undefined;

  /**
   * 러빈지옥으로 들어가는 유일한 문.
   *
   * 반죽이 없으면 시작할 수 없다. 막기만 하지 않고 설문으로 갈 길을 열어 준다.
   * 나이·성별이 없어도 시작할 수 없다. 안내(Figma `모달-우린` 6602:3711)를 띄우고 마이페이지
   * 수정 화면으로 보낸다. 프로필을 아직 못 받았으면 막지 않는다 — 서버가 막으면 아래
   * PROFILE_REQUIRED·회차 안의 AGE_REQUIRED 로 다시 잡힌다.
   * 시작 버튼이든 이번주 에피소드 카드든 반드시 여기를 지나게 해서, 들어가는 입구가 늘어도
   * 검사를 빠뜨리지 않게 한다.
   */
  function openInferno(href: Href, order?: number) {
    if (!hasBread) {
      setIsNoticeVisible(true);
      return;
    }

    if (myProfileQuery.data && isAgeOrGenderMissing(myProfileQuery.data)) {
      setIsProfileRequiredVisible(true);
      return;
    }

    // 목 모드는 회차 진행을 목 서버가 들고 있어서 실제 서버에 시즌을 만들지 않는다. 실제 서버 시즌 상태가 섞이면
    // 목 진행도와 어긋나 들어가지 못했다(6화가 안 열린다는 사용자 지적).
    if (isStoryMock) {
      const finished = storyQuery.data?.completedOrders.includes(LAST_EPISODE_ORDER) === true;
      handleSeasonReady(finished ? COMPLETED_SEASON_STATUS : 'IN_PROGRESS', href, order);
      return;
    }

    // 시즌이 이미 있으면 서버가 그대로 돌려주므로(SHARED_API_CONTRACT.md §7) 매번 불러도
    // 안전하다 — 처음 들어가는 사람만 실제로 새로 만들어진다.
    const surveyResultId = surveyResultQuery.data?.resultId;
    if (!surveyResultId) {
      // 예전에는 여기서 조용히 돌아가서 카드를 눌러도 아무 일도 없었다. 설문 결과를 다시 받고 안내한다.
      void surveyResultQuery.refetch();
      setFailedEntry({ href, order });
      return;
    }

    createSeasonMutation.mutate(surveyResultId, {
      onSuccess: (season) => handleSeasonReady(season.status, href, order),
      onError: (error) => handleCreateSeasonError(error, href, order),
    });
  }

  function handleEnterFailedClose() {
    setFailedEntry(null);
  }

  function handleEnterRetryPress() {
    const entry = failedEntry;
    setFailedEntry(null);
    if (entry) openInferno(entry.href, entry.order);
  }

  // [DRAFT] 시즌은 사용자마다 하나이고 10화가 끝나면 끝이다(사용자 결정). 끝난 시즌이면 새 시즌을
  // 열지 않고, 최종 리포트와 지난 회차 다시 보기가 있는 오븐 회차 목록으로 보낸다.
  //
  // 토큰이 필요한 회차(4화 이상, 아직 안 엶)는 들어가기 전에 토큰 안내를 띄운다(사용자 결정).
  // 진행도를 아직 못 받았으면 막지 않는다 — 회차 안의 열기 화면이 대신 받는다.
  function handleSeasonReady(status: string, href: Href, order?: number) {
    if (status === COMPLETED_SEASON_STATUS) {
      router.push('/oven');
      return;
    }

    // 앞 회차를 서버가 아직 정리 중이면 열기를 서버가 막는다. 회차 화면이 정리를 기다린 뒤 열기를 묻는다.
    if (
      order !== undefined &&
      storyQuery.data &&
      episodeAccess(order, storyQuery.data) === 'locked' &&
      !isPreviousCompleting(order, storyQuery.data)
    ) {
      setUnlockTarget({ order, href });
      return;
    }

    router.push(href);
  }

  function handleUnlockClose() {
    setUnlockTarget(null);
  }

  // 성별이 없으면 서버가 시즌 생성을 막는다(409 PROFILE_REQUIRED). 로그로만 남기지 않고
  // 앞의 나이·성별 안내를 그대로 띄워 설정 화면으로 보낸다.
  // 그 밖의 실패도 조용히 넘기지 않고 다시 시도할 수 있게 안내한다(§11).
  function handleCreateSeasonError(error: unknown, href: Href, order?: number) {
    if (isProfileRequiredError(error)) {
      setIsProfileRequiredVisible(true);
      return;
    }
    setFailedEntry({ href, order });
  }

  function handleProfileRequiredClose() {
    setIsProfileRequiredVisible(false);
  }

  function handleProfileRequiredMyPagePress() {
    setIsProfileRequiredVisible(false);
    router.push('/my-page/edit');
  }

  function handleInfernoStartPress() {
    openInferno('/inferno');
  }

  // 이번주 에피소드는 시작 화면부터 본다. 본문으로 바로 뛰지 않는 건 시작 버튼과 같은 흐름이다.
  function handleWeeklyEpisodePress() {
    if (!weeklyEpisode) {
      return;
    }

    openInferno(infernoIntroHref(weeklyEpisode.order), weeklyEpisode.order);
  }

  function handleNoticeClose() {
    setIsNoticeVisible(false);
  }

  function handleNoticeSurveyPress() {
    setIsNoticeVisible(false);
    router.push('/survey');
  }

  // 10화까지 끝낸 시즌. 홈은 이번주 회차 대신 "나의 에피소드"로 그 시즌 카드를 보여주고, 누르면 러빈지옥 홈(오븐)으로
  // 간다(사용자 결정, 시안 이미지). 카드 제목은 "SEASON 01" 이 아니라 배경 제목("In School").
  // [DRAFT] 이제 시즌이 여러 개라 이 카드는 "새로운 시즌 만들기"로 바뀌었다(사용자 결정). 끝난 시즌의 리포트와
  // 지난 회차는 그대로 "러빈지옥 바로가기→"(오븐)에서 본다.
  const seasonSetting = storyQuery.data?.setting;
  const finishedSeasonTitle =
    storyQuery.data?.completedOrders.includes(LAST_EPISODE_ORDER) && seasonSetting
      ? SEASON_STAGE_TITLES[seasonSetting]
      : undefined;

  function handleOvenNavigate() {
    router.push('/oven');
  }

  /**
   * [DRAFT] 10화까지 끝낸 뒤 "새로운 시즌 만들기"(사용자 결정). 러빈지옥 입구(openInferno)와 같은 검사를
   * 지나고, 새 시즌이 열리면 1화 시작 화면으로 바로 간다. 새 시즌도 지금 설문 결과(내 반죽)로 만든다.
   */
  function handleNewSeasonPress() {
    if (!hasBread) {
      setIsNoticeVisible(true);
      return;
    }

    if (myProfileQuery.data && isAgeOrGenderMissing(myProfileQuery.data)) {
      setIsProfileRequiredVisible(true);
      return;
    }

    const surveyResultId = surveyResultQuery.data?.resultId;
    if (!surveyResultId) {
      void surveyResultQuery.refetch();
      setIsNewSeasonFailed(true);
      return;
    }

    startNextSeasonMutation.mutate(surveyResultId, {
      onSuccess: handleNewSeasonReady,
      onError: handleNewSeasonError,
    });
  }

  function handleNewSeasonReady() {
    router.push(infernoIntroHref(1));
  }

  function handleNewSeasonError(error: unknown) {
    if (isProfileRequiredError(error)) {
      setIsProfileRequiredVisible(true);
      return;
    }
    setIsNewSeasonFailed(true);
  }

  function handleNewSeasonFailedClose() {
    setIsNewSeasonFailed(false);
  }

  function handleNewSeasonRetryPress() {
    setIsNewSeasonFailed(false);
    handleNewSeasonPress();
  }

  function handleDiaryStartPress() {
    router.push('/diaries');
  }

  function handleDiaryGroupPress(roomId: RoomId) {
    router.push({ pathname: '/diaries/groups/[roomId]', params: { roomId } });
  }

  function handleProfilePress() {
    router.push('/my-page');
  }

  return (
    <Screen edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[40px] px-[30px] pb-[24px] pt-[26px]"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full flex-col items-start gap-[28px]">
          <View className="w-full flex-col items-start gap-[24px]">
            <View className="w-full flex-row items-start justify-between">
              <LuvinLogo />
              <Pressable accessibilityRole="button" accessibilityLabel="마이페이지" onPress={handleProfilePress}>
                <ProfileIcon />
              </Pressable>
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
          {profile ? <MyProfileCard profile={profile} /> : <BreadSurveyPromptCard />}
        </View>

        <View className="w-full flex-col items-start gap-[12px]">
          <SectionHeader
            title={finishedSeasonTitle ? '나의 에피소드' : '이번주 에피소드'}
            actionLabel={hasBread ? '러빈지옥 바로가기→' : undefined}
            onActionPress={hasBread ? handleOvenNavigate : undefined}
          />
          {isProgressSyncing ? (
            <EpisodeCardSkeleton />
          ) : finishedSeasonTitle ? (
            <NewSeasonCard
              finishedSeasonTitle={finishedSeasonTitle}
              isPending={startNextSeasonMutation.isPending}
              onCreatePress={handleNewSeasonPress}
            />
          ) : weeklyEpisode ? (
            <EpisodeThumbnailCard
              episode={weeklyEpisode}
              onPress={canOpenWeeklyEpisode ? handleWeeklyEpisodePress : undefined}
            />
          ) : (
            <EpisodeEmptyCard onStartPress={handleInfernoStartPress} />
          )}
        </View>

        {/* 감정일기 탭과 같은 섹션(LUV-90): 그룹이 없으면 "Emodi 감정일기" + 시작하기 카드, 있으면
            "쫀쫀한 조합들" + 최신 그룹 일기 카드(반응 가능) + 그 그룹으로 가는 바로가기. */}
        <GroupFeedSection
          shortcutLabel="감정일기 바로가기→"
          onStartPress={handleDiaryStartPress}
          onGroupPress={handleDiaryGroupPress}
        />
      </ScrollView>


      <InfernoNoticeModal
        visible={isNoticeVisible}
        onClose={handleNoticeClose}
        onActionPress={handleNoticeSurveyPress}
      />
      <InfernoNoticeModal
        visible={failedEntry !== null}
        message={ERROR_MESSAGES.infernoEnterFailed}
        actionLabel="다시 시도"
        isActionDisabled={createSeasonMutation.isPending}
        onClose={handleEnterFailedClose}
        onActionPress={handleEnterRetryPress}
      />
      <InfernoNoticeModal
        visible={isNewSeasonFailed}
        message={ERROR_MESSAGES.newSeasonFailed}
        actionLabel="다시 시도"
        isActionDisabled={startNextSeasonMutation.isPending}
        onClose={handleNewSeasonFailedClose}
        onActionPress={handleNewSeasonRetryPress}
      />
      <InfernoUnlockNotice
        target={unlockTarget}
        tokenCost={storyQuery.data?.episodeTokenCost ?? null}
        onClose={handleUnlockClose}
      />
      <InfernoNoticeModal
        visible={isProfileRequiredVisible}
        message={ERROR_MESSAGES.ageGenderRequired}
        actionLabel={PROFILE_ACTION_LABEL}
        onClose={handleProfileRequiredClose}
        onActionPress={handleProfileRequiredMyPagePress}
      />
    </Screen>
  );
}
