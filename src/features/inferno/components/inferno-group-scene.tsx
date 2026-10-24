/**
 * [DRAFT] 전체대화 한 줄. Figma `ep1-전체대화` (7855:3512, 7855:3893).
 *
 * 위에 등장 반죽 칩이 12 간격으로 늘어서고 그 아래 안내 문구, 그 아래에 대화가 한 줄씩 쳐진다.
 * 칩을 누르면 그 반죽 소개 모달이 뜨고, 그동안 해당 칩이 분홍으로 바뀐다.
 * 반죽이 많아 화면을 넘치면 칩 줄만 가로로 넘겨 볼 수 있다.
 */
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoDoughChip from '@/src/features/inferno/components/inferno-dough-chip';
import InfernoDoughProfileModal from '@/src/features/inferno/components/inferno-dough-profile-modal';
import type { AiCharacterWithDescription } from '@/src/features/inferno/api/story-types';
import type { InfernoChatMessage } from '@/src/features/inferno/types';
import type { StageCastMember, StoryParticipant } from '@/src/features/inferno/types/story';
import { doughProfileOf } from '@/src/features/inferno/utils/dough-profile';

interface InfernoGroupSceneProps {
  id: string;
  participants: StoryParticipant[];
  message: InfernoChatMessage;
  /** 시즌 단위로 저장해 둔 1화 무대 소개 출연진. 소개 모달의 관계·특징을 여기서 찾는다. */
  stageCast: StageCastMember[];
  /** 서버 시즌 출연진. 특징 문구(description)가 오면 stageCast 보다 먼저 쓴다. */
  characters: AiCharacterWithDescription[];
  onDone: () => void;
}

export default function InfernoGroupScene({
  id,
  participants,
  message,
  stageCast,
  characters,
  onDone,
}: InfernoGroupSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = participants.find((person) => person.id === selectedId);

  function handleChipPress(personId: string) {
    setSelectedId(personId);
  }

  function handleProfileClose() {
    setSelectedId(null);
  }

  return (
    <View className="flex-1 pt-[33px]">
      <View className="flex-col items-center gap-[12px]">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="w-full grow-0"
          contentContainerClassName="grow flex-row items-center justify-center gap-[12px] px-[33px]"
        >
          {participants.map((person) => (
            <InfernoDoughChip
              key={person.id}
              person={person}
              selected={person.id === selectedId}
              onPress={handleChipPress}
            />
          ))}
        </ScrollView>
        <Text variant="body-xs" className="text-center text-text-muted">
          반죽을 누르면 각 반죽들의 특징을 볼 수 있어요
        </Text>
      </View>
      <InfernoChatScene
        key={message.id}
        page={{ id, messages: [message] }}
        participants={participants}
        onPageDone={onDone}
      />
      <InfernoDoughProfileModal
        profile={selected ? doughProfileOf(selected, stageCast, characters) : null}
        onClose={handleProfileClose}
      />
    </View>
  );
}
