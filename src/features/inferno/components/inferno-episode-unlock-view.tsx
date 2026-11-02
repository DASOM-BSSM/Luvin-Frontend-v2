/**
 * [DRAFT] 회차 열기 화면. 4화 이상을 처음 볼 때 필요한 토큰 개수, 보유 토큰, "열기" 버튼을 보여준다.
 * 토큰이 모자라면(409 `INSUFFICIENT_TOKENS`) "토큰이 부족해요"와 미니게임으로 가는 버튼을 띄운다.
 * 시안이 없어 기존 토큰 표기(🥐x n)와 Button 으로만 그린다. 토큰 개수는 서버 값만 쓴다.
 */
import { router } from 'expo-router';
import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import useUnlockEpisode from '@/src/features/inferno/hooks/use-unlock-episode';
import { formatEpisodeNumber } from '@/src/features/inferno/utils/format';
import { getStoryErrorCode } from '@/src/features/inferno/utils/story-error';

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
  const { balance, unlock } = useUnlockEpisode(order, onUnlocked);
  const code = getStoryErrorCode(unlock.error);
  const isShort = code === 'INSUFFICIENT_TOKENS';

  function handleUnlockPress() {
    if (unlock.isPending) return;
    unlock.mutate();
  }

  function handleMiniGamePress() {
    router.push('/luvin-hell');
  }

  return (
    <View className="flex-1 items-center justify-center gap-[12px] px-[50px]">
      <Text variant="body-s" className="text-pink-500">
        {formatEpisodeNumber(order)}
      </Text>
      <Text variant="heading-h4" className="text-center text-text-primary">
        {tokenCost === null
          ? '이 회차를 열려면 토큰이 필요해요'
          : `이 회차를 열려면 토큰 ${tokenCost}개가 필요해요`}
      </Text>
      <Text variant="body-s" className="text-text-muted">
        {balance.isPending
          ? '보유 토큰을 불러오는 중…'
          : balance.isError
            ? '보유 토큰을 불러오지 못했어요'
            : `보유 토큰: 🥐x${balance.data}`}
      </Text>
      <Text variant="body-xs" className="text-text-muted">
        한 번 열면 다시 볼 때는 토큰을 쓰지 않아요
      </Text>
      {isShort ? (
        <>
          <Text variant="body-m" className="text-state-error">
            {ERROR_MESSAGES.insufficientTokens}
          </Text>
          <Button label="미니게임으로 토큰 모으기" onPress={handleMiniGamePress} />
        </>
      ) : (
        <>
          {unlock.isError ? (
            <Text variant="body-s" className="text-state-error">
              {ERROR_MESSAGES.unlockFailed}
            </Text>
          ) : null}
          <Button
            label={unlock.isPending ? '여는 중…' : '열기'}
            disabled={unlock.isPending}
            onPress={handleUnlockPress}
          />
        </>
      )}
    </View>
  );
}
