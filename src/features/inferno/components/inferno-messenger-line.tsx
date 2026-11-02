import { View } from 'react-native';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Text from '@/src/components/ui/text';
import type { StoryMessage, StoryParticipant } from '@/src/features/inferno/types/story';

interface InfernoMessengerLineProps {
  message: StoryMessage;
  /** 보낸 빵. 내 말이면 그림·이름 없이 오른쪽에 붙는다. */
  sender: StoryParticipant | undefined;
  /** 말풍선 옆 시각. 예: "오후 4시 50분" */
  clock: string;
  /** 안 읽은 사람 수. 0 이면 숨긴다. */
  unread: number;
  /** 보냈다 지운 메시지가 지워진 뒤인지. */
  deleted: boolean;
}

/**
 * 톡방 한 줄. Figma `채팅방` (7866:4524 다른 빵, 7866:4525 나).
 *
 * 다른 빵: 위에 작은 반죽(25x19)과 이름(XXS), 아래에 말풍선과 그 오른쪽 아래 안 읽은 수(분홍)·시각.
 * 나: 그림·이름 없이 오른쪽에 붙고, 안 읽은 수·시각이 말풍선 왼쪽 아래에 온다.
 * 말풍선은 둘 다 yellow/100 바탕에 반경 8, 여백 20/10.
 */
export default function InfernoMessengerLine({
  message,
  sender,
  clock,
  unread,
  deleted,
}: InfernoMessengerLineProps) {
  const isMine = sender?.isMine === true;

  const meta = (
    <View className={`flex-col gap-[2px] ${isMine ? 'items-end' : 'items-start'}`}>
      {unread > 0 ? (
        <Text variant="body-xxs" className="text-pink-500">
          {unread}
        </Text>
      ) : null}
      <Text variant="body-xxs" className="text-text-primary">
        {clock}
      </Text>
    </View>
  );

  const bubble = (
    <View className="shrink rounded-[8px] bg-yellow-100 px-[20px] py-[10px]">
      <Text variant="body-m" className={deleted ? 'text-text-muted' : 'text-text-primary'}>
        {deleted ? '삭제된 메시지입니다' : message.text}
      </Text>
    </View>
  );

  if (isMine)
    return (
      <View className="max-w-[80%] flex-row items-end gap-[8px] self-end">
        {meta}
        {bubble}
      </View>
    );

  return (
    <View className="max-w-[80%] flex-col items-start gap-[4px] self-start">
      {sender ? (
        <View className="flex-row items-center gap-[6px]">
          <BreadCharacter type={sender.type} state="dough" className="h-[19px] w-[25px]" />
          <Text variant="body-xxs" className="text-text-primary">
            {sender.name}
          </Text>
        </View>
      ) : null}
      <View className="flex-row items-end gap-[8px]">
        {bubble}
        {meta}
      </View>
    </View>
  );
}
