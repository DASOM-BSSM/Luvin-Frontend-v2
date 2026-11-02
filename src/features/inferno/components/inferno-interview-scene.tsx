/**
 * [DRAFT] 10화 인터뷰. Figma `ep5-결과` INTERVIEW (7884:4592).
 *
 * 쪽지 위에 "INTERVIEW"(Ok Mallang B 22), 그 아래 24 간격으로 질문(H4)과 답이 선다.
 * 질문은 **내 빵**에 대해 묻는다("Q. 이 시즌 도넛은 당신에게 어떤 반죽이었나요?" — 도넛이 내 빵). 답은
 * **인터뷰를 받는 출연진**이 한다 — 그 빵 그림(107x60)과 이름(Body/M)이 12 간격으로 나란히, 그 아래 12 간격으로
 * 답(Body/S)이 한 글자씩 쳐진다. 출연진 한 명당 한 장씩, 다른 빵들이 나를 어떻게 기억하는지 듣는다.
 *
 * NOTE: 제목 폰트는 style 로 넣는다(src/constants/typography.ts 주석 참고).
 */
import { View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import TypewriterText from '@/src/components/ui/typewriter-text';
import { okMallangBTitleStyle } from '@/src/constants/typography';
import type { InfernoChatMessage, InfernoParticipant } from '@/src/features/inferno/types';
import { getBreadFlavorName } from '@/src/features/inferno/utils/character-persona';
import { formatInterviewQuestion } from '@/src/features/inferno/utils/format';

/** Figma 7884:4598. */
const TITLE = 'INTERVIEW';

interface InfernoInterviewSceneProps {
  /** 질문에 나오는 빵. 내 빵이다. */
  subject: InfernoParticipant;
  /** 답하는 빵. 이번 장의 인터뷰 대상(출연진 한 명). */
  answerer: InfernoParticipant;
  message: InfernoChatMessage;
  onDone: () => void;
}

export default function InfernoInterviewScene({
  subject,
  answerer,
  message,
  onDone,
}: InfernoInterviewSceneProps) {
  return (
    <View className="flex-1 flex-col items-center justify-center gap-[24px] px-[40px]">
      <Text className="text-center text-pink-500" style={okMallangBTitleStyle}>
        {TITLE}
      </Text>
      <View className="flex-col items-center gap-[24px]">
        <Text variant="heading-h4" className="text-center text-inferno-instruction">
          {formatInterviewQuestion(getBreadFlavorName(subject.type))}
        </Text>
        <View className="flex-col items-center gap-[12px]">
          <View className="flex-row items-center justify-center gap-[12px]">
            <BreadCharacter
              type={answerer.type}
              state="personDough"
              className="h-[60px] w-[107px]"
              accessibilityLabel={answerer.name}
            />
            <Text variant="body-m" className="text-inferno-instruction">
              {answerer.name}
            </Text>
          </View>
          <TypewriterText
            key={message.id}
            text={message.text}
            variant="body-s"
            className="text-center text-inferno-instruction"
            onDone={onDone}
          />
        </View>
      </View>
    </View>
  );
}
