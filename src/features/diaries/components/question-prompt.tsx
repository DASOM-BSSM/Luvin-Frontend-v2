import { Pressable, View } from 'react-native';

import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import type { RoomQuestion } from '@/src/features/diaries/types';

interface QuestionPromptProps {
  question: RoomQuestion;
  onOpenPress: () => void;
}

/**
 * 오늘의 그룹 질문. Figma "감정일기 메인 - 제민"(5942:5456)의 "Q. ..." 문장(6031:2624).
 *
 * [DRAFT] 시안에는 질문 문장만 있고 답을 보는 · 남기는 곳이 없어, 문장 아래에 답 수와 "답하기"
 * 버튼(일기 카드의 "눌러서 작성"과 같은 outline 버튼)을 두었다. 문장을 눌러도 같은 모달이 열린다.
 */
export default function QuestionPrompt({ question, onOpenPress }: QuestionPromptProps) {
  const answerCount = question.answers?.length ?? 0;

  return (
    <View className="w-full flex-col items-start gap-[8px]">
      <Pressable accessibilityRole="button" className="w-full" onPress={onOpenPress}>
        <Text variant="heading-h4" className="w-full text-text-primary">
          Q. {question.content}
        </Text>
      </Pressable>
      <View className="w-full flex-row items-center justify-between">
        <Text variant="body-xs" className="text-text-muted">
          답 {answerCount}개
        </Text>
        <Button label={question.myAnswer ? '내 답 보기' : '답하기'} variant="outline" onPress={onOpenPress} />
      </View>
    </View>
  );
}
