import { useState } from 'react';
import { useAnimatedReaction, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { JUMP_BREAD_TYPES } from '@/src/features/inferno/constants/jump-rope';
import {
  getSlotJumpIndex,
  pickJumpBreadIndex,
} from '@/src/features/inferno/utils/jump-rope-timing';

interface SlotState {
  jumpIndex: number;
  typeIndex: number;
}

function createSlotState(jumpIndex: number): SlotState {
  return { jumpIndex, typeIndex: pickJumpBreadIndex(Math.random(), JUMP_BREAD_TYPES.length) };
}

/**
 * 슬롯이 맡을 반죽 순번과 종류를 JS 상태로 내려준다. 종류는 새 반죽을 맡을 때마다 무작위로 고른다.
 * 순번은 반죽이 완전히 사라진 뒤에 바뀌고, 다음 반죽은 그보다 한 바퀴 넘게 지나서 나타나므로
 * 이미지 교체가 화면에 보이지 않는다.
 */
export default function useJumpRopeSlot(
  slot: number,
  elapsed: SharedValue<number>,
  exitAt: SharedValue<number>,
) {
  const [state, setState] = useState(() => createSlotState(slot));
  const type = JUMP_BREAD_TYPES[state.typeIndex];

  function handleSlotPrepare(nextIndex: number) {
    setState(createSlotState(nextIndex));
  }

  useAnimatedReaction(
    () => getSlotJumpIndex(Math.min(elapsed.value, exitAt.value), slot),
    (nextIndex, previousIndex) => {
      if (previousIndex !== null && nextIndex !== previousIndex) {
        scheduleOnRN(handleSlotPrepare, nextIndex);
      }
    },
  );

  return { preparedIndex: state.jumpIndex, recyclingKey: `personDough:${type}`, type };
}
