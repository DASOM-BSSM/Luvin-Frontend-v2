import { Pressable, View } from 'react-native';

import Text from '@/src/components/ui/text';
import useMyDiaryAuthor from '@/src/features/diaries/hooks/use-my-diary-author';
import type { RoomQuestion } from '@/src/features/diaries/types';
import { resolveAuthorName } from '@/src/features/diaries/utils/feed';
import { formatHourSlotLabel } from '@/src/features/diaries/utils/question';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';

interface QuestionCreatedNoticeProps {
  question: RoomQuestion;
  /** 카드를 누르면(질문이 있는 그룹으로 간다). */
  onPress: () => void;
}

/**
 * [DRAFT] 홈 "쫀쫀한 조합들"의 질문 생성 알림. 사용자가 준 시안 캡처를 따른다 — Figma 노드는 아직 확인 못 했다.
 *
 * 문구만 둔다 — "○○님이 15:00 질문을 생성했어요!" / "질문에 대한 나의 일기를 채워주세요". 위에 빵 그림 · 빵
 * 이름 줄은 두지 않는다(사용자 결정). 안쪽 여백은 위아래 12 · 양옆 16(사용자 지정).
 * 이름은 실제 이름(계정 닉네임)이 아니라 빵 이름이다(사용자 결정, `resolveAuthorName`). 만든 사람이 탈퇴해
 * 닉네임이 없으면 "15:00 질문이 생성됐어요!"로 쓴다. 내가 만든 질문(`creatorId` 가 내 id)이면 내 빵 이름을 쓴다.
 * 시각은 서버가 정한 칸(`slotStartAt`)이다.
 * "N분 전"은 사용자 요청으로 뺐다.
 * 글자 크기(Body/S 14px)는 반응 알림과 같다(사용자 결정).
 */
export default function QuestionCreatedNotice({ question, onPress }: QuestionCreatedNoticeProps) {
  const me = useMyDiaryAuthor();
  const myId = useMyProfile().data?.memberId;
  const slotLabel = formatHourSlotLabel(question.slotStartAt);
  const creatorName =
    question.creatorNickname === null
      ? null
      : resolveAuthorName(
          {
            isMine: myId !== undefined && question.creatorId === myId,
            nickname: question.creatorNickname,
            breadName: question.creatorBreadName,
            breadType: question.creatorBreadType,
          },
          me.name,
        );

  return (
    <Pressable
      accessibilityRole="button"
      className="w-full flex-col items-start rounded-[8px] border border-default-gray px-[16px] py-[12px]"
      onPress={onPress}
    >
      <View className="flex-col items-start">
        <Text variant="body-s" className="text-text-primary">
          {creatorName
            ? `${creatorName}님이 ${slotLabel} 질문을 생성했어요!`
            : `${slotLabel} 질문이 생성됐어요!`}
        </Text>
        <Text variant="body-s" className="text-text-primary">
          질문에 대한 나의 일기를 채워주세요
        </Text>
      </View>
    </Pressable>
  );
}
