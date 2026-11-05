import { create } from 'zustand';

import { clampSpeed, DEFAULT_SPEED } from '@/src/features/dialogue-speed/utils/dialogue-speed';
import { getStorageNumber, setStorageNumber } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(AGENTS.md §12 표). */
const SPEED_KEY = 'dialogue-speed.multiplier';

interface DialogueSpeedStore {
  /** 대화가 쳐지는 속도 배율. 1 이 기본, 클수록 빠르다. */
  multiplier: number;
  setMultiplier: (multiplier: number) => void;
}

export const useDialogueSpeedStore = create<DialogueSpeedStore>((set) => ({
  multiplier: clampSpeed(getStorageNumber(SPEED_KEY) ?? DEFAULT_SPEED),

  setMultiplier: (multiplier) => {
    const next = clampSpeed(multiplier);

    setStorageNumber(SPEED_KEY, next);
    set({ multiplier: next });
  },
}));
