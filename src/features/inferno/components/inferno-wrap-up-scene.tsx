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
 * ep5 4페이지 — 시즌 마무리.
 *
 * "시즌 끝내기"/"다음 시즌 시작하기" 두 버튼만 가로로 나란히 둔다 — 감정일기 공유 버튼은
 * 뺐다(제품 결정).
 *
 * Figma ep5-끝(6941:5215)에 맞췄다: "시즌을 마무리 하시겠어요?"(Heading/H3, 순수 검정) 아래 20 띄우고
 * 버튼 둘을 28 간격으로. 왼쪽 "마무리하기"는 `Button1 - small`(밝은 바탕 + 검은 테두리 = outline),
 * 오른쪽 "다음 시즌 시작하기"는 `button2` hover=on(yellow/300 + yellow/400 테두리 = filledSelected). 두
 * 버튼 다 글은 Body/M, 좌우 20·위아래 6 이다. 묶음 전체가 쪽지 세로 가운데에 온다.
 */
export default function InfernoWrapUpScene({
  onEndSeasonPress,
  onNextSeasonPress,
  isStartingNextSeason = false,
  hasNextSeasonFailed = false,
}: InfernoWrapUpSceneProps) {
  return (
    <View className="flex-1 flex-col items-center justify-center gap-[20px] px-[46px]">
      <Text variant="heading-h3" className="text-center text-inferno-instruction">
        시즌을 마무리 하시겠어요?
      </Text>
      {/* 예전엔 secondary variant(w-full 박힘)를 style 로 폭만 덮어 썼는데(className="w-auto" 는 실기기에서 안
          먹혔다), 시안의 노란 버튼은 폭이 내용에 맞는 filledSelected 와 같아서 그걸 쓴다. */}
      <View className="flex-row items-center justify-center gap-[28px]">
        <Button
          label="마무리하기"
          variant="outline"
          textVariant="body-m"
          disabled={isStartingNextSeason}
          onPress={onEndSeasonPress}
        />
        <Button
          label={isStartingNextSeason ? '새 시즌 준비 중...' : '다음 시즌 시작하기'}
          variant="filledSelected"
          textVariant="body-m"
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
