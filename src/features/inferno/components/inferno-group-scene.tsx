/**
 * [DRAFT] 전체대화 한 줄. Figma `ep1-전체대화` (7855:3512, 7855:3893).
 *
 * 위에 등장 반죽 칩이 12 간격으로 늘어서고 그 아래 안내 문구, 그 아래에 대화가 한 줄씩 쳐진다.
 * 칩을 누르면 그 반죽 소개 모달이 뜨고, 그동안 해당 칩이 분홍으로 바뀐다.
 */
import { useState } from 'react';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoChatScene from '@/src/features/inferno/components/inferno-chat-scene';
import InfernoDoughChip from '@/src/features/inferno/components/inferno-dough-chip';
import InfernoDoughProfileModal from '@/src/features/inferno/components/inferno-dough-profile-modal';
import type { AiCharacterWithDescription } from '@/src/features/inferno/api/story-types';
import type { InfernoChatMessage } from '@/src/features/inferno/types';
import type { StageCastMember, StoryParticipant } from '@/src/features/inferno/types/story';
import { doughProfileOf } from '@/src/features/inferno/utils/dough-profile';
import { seasonChipCast } from '@/src/features/inferno/utils/story-playlist';

interface InfernoGroupSceneProps {
  id: string;
  /** 이 대화 블록의 참가자. 말한 빵의 그림·이름을 찾는다. */
  participants: StoryParticipant[];
  /** 이번 회차에 나오는 빵 전부. 칩 줄은 블록이 아니라 시즌 출연진 전체를 늘어놓는다. */
  episodeCast: StoryParticipant[];
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
  episodeCast,
  message,
  stageCast,
  characters,
  onDone,
}: InfernoGroupSceneProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // 칩은 성격을 보는 버튼이라 내 빵은 빼고 나머지 출연진(5명)만 둔다(사용자 결정).
  const chips = seasonChipCast(stageCast, episodeCast, participants).filter((person) => !person.isMine);
  const selected = chips.find((person) => person.id === selectedId);

  function handleChipPress(personId: string) {
    setSelectedId(personId);
  }

  function handleProfileClose() {
    setSelectedId(null);
  }

  return (
    <View className="flex-1 pt-[33px]">
      <View className="flex-col items-center gap-[12px]">
        {/* 5명이 화면 폭 안에 다 들어가야 한다. 가로 넘김으로 두면 마지막 칩이 잘려 보였다(사용자 지적).
            칩 폭을 고정(152)하지 않고 나눠 갖게 해서 좁은 기기에서도 다 들어간다. */}
        <View className="w-full flex-row items-center justify-center gap-[12px] px-[33px]">
          {chips.map((person) => (
            <InfernoDoughChip
              key={person.id}
              person={person}
              selected={person.id === selectedId}
              onPress={handleChipPress}
            />
          ))}
        </View>
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
