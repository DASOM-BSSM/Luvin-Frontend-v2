import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

interface InfernoWrapUpSceneProps {
  onEndSeasonPress: () => void;
  onNextSeasonPress: () => void;
  /** 다음 시즌을 여는 요청이 진행 중이면 두 버튼을 모두 막는다(§11 — 트리거 버튼에서 대기 표시). */
  isStartingNextSeason?: boolean;
  /** 다음 시즌을 열지 못했으면 버튼 아래에 안내를 띄운다. 같은 버튼으로 다시 시도한다. */
  hasNextSeasonFailed?: boolean;
}

/**
 * [DRAFT] ep5 4페이지 — 시즌 마무리.
 *
 * "시즌 끝내기"/"다음 시즌 시작하기" 두 버튼만 가로로 나란히 둔다 — 감정일기 공유 버튼은
 * 뺐다(제품 결정).
 */
export default function InfernoWrapUpScene({
  onEndSeasonPress,
  onNextSeasonPress,
  isStartingNextSeason = false,
  hasNextSeasonFailed = false,
}: InfernoWrapUpSceneProps) {
  return (
    <View className="flex-1 flex-col items-center justify-center gap-[28px] px-[46px]">
      <Text variant="heading-h3" className="text-text-primary">
        시즌을 마무리할까요?
      </Text>
      <View className="w-full flex-row items-center justify-center gap-[12px]">
        <Button
          label="시즌 끝내기"
          variant="outline"
          textVariant="body-s"
          className="h-[34px] px-[14px] py-[4px]"
          disabled={isStartingNextSeason}
          onPress={onEndSeasonPress}
        />
        {/* secondary variant 는 w-full 이 박혀 있어 className="w-auto" 로 덮으려 했지만
            실기기에서 안 먹혔다(재확인 완료) — style 로 직접 덮어야 폭이 내용에 맞게 줄어든다. */}
        <Button
          label={isStartingNextSeason ? '새 시즌 준비 중...' : '다음 시즌 시작하기'}
          variant="secondary"
          textVariant="body-s"
          className="h-[34px] px-[14px]"
          style={{ width: 'auto' }}
          disabled={isStartingNextSeason}
          onPress={onNextSeasonPress}
        />
      </View>
      {hasNextSeasonFailed ? (
        <Text variant="body-s" className="text-state-error">
          다음 시즌을 시작하지 못했어요. 다시 시도해주세요.
        </Text>
      ) : null}
    </View>
  );
}
