/**
 * [DRAFT] 회차 열기 화면. 4화 이상을 처음 볼 때 필요한 토큰 개수, 보유 토큰, "열기" 버튼을 보여준다.
 * 소금빵(무료)은 앞 회차를 끝낸 뒤 하루가 지나야 열 수 있고, 식빵(유료)은 바로 열 수 있다(LUV-116).
 * 소금빵이 모자라면 미니게임으로, 식빵이 모자라면 구매 화면으로 보낸다.
 * 시안이 없어 기존 토큰 표기(🥐 소금빵 · 🍞 식빵)와 Button 으로만 그린다. 토큰 개수는 서버 값만 쓴다.
 */
import { router } from 'expo-router';
import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import useStoryState from '@/src/features/inferno/hooks/use-story-state';
import useUnlockEpisode from '@/src/features/inferno/hooks/use-unlock-episode';
import { formatEpisodeNumber } from '@/src/features/inferno/utils/format';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';
import { formatRemaining, getUnlockOptions } from '@/src/features/inferno/utils/unlock-options';
import useNow from '@/src/hooks/use-now';

interface InfernoEpisodeUnlockViewProps {
  order: number;
  /** 서버 `episodeTokenCost`. 아직 모르면 null — 숫자 없이 안내한다. */
  tokenCost: number | null;
  onUnlocked: () => void;
}

export default function InfernoEpisodeUnlockView({
  order,
  tokenCost,
  onUnlocked,
}: InfernoEpisodeUnlockViewProps) {
  const story = useStoryState();
  const { balance, unlock } = useUnlockEpisode(order, onUnlocked);
  const now = useNow(true);
  const options = getUnlockOptions({
    cost: tokenCost,
    salt: balance.data?.salt,
    bread: balance.data?.bread,
    nextUnlockAt: story.data?.nextUnlockAt ?? null,
    now,
  });
  const code = getStoryErrorCode(unlock.error);
  const isShort = code === 'INSUFFICIENT_TOKENS';
  const isFailed = unlock.isError && !isShort && code !== 'EPISODE_COOLDOWN';
  const paidWithBread = unlock.variables === 'BREAD';
  const needsBreadShop = options.isWaiting ? !options.canPayBread : isShort && paidWithBread;
  const needsMiniGame = !options.isWaiting && (isShort ? !paidWithBread : !options.canPaySalt);
  const costText = tokenCost === null ? '' : ` ${tokenCost}개`;

  function handleUnlockPress() {
    if (unlock.isPending) return;
    unlock.mutate(options.isWaiting ? 'BREAD' : 'SALT');
  }

  function handleMiniGamePress() {
    router.push('/luvin-hell');
  }

  function handleBreadShopPress() {
    router.push('/bread-shop');
  }

  return (
    <View className="flex-1 items-center justify-center gap-[12px] px-[50px]">
      <Text variant="body-s" className="text-pink-500">
        {formatEpisodeNumber(order)}
      </Text>
      <Text variant="heading-h4" className="text-center text-text-primary">
        {options.isWaiting
          ? `이 회차는 ${formatRemaining(options.remainingMs)} 뒤에 열려요`
          : `이 회차를 열려면 소금빵${tokenCost === null ? '이' : `${costText}가`} 필요해요`}
      </Text>
      <Text variant="body-s" className="text-text-muted">
        {balance.isPending
          ? '보유 토큰을 불러오는 중…'
          : balance.isError
            ? '보유 토큰을 불러오지 못했어요'
            : `보유 🥐 소금빵 x${balance.data.salt} · 🍞 식빵 x${balance.data.bread}`}
      </Text>
      <Text variant="body-xs" className="text-center text-text-muted">
        {options.isWaiting
          ? '식빵을 쓰면 기다리지 않고 바로 열 수 있어요'
          : '한 번 열면 다시 볼 때는 토큰을 쓰지 않아요'}
      </Text>
      {isShort ? (
        <Text variant="body-m" className="text-state-error">
          {paidWithBread ? ERROR_MESSAGES.insufficientBread : ERROR_MESSAGES.insufficientSaltBread}
        </Text>
      ) : null}
      {isFailed ? (
        <Text variant="body-s" className="text-state-error">
          {ERROR_MESSAGES.unlockFailed}
        </Text>
      ) : null}
      {needsBreadShop ? (
        <Button label="식빵 구매하기" onPress={handleBreadShopPress} />
      ) : needsMiniGame ? (
        <Button label="미니게임으로 소금빵 모으기" onPress={handleMiniGamePress} />
      ) : (
        <Button
          label={
            unlock.isPending
              ? '여는 중…'
              : options.isWaiting
                ? `식빵${costText}로 바로 열기`
                : `소금빵${costText}로 열기`
          }
          disabled={unlock.isPending}
          onPress={handleUnlockPress}
        />
      )}
    </View>
  );
}
