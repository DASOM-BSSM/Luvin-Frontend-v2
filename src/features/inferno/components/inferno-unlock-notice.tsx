/**
 * [DRAFT] 회차에 들어가기 전에 띄우는 토큰 안내. Figma `모달-우린` (6602:3711) 의 NOTICE 모양을 그대로 쓴다
 * (사용자 결정 — 회차 안의 열기 화면 대신 들어가기 전에 모달로 묻는다).
 *
 * 토큰은 두 가지다(LUV-116). 소금빵(무료, 미니게임)은 앞 회차를 끝낸 뒤 하루가 지나야 열 수 있고,
 * 식빵(유료, 결제)은 기다리지 않고 바로 연다.
 *
 * - 열 수 있을 때: "N화를 보려면 소금빵 C개가 필요해요" + 보유 토큰, 버튼 "소금빵 C개로 열기".
 * - 하루 대기 중: "다음 에피소드까지 … 남았어요", 버튼 "식빵 C개로 바로 열기"(식빵이 없으면 "식빵 구매하기").
 * - 소금빵 부족: "소금빵이 부족해요", 버튼 "미니게임으로 소금빵 모으기".
 * - 그 밖의 실패: 실패 문구, 버튼 "다시 시도".
 * - 열기 성공: 모달을 닫고 회차 시작 화면으로 간다.
 *
 * 화면 이동은 모달이 완전히 닫힌 뒤(iOS onDismiss) 한다. 회차 시작 화면은 가로라서 모달이 닫히는 중에
 * 이동하면 iOS 가 회전을 무시한다(inferno-episode-blocker 주석 참고). 안드로이드는 바로 이동한다.
 *
 * 토큰 개수와 하루 기준 시각은 서버 값만 쓴다. 아직 모르면 숫자 없이 안내한다.
 */
import { router, type Href } from 'expo-router';
import { useRef } from 'react';
import { Platform } from 'react-native';

import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import InfernoNoticeModal from '@/src/features/inferno/components/inferno-notice-modal';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import useUnlockEpisode from '@/src/features/inferno/hooks/use-unlock-episode';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';
import { formatRemaining, getUnlockOptions } from '@/src/features/inferno/utils/unlock-options';
import useNow from '@/src/hooks/use-now';

const MINI_GAME_HREF: Href = '/luvin-hell';
const BREAD_SHOP_HREF: Href = '/bread-shop';

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
  const story = useStoryState();
  const { balance, unlock } = useUnlockEpisode(target?.order ?? 0, handleUnlocked);
  const now = useNow(target !== null);
  const options = getUnlockOptions({
    cost: tokenCost,
    salt: balance.data?.salt,
    bread: balance.data?.bread,
    nextUnlockAt: story.data?.nextUnlockAt ?? null,
    now,
  });

  const errorCode = getStoryErrorCode(unlock.error);
  const isShort = errorCode === 'INSUFFICIENT_TOKENS';
  const isFailed = unlock.isError && !isShort && errorCode !== 'EPISODE_COOLDOWN';
  const paidWithBread = unlock.variables === 'BREAD';
  // 소금빵이 모자라면(대기 중이 아닐 때) 미니게임, 식빵이 모자라면 구매 화면으로 보낸다.
  const needsBreadShop = options.isWaiting ? !options.canPayBread : isShort && paidWithBread;
  const needsMiniGame = !options.isWaiting && (isShort ? !paidWithBread : !options.canPaySalt);

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
    if (needsBreadShop) {
      leaveTo(BREAD_SHOP_HREF);
      return;
    }
    if (needsMiniGame) {
      leaveTo(MINI_GAME_HREF);
      return;
    }
    if (unlock.isPending) return;
    unlock.mutate(options.isWaiting ? 'BREAD' : 'SALT');
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
  const costText = tokenCost === null ? '' : ` ${tokenCost}개`;
  // 보유 토큰은 안내 문구보다 한 단계 작게 따로 붙인다(사용자 요청).
  // 실패 안내("회차를 열지 못했어요")에는 붙이지 않는다. 토큰 부족은 실패지만 잔액이 핵심이라 붙인다.
  const showBalance = balance.isSuccess && !isFailed;
  const balanceLine = showBalance
    ? `보유 🥐 소금빵 x${balance.data.salt} · 🍞 식빵 x${balance.data.bread}`
    : undefined;

  let message = `${order}화를 보려면 소금빵${tokenCost === null ? '이' : `${costText}가`} 필요해요`;
  if (isFailed) message = ERROR_MESSAGES.unlockFailed;
  else if (isShort) {
    message = paidWithBread ? ERROR_MESSAGES.insufficientBread : ERROR_MESSAGES.insufficientSaltBread;
  } else if (options.isWaiting) {
    message = `${order}화는 ${formatRemaining(options.remainingMs)} 뒤에 열려요`;
  }

  let actionLabel = `소금빵${costText}로 열기`;
  if (unlock.isPending) actionLabel = '여는 중…';
  else if (isFailed) actionLabel = '다시 시도';
  else if (needsBreadShop) actionLabel = '식빵 구매하기';
  else if (needsMiniGame) actionLabel = '미니게임으로 소금빵 모으기';
  else if (options.isWaiting) actionLabel = `식빵${costText}로 바로 열기`;

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
