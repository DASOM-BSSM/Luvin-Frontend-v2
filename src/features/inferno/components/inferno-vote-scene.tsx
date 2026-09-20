import { View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import InfernoVoteOption from '@/src/features/inferno/components/inferno-vote-option';
import type { InfernoParticipant } from '@/src/features/inferno/types';

/** 쪽지 맨 위 분홍 글자. Figma 5452:2750. */
const TITLE = 'VOTE';

/** Figma 5452:2834 의 버튼 문구. */
const ACTION_LABEL = '투표하기';

interface InfernoVoteSceneProps {
  message: string;
  /** 고를 수 있는 반죽들. 내 분신은 호출부에서 빼고 넘긴다. */
  options: InfernoParticipant[];
  /** 아직 고르지 않았으면 undefined. */
  selectedId?: string;
  onSelect: (participantId: string) => void;
  onSubmit: () => void;
}

/**
 * 투표지. Figma `ep1-투표지` (5452:1989).
 *
 * 쪽지 안이 두 칸이다. 왼쪽이 문구와 투표 버튼(304), 오른쪽이 선택지(300), 사이 60.
 * 시안의 좌우 여백 59 는 두 칸 폭을 뺀 나머지를 반씩 나눈 값과 같아서 가운데 정렬로 맞춘다.
 *
 * NOTE: 제목 폰트는 style 로 넣는다(src/constants/typography.ts 주석 참고).
 */
export default function InfernoVoteScene({
  message,
  options,
  selectedId,
  onSelect,
  onSubmit,
}: InfernoVoteSceneProps) {
  return (
    <View className="flex-1 flex-row items-center justify-center gap-[60px]">
      <View className="w-[304px] flex-col items-center gap-[28px]">
        <View className="w-[222px] flex-col items-center">
          <Text className="w-full text-center text-pink-500" style={okMallangBTitleStyle}>
            {TITLE}
          </Text>
          <Text variant="body-m" className="w-full text-center text-default-black">
            {message}
          </Text>
        </View>
        <Button label={ACTION_LABEL} variant="notice" onPress={onSubmit} />
      </View>

      <View className="w-[300px] flex-col items-start gap-[24px]">
        {options.map((participant) => (
          <InfernoVoteOption
            key={participant.id}
            participant={participant}
            selected={participant.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </View>
    </View>
  );
}
