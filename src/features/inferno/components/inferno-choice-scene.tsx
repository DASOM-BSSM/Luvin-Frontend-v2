/**
 * [DRAFT] 회차 끝 선택(3·5·6·8화).
 *
 * 모든 회차가 같은 투표지(InfernoVoteGrid, Figma 5452:1989)를 쓴다(사용자 결정).
 * - 3·5·6화: 후보 셋 + 혼자 있기.
 * - 8화: 내 빵을 뺀 출연진 다섯 + 혼자 있기.
 *
 * 무엇을 고르든 투표하면 선택 결과 대화 없이 바로 "에피소드가 종료되었습니다" 모달이 뜬다(use-episode-playback).
 *
 * 이미 투표한 선택(recorded)으로 다시 들어오면 투표지는 그리지 않고 결과 모달만 띄운다
 * ("○○ 투표함", 7866:4219). 이미 끝낸 회차(다시 보기)면 버튼은 시안대로 "에피소드 나가기"다.
 * 투표만 하고 회차를 아직 끝내지 않았으면 나가 버리면 회차를 끝낼 길이 없어서 "다음으로"로 이어 본다.
 */
import { View } from 'react-native';

import Text from '@/src/components/ui/text';
import InfernoNoteModal from '@/src/features/inferno/components/inferno-note-modal';
import InfernoVoteGrid from '@/src/features/inferno/components/inferno-vote-grid';
import type {
  ChoiceOutcome,
  StoryChoice,
  StoryParticipant,
} from '@/src/features/inferno/types/story';
import { voteHintOf, voteNoticeOf, voteOptionsOf } from '@/src/features/inferno/utils/vote';

/** Figma 7866:4214. */
const TITLE = 'VOTE';
/** Figma 7866:4264. */
const LEAVE_LABEL = '에피소드 나가기';
/** 투표만 하고 회차를 아직 끝내지 않았을 때. 시안에 없는 경우라 정한 문구. */
const CONTINUE_LABEL = '다음으로';

interface InfernoChoiceSceneProps {
  choice: StoryChoice;
  /** 회차에 나오는 빵 전부. 선택지의 이름·그림을 여기서 찾는다. */
  participants: StoryParticipant[];
  recorded?: ChoiceOutcome;
  readOnly: boolean;
  pending: boolean;
  /** 고른 선택지 키. 혼자 있기는 null. */
  onSelect: (id: string | null) => void;
  /** 이미 투표한 회차에서 "다음으로". */
  onNext: () => void;
  /** 이미 끝낸 회차에서 "에피소드 나가기". */
  onLeave: () => void;
  /** 회차가 끝나 종료 모달을 띄울 차례. 이 장면의 모달을 먼저 닫는다. */
  ended: boolean;
  /** 이 장면의 모달이 완전히 닫혔을 때(iOS). 그 뒤에 종료 모달을 띄운다. */
  onModalDismiss: () => void;
}

export default function InfernoChoiceScene({
  choice,
  participants,
  recorded,
  readOnly,
  pending,
  onSelect,
  onNext,
  onLeave,
  ended,
  onModalDismiss,
}: InfernoChoiceSceneProps) {
  const options = voteOptionsOf(choice, participants);

  function handleDoneClose() {
    // 결과 모달이 이 장면 자체라 닫지 않는다 — 닫히면 빈 쪽지만 남는다.
  }

  if (recorded) {
    const voted = options.find((option) => option.id === recorded.breadId);
    return (
      <InfernoNoteModal
        visible={!ended}
        minWidthClass="min-w-[344px]"
        title={TITLE}
        message={`${voted?.name ?? ''} 투표함`}
        actionLabel={readOnly ? LEAVE_LABEL : CONTINUE_LABEL}
        onActionPress={readOnly ? onLeave : onNext}
        onClose={handleDoneClose}
        onDismiss={onModalDismiss}
      />
    );
  }

  return (
    <View className="flex-1">
      <InfernoVoteGrid
        notice={voteNoticeOf(choice.pointId)}
        hint={voteHintOf(choice.pointId)}
        options={options}
        pending={pending}
        disabled={readOnly}
        ended={ended}
        onVote={onSelect}
        onModalDismiss={onModalDismiss}
      />
      {readOnly ? (
        <Text variant="body-xs" className="pb-[8px] text-center text-text-muted">
          이 시즌의 선택 기록이 없어요. 다음 화면에서 계속 볼 수 있어요.
        </Text>
      ) : null}
    </View>
  );
}
