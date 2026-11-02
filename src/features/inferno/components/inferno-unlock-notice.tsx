/**
 * [DRAFT] 회차에 들어가기 전에 띄우는 토큰 안내. Figma `모달-우린` (6602:3711) 의 NOTICE 모양을 그대로 쓴다
 * (사용자 결정 — 회차 안의 열기 화면 대신 들어가기 전에 모달로 묻는다).
 *
 * - 처음: "N화를 보려면 토큰 C개가 필요해요" + 보유 토큰, 버튼 "토큰 C개로 열기".
 * - 열기 성공: 모달을 닫고 회차 시작 화면으로 간다.
 * - 토큰 부족(409 `INSUFFICIENT_TOKENS`): "토큰이 부족해요", 버튼 "미니게임으로 토큰 모으기".
 * - 그 밖의 실패: 실패 문구, 버튼 "다시 시도".
 *
 * 화면 이동은 모달이 완전히 닫힌 뒤(iOS onDismiss) 한다. 회차 시작 화면은 가로라서 모달이 닫히는 중에
 * 이동하면 iOS 가 회전을 무시한다(inferno-episode-blocker 주석 참고). 안드로이드는 바로 이동한다.
 *
 * 토큰 개수는 서버 값만 쓴다. 아직 모르면 숫자 없이 안내한다.
 */
import { router, type Href } from 'expo-router';
import { useRef } from 'react';
import { Platform } from 'react-native';

import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';
import useUnlockEpisode from '@/src/features/inferno/hooks/use-unlock-episode';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

const MINI_GAME_HREF: Href = '/luvin-hell';

export interface UnlockTarget {
  order: number;
  /** 열고 나서 갈 곳. 보통 그 회차 시작 화면. */
  href: Href;
}

interface InfernoUnlockNoticeProps {
  /** null 이면 닫혀 있다. */
  target: UnlockTarget | null;
  /** 서버 `episodeTokenCost`. 아직 모르면 null. */
  tokenCost: number | null;
  onClose: () => void;
}

export default function InfernoUnlockNotice({ target, tokenCost, onClose }: InfernoUnlockNoticeProps) {
  /** 모달이 다 닫힌 뒤 갈 곳(iOS). */
  const pendingHref = useRef<Href | null>(null);
  const { balance, unlock } = useUnlockEpisode(target?.order ?? 0, handleUnlocked);
  const isShort = getStoryErrorCode(unlock.error) === 'INSUFFICIENT_TOKENS';

  function leaveTo(href: Href) {
    if (Platform.OS === 'ios') {
      pendingHref.current = href;
      onClose();
      return;
    }
    onClose();
    router.push(href);
  }

  function handleUnlocked() {
    if (target) leaveTo(target.href);
  }

  function handleActionPress() {
    if (isShort) {
      leaveTo(MINI_GAME_HREF);
      return;
    }
    if (unlock.isPending) return;
    unlock.mutate();
  }

  function handleClose() {
    unlock.reset();
    onClose();
  }

  function handleDismiss() {
    unlock.reset();
    const href = pendingHref.current;
    pendingHref.current = null;
    if (href) router.push(href);
  }

  const order = target?.order ?? 0;
  // 보유 토큰은 안내 문구보다 한 단계 작게 따로 붙인다(사용자 요청).
  // 실패 안내("회차를 열지 못했어요")에는 붙이지 않는다. 토큰 부족은 실패지만 잔액이 핵심이라 붙인다.
  const showBalance = balance.isSuccess && (isShort || !unlock.isError);
  const balanceLine = showBalance ? `보유 토큰 🥐x${balance.data}` : undefined;
  const message = isShort
    ? ERROR_MESSAGES.insufficientTokens
    : unlock.isError
      ? ERROR_MESSAGES.unlockFailed
      : `${order}화를 보려면 토큰${tokenCost === null ? '이' : ` ${tokenCost}개가`} 필요해요`;
  const actionLabel = isShort
    ? '미니게임으로 토큰 모으기'
    : unlock.isPending
      ? '여는 중…'
      : unlock.isError
        ? '다시 시도'
        : tokenCost === null
          ? '토큰으로 열기'
          : `토큰 ${tokenCost}개로 열기`;

  return (
    <InfernoNoticeModal
      visible={target !== null}
      message={message}
      subMessage={balanceLine}
      actionLabel={actionLabel}
      isActionDisabled={unlock.isPending}
      onClose={handleClose}
      onActionPress={handleActionPress}
      onDismiss={handleDismiss}
    />
  );
}
