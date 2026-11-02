import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';

import Text from '@/src/components/ui/text';
import MyAnswerEditor from '@/src/features/diaries/components/my-answer-editor';
import QuestionAnswerItem from '@/src/features/diaries/components/question-answer-item';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import type { RoomQuestion } from '@/src/features/diaries/types';
import { resolveAuthorName } from '@/src/features/diaries/utils/feed';
import { formatHourSlotLabel, formatQuestionDate } from '@/src/features/diaries/utils/question';

interface QuestionAnswersModalProps {
  /** 없으면 닫혀 있다. 캐시의 지금 질문을 그대로 넘겨서, 답을 남기면 모달도 같이 바뀐다. */
  question: RoomQuestion | undefined;
  onClose: () => void;
}

/**
 * 그룹 질문 — 질문, 내 답, 멤버들의 답. 지난 질문은 여기서 보여주지 않고 달력에서 날짜로 찾아간다(사용자 결정).
 * 이름은 서버가 정한 빵 이름(`authorBreadName`)이다 — 실제 이름은 쓰지 않는다(사용자 결정).
 *
 * [DRAFT] Figma 에 시안이 없어 일기 상세 모달(`DiaryDetailModal`, 5950:6274)과 같은 틀(반투명 배경
 * 위 카드 · 입력칸 · 목록)로 그렸다.
 */
export default function QuestionAnswersModal({ question, onClose }: QuestionAnswersModalProps) {
  const now = new Date();
  const me = useMyDiaryAuthor();
  const otherAnswers = (question?.answers ?? []).filter(
    ({ answerId }) => answerId !== question?.myAnswer?.answerId,
  );

  return (
    <Modal visible={question !== undefined} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable className="flex-1 bg-default-black/30" onPress={onClose}>
          <ScrollView
            className="flex-1"
            contentContainerClassName="flex-grow items-center justify-center px-[33px] py-[40px]"
            keyboardShouldPersistTaps="handled"
          >
            {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. */}
            <Pressable className="w-full max-w-[336px] flex-col items-start gap-[8px]">
              {question ? (
                <>
                  <View className="w-full flex-col items-start gap-[4px] rounded-[8px] bg-default-white p-[12px]">
                    <Text variant="body-xxs" className="text-text-muted">
                      {formatQuestionDate(question.questionDate)} {formatHourSlotLabel(question.slotStartAt)}
                    </Text>
                    <Text variant="heading-h4" className="w-full text-text-primary">
                      Q. {question.content}
                    </Text>
                  </View>
                  <MyAnswerEditor question={question} now={now} />
                  {otherAnswers.length === 0 ? (
                    <Text variant="body-xs" className="text-text-primary">
                      아직 다른 멤버의 답이 없어요
                    </Text>
                  ) : (
                    otherAnswers.map((answer) => (
                      <QuestionAnswerItem
                        key={answer.answerId}
                        answer={answer}
                        authorName={resolveAuthorName(
                          {
                            isMine: false,
                            nickname: answer.authorNickname,
                            breadName: answer.authorBreadName,
                            breadType: answer.authorBreadType,
                          },
                          me.name,
                        )}
                        now={now}
                      />
                    ))
                  )}
                </>
              ) : null}
            </Pressable>
          </ScrollView>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
