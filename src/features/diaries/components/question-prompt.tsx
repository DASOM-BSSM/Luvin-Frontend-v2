import { Pressable } from 'react-native';

import Text from '@/src/components/ui/text';
import type { RoomQuestion } from '@/src/features/diaries/types';

interface QuestionPromptProps {
  question: RoomQuestion;
  onOpenPress: () => void;
}

/**
 * 오늘의 그룹 질문. Figma "감정일기 메인 - 제민"(5942:5456)의 "Q. ..." 문장(6031:2624).
 *
 * [DRAFT] 시안에는 질문 문장만 있고 답을 보는 · 남기는 곳이 없어, 문장 아래에 답 수를 가운데로
 * 둔다. 문장이나 답 수를 누르면 답 모달이 열린다("답하기" 버튼은 LUV-90 피드백으로 뺐다).
 */
export default function QuestionPrompt({ question, onOpenPress }: QuestionPromptProps) {
  const answerCount = question.answers?.length ?? 0;

  return (
    <Pressable accessibilityRole="button" className="w-full flex-col items-center gap-[8px]" onPress={onOpenPress}>
      <Text variant="heading-h4" className="w-full text-text-primary">
        Q. {question.content}
      </Text>
      <Text variant="body-xs" className="text-center text-text-muted">
        답 {answerCount}개
      </Text>
    </Pressable>
  );
}
