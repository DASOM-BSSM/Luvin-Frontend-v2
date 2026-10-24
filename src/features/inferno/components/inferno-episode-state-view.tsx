/**
 * [DRAFT] 회차 본문 대신 보여주는 상태: 첫 로딩(스켈레톤), 생성 대기, 오류.
 * 오류는 서버 code 를 문구와 버튼으로 바꿔 보여준다(utils/story-error.ts). 서버 message 는 쓰지 않는다.
 */
import { router } from 'expo-router';
import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Skeleton from '@/src/components/ui/skeleton';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import { infernoIntroHref } from '@/src/features/inferno/constants/routes';
import { describeEpisodeError } from '@/src/features/inferno/utils/story-error';

interface InfernoEpisodeStateViewProps {
  order: number;
  isLoading: boolean;
  isGenerating: boolean;
  error: unknown;
  onRetry: () => void;
  onShowReport: () => void;
  onAgeRequired: () => void;
}

export default function InfernoEpisodeStateView({
  order,
  isLoading,
  isGenerating,
  error,
  onRetry,
  onShowReport,
  onAgeRequired,
}: InfernoEpisodeStateViewProps) {
  if (isLoading)
    return (
      <View className="flex-1 justify-center gap-[12px] px-[50px]">
        <Skeleton className="h-[45px] w-full" />
        <Skeleton className="h-[45px] w-full" />
      </View>
    );
  if (isGenerating && !error)
    return (
      <View className="flex-1 items-center justify-center gap-[12px] px-[50px]">
        <Skeleton className="h-[45px] w-full" />
        <Text variant="body-m" className="text-text-muted">
          {ERROR_MESSAGES.episodeGenerating}
        </Text>
      </View>
    );

  const { message, action } = describeEpisodeError(error);

  function handleFirstPress() {
    router.replace(infernoIntroHref(1));
  }

  function handlePreviousPress() {
    router.replace(infernoIntroHref(Math.max(1, order - 1)));
  }

  return (
    <View className="flex-1 items-center justify-center gap-[12px] px-[50px]">
      <Text variant="body-m" className="text-center text-text-primary">
        {ERROR_MESSAGES[message]}
      </Text>
      {action === 'retry' ? <Button label="다시 시도" onPress={onRetry} /> : null}
      {action === 'first' ? <Button label="1화로 가기" onPress={handleFirstPress} /> : null}
      {action === 'previous' ? (
        <Button label="이전 회차로 가기" onPress={handlePreviousPress} />
      ) : null}
      {action === 'report' ? <Button label="최종 리포트 보기" onPress={onShowReport} /> : null}
      {action === 'age' ? <Button label="나이·성별 입력하기" onPress={onAgeRequired} /> : null}
    </View>
  );
}
