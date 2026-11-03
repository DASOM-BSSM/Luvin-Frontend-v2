import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';

interface InfernoWrapUpSceneProps {
  onEndSeasonPress: () => void;
}

/**
 * ep5 4페이지 — 시즌 마무리.
 *
 * [DRAFT] 시즌은 사용자마다 하나라 "다음 시즌 시작하기"는 뺐다(사용자 결정). "마무리하기"만 남는다.
 * 감정일기 공유 버튼도 뺐다(제품 결정).
 *
 * Figma ep5-끝(6941:5215)에 맞췄다: "시즌을 마무리 하시겠어요?"(Heading/H3, 순수 검정) 아래 20 띄우고
 * 버튼 둘을 28 간격으로. 왼쪽 "마무리하기"는 `Button1 - small`(밝은 바탕 + 검은 테두리 = outline),
 * 오른쪽 "다음 시즌 시작하기"는 `button2` hover=on(yellow/300 + yellow/400 테두리 = filledSelected). 두
 * 버튼 다 글은 Body/M, 좌우 20·위아래 6 이다. 묶음 전체가 쪽지 세로 가운데에 온다.
 */
export default function InfernoWrapUpScene({ onEndSeasonPress }: InfernoWrapUpSceneProps) {
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
          onPress={onEndSeasonPress}
        />
      </View>
    </View>
  );
}
