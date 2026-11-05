import { View } from 'react-native';

import Slider from '@/src/components/ui/slider';
import Text from '@/src/components/ui/text';
import DialogueSpeedPreview from '@/src/features/dialogue-speed/components/dialogue-speed-preview';
import useReplayKey from '@/src/features/dialogue-speed/hooks/use-replay-key';
import { useDialogueSpeedStore } from '@/src/features/dialogue-speed/store/dialogue-speed-store';
import {
  formatSpeed,
  positionToSpeed,
  SPEED_MARKS,
  speedToPosition,
} from '@/src/features/dialogue-speed/utils/dialogue-speed';

const SLIDER_MARKS = SPEED_MARKS.map((mark) => ({
  position: speedToPosition(mark.speed),
  label: mark.label,
}));

/**
 * 마이페이지 "대화 속도" — 러빈지옥 대화가 한 글자씩 쳐지는 속도를 슬라이더로 고른다.
 * 1/4 · 1/2 · 기본 · 2배에 눈금이 박혀 있고, 아래 예시가 고른 속도 그대로 쳐진다. 시안이 없어
 * 마이페이지 다른 설정처럼 토큰 색만 입혔다. 고르면 기기(MMKV)에 바로 저장한다.
 *
 * 조절하는 동안은 쳐지던 예시가 그 자리에서 빨라지고 느려지고, 손을 떼면 처음부터 다시 친다.
 */
export default function DialogueSpeedSetting() {
  const multiplier = useDialogueSpeedStore((state) => state.multiplier);
  const setMultiplier = useDialogueSpeedStore((state) => state.setMultiplier);
  const { replayKey, replay } = useReplayKey();

  function handleSliderChange(position: number) {
    setMultiplier(positionToSpeed(position));
  }

  return (
    <View className="w-full flex-col items-start gap-[12px]">
      <View className="w-full flex-row items-center justify-between gap-[12px]">
        <Text variant="heading-h5" className="text-text-primary">
          대화 속도
        </Text>
        <Text variant="body-s" className="text-text-primary">
          {formatSpeed(multiplier)}
        </Text>
      </View>
      <Text variant="body-xs" className="text-text-muted">
        러빈지옥에서 대화가 나오는 속도를 정해요.
      </Text>
      <Slider
        value={speedToPosition(multiplier)}
        onChange={handleSliderChange}
        onChangeEnd={replay}
        marks={SLIDER_MARKS}
        accessibilityLabel="대화 속도"
        accessibilityValueText={formatSpeed(multiplier)}
      />
      <DialogueSpeedPreview replayKey={replayKey} onReplayPress={replay} />
    </View>
  );
}
