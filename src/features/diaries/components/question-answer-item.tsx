import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import type { RoomQuestionAnswer } from '@/src/features/diaries/types';
import { formatRelativeTime } from '@/src/features/diaries/utils/feed';

interface QuestionAnswerItemProps {
  answer: RoomQuestionAnswer;
  now: Date;
  /** 내 답이면 넘긴다 — 수정 · 삭제 버튼이 붙는다. */
  onEditPress?: () => void;
  onDeletePress?: () => void;
  actionsDisabled?: boolean;
}

/**
 * 그룹 질문 답 한 장. 이름은 `authorNickname`(계정 닉네임) 그대로 — 그룹 닉네임으로 바꾸지 않는다.
 *
 * [DRAFT] Figma 에 답 목록 시안이 없어 일기 상세의 댓글 카드(5950:6015)와 같은 모양으로 그렸고,
 * 내 답만 테두리를 pink/400 으로 구분했다.
 */
export default function QuestionAnswerItem({
  answer,
  now,
  onEditPress,
  onDeletePress,
  actionsDisabled = false,
}: QuestionAnswerItemProps) {
  const isMine = onEditPress !== undefined;

  return (
    <View
      className={`w-full flex-col items-start gap-[8px] rounded-[8px] border bg-default-white p-[10px] ${
        isMine ? 'border-pink-400' : 'border-default-gray'
      }`}
    >
      <View className="w-full flex-row items-center justify-between">
        <View className="flex-row items-center gap-[6px]">
          <Text variant="body-xs" className="text-text-primary">
            {answer.authorNickname}
          </Text>
          <Text variant="body-xxs" className="text-text-muted">
            {formatRelativeTime(answer.updatedAt, now)}
          </Text>
        </View>
        {isMine ? (
          <View className="flex-row items-center gap-[12px]">
            <Pressable accessibilityRole="button" disabled={actionsDisabled} onPress={onEditPress}>
              <Text variant="body-xxs" className="text-text-muted">
                수정
              </Text>
            </Pressable>
            <Pressable accessibilityRole="button" disabled={actionsDisabled} onPress={onDeletePress}>
              <Text variant="body-xxs" className="text-state-error">
                삭제
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>
      <Text variant="body-xs" className="w-full text-text-primary">
        {answer.content}
      </Text>
    </View>
  );
}
