/**
 * [DRAFT] 재생할 블록이 아직 없을 때의 본문: 로딩·생성 대기·오류(InfernoEpisodeStateView).
 *
 * 409 `AGE_REQUIRED` 면 홈과 같은 NOTICE 안내(Figma `모달-우린` 6602:3711)를 바로 띄우고 마이페이지
 * 수정 화면으로 보낸다. 회차 안에서 따로 입력받는 바텀시트는 없앴다(사용자 결정). 닫으면 오류 화면의
 * "마이페이지" 버튼으로 다시 연다. 마이페이지에서 저장하고 돌아오면 본문을 다시 요청한다.
 */
import { router, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import InfernoEpisodeStateView from '@/src/features/inferno/components/inferno-episode-state-view';
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

/** Figma `모달-우린` (6602:3957). */
const MY_PAGE_ACTION_LABEL = '마이페이지';

interface InfernoEpisodeBlockerProps {
  order: number;
  isLoading: boolean;
  isGenerating: boolean;
  error: unknown;
  onRetry: () => void;
  onShowReport: () => void;
}

export default function InfernoEpisodeBlocker({
  order,
  isLoading,
  isGenerating,
  error,
  onRetry,
  onShowReport,
}: InfernoEpisodeBlockerProps) {
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const isAgeRequired = getStoryErrorCode(error) === 'AGE_REQUIRED';
  const navigation = useNavigation();
  /** 마이페이지로 보냈는지. 돌아왔을 때만 다시 요청하려고 둔다(다시 그릴 때마다 요청하지 않게 ref). */
  const sentToMyPage = useRef(false);
  /** iOS 에서 모달이 다 닫히면 마이페이지로 가야 하는지. */
  const pendingMyPage = useRef(false);

  // 마이페이지에서 돌아오면(화면이 다시 보이면) 나이·성별이 정해졌을 수 있어서 본문을 다시 요청한다.
  // 화면 전환 이벤트를 구독하는 일이라 effect 에서 한다.
  useEffect(
    () =>
      navigation.addListener('focus', () => {
        if (!sentToMyPage.current) return;
        sentToMyPage.current = false;
        onRetry();
      }),
    [navigation, onRetry],
  );

  function handleAgeRequired() {
    setNoticeDismissed(false);
  }

  function handleNoticeClose() {
    setNoticeDismissed(true);
  }

  // 마이페이지는 세로 화면이라 이동하면 화면이 세로로 돈다. 모달이 닫히는 중에 이동하면 iOS 가 회전을
  // 무시해서 마이페이지가 가로로 눌린 채 멈춰 보였다(시뮬레이터에서 확인). 그래서 iOS 는 모달이 완전히
  // 닫힌 뒤(onDismiss) 이동한다. 안드로이드는 onDismiss 가 없고 이 문제도 없어서 바로 이동한다.
  function goToMyPage() {
    sentToMyPage.current = true;
    router.push('/my-page/edit');
  }

  function handleMyPagePress() {
    setNoticeDismissed(true);
    if (Platform.OS === 'ios') pendingMyPage.current = true;
    else goToMyPage();
  }

  function handleNoticeDismiss() {
    if (!pendingMyPage.current) return;
    pendingMyPage.current = false;
    goToMyPage();
  }

  return (
    <>
      <InfernoEpisodeStateView
        order={order}
        isLoading={isLoading}
        isGenerating={isGenerating}
        error={error}
        onRetry={onRetry}
        onShowReport={onShowReport}
        onAgeRequired={handleAgeRequired}
      />
      <InfernoNoticeModal
        visible={isAgeRequired && !noticeDismissed}
        message={ERROR_MESSAGES.ageGenderRequired}
        actionLabel={MY_PAGE_ACTION_LABEL}
        onClose={handleNoticeClose}
        onActionPress={handleMyPagePress}
        onDismiss={handleNoticeDismiss}
      />
    </>
  );
}
