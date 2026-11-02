/**
 * [DRAFT] 투표지(3·5·6·8화 전부). Figma `투표지` (5452:1989, 2차 시안).
 *
 * 위에 안내 두 줄(Body/M 안내 + Body/S 도움말, 간격 8), 그 아래 20 간격으로 선택지가 두 칸씩 줄지어 선다
 * (왼쪽 칸 300, 오른쪽 칸 280, 간격 20). 칸은 반죽 그림 + 이름 + 캡션(그 빵과의 기억 한 줄, 사용자 결정),
 * 혼자 있기는 이름만 가운데.
 * 칸을 누르면 VOTE 쪽지 모달("○○에게" / "투표하기", 7866:4214)이 뜨고, 투표하기를 눌러야 서버에 보낸다.
 * 바깥을 누르면 고르기를 취소한다.
 *
 * - 3·5·6화: 후보 셋 + 혼자 있기, 두 줄. 안내는 utils/vote.ts 의 voteNoticeOf·voteHintOf.
 * - 8화: 내 빵을 뺀 출연진 다섯 + 혼자 있기, 세 줄. 친구가 후보에 있고 혼자 있기면 회차가 끝나서 두 안내
 *   모두 맞지 않아 없다. 세 줄이 쪽지(약 300)에 들어간다(칸 56×3 + 간격 20×2).
 */
import { useState } from 'react';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import InfernoVoteOption from '@/src/features/inferno/components/inferno-vote-option';
import { chunkRows } from '@/src/features/inferno/utils/story-playlist';
import type { VoteOption } from '@/src/features/inferno/utils/vote';

/** Figma 7866:4214. */
const TITLE = 'VOTE';
/** Figma 7866:4216. */
const ACTION_LABEL = '투표하기';
/** 한 줄에 두 칸. Figma 7866:4137. */
const COLUMNS = 2;
/** 칸 폭. 왼쪽 300, 오른쪽 280(7866:4148, 7866:4142). */
const CELL_WIDTH = ['w-[300px]', 'w-[280px]'];

interface InfernoVoteGridProps {
  /** 첫 줄 안내(Body/M). Figma 7870:4574. */
  notice?: string;
  /** 둘째 줄 안내(Body/S, 회색). Figma 7870:4576 자리. */
  hint?: string;
  options: VoteOption[];
  pending: boolean;
  disabled: boolean;
  /** 회차가 끝나 종료 모달을 띄울 차례. 확인 모달을 닫는다(iOS 는 모달을 겹쳐 띄우지 못한다). */
  ended: boolean;
  onVote: (id: string | null) => void;
  /** 확인 모달이 완전히 닫혔을 때(iOS). */
  onModalDismiss: () => void;
}

export default function InfernoVoteGrid({
  notice,
  hint,
  options,
  pending,
  disabled,
  ended,
  onVote,
  onModalDismiss,
}: InfernoVoteGridProps) {
  const [picked, setPicked] = useState<VoteOption | null>(null);

  function handleOptionSelect(optionId: string | null) {
    if (disabled || pending) return;
    setPicked(options.find((option) => option.id === optionId) ?? null);
  }

  // 누르면 확인 모달을 바로 닫고 투표는 뒤에서 보낸다("투표하는 중..." 모달을 띄우지 않는다 — 사용자 결정).
  // 보내는 동안은 선택지가 잠겨 있고, 끝나면 "에피소드가 종료되었습니다"가 뜬다.
  function handleVotePress() {
    if (!picked || pending) return;
    const id = picked.id;
    setPicked(null);
    onVote(id);
  }

  function handleModalClose() {
    if (!pending) setPicked(null);
  }

  return (
    <View className="flex-1 items-center justify-center gap-[20px]">
      {notice || hint ? (
        <View className="flex-col items-center gap-[8px]">
          {notice ? (
            <Text variant="body-m" className="text-center text-text-primary">
              {notice}
            </Text>
          ) : null}
          {hint ? (
            <Text variant="body-s" className="text-center text-text-muted">
              {hint}
            </Text>
          ) : null}
        </View>
      ) : null}
      <View className="flex-col gap-[20px]">
        {chunkRows(options, COLUMNS).map((row) => (
          <View key={row.map((option) => option.id ?? 'solo').join(':')} className="flex-row gap-[20px]">
            {row.map((option, column) => (
              <InfernoVoteOption
                key={option.id ?? 'solo'}
                optionId={option.id}
                name={option.name}
                caption={option.caption}
                breadType={option.breadType}
                widthClass={CELL_WIDTH[column] ?? CELL_WIDTH[0]}
                selected={picked?.id === option.id}
                disabled={disabled || pending}
                onSelect={handleOptionSelect}
              />
            ))}
          </View>
        ))}
      </View>
      <InfernoNoteModal
        visible={picked !== null && !ended}
        minWidthClass="min-w-[344px]"
        title={TITLE}
        message={picked?.voteMessage ?? ''}
        actionLabel={ACTION_LABEL}
        onActionPress={handleVotePress}
        onClose={handleModalClose}
        onDismiss={onModalDismiss}
      />
    </View>
  );
}
