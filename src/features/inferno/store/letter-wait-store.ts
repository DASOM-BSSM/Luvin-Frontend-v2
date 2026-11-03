/**
 * 1~9화 쪽지 도착을 기다리는 기한. 서버가 쪽지를 미리 만들어 두고 완료 요청에서 도착시키지만,
 * 아직 만드는 중이면 몇 초 뒤에 조회된다(스펙 `POST .../complete`). 완료 요청이 성공하면 기한을 걸고,
 * 그동안 use-partner-letter 가 안 읽은 쪽지를 짧은 간격으로 다시 받는다. 기한이 지나면 완료 정리가
 * 끝날 때 use-completion-watcher 가 한 번 더 받는다. 메모리에만 둔다(앱을 다시 켜면 처음부터 받는다).
 */
import { create } from 'zustand';

/** 쪽지를 기다리는 최대 시간. 스펙상 보통 몇 초 안에 조회된다. */
const LETTER_WAIT_MS = 30_000;

interface LetterWaitStore {
  /** 이 시각(ms)까지 쪽지를 기다린다. 기다리지 않으면 null. */
  waitUntil: number | null;
  startWaiting: () => void;
  stopWaiting: () => void;
}

export const useLetterWaitStore = create<LetterWaitStore>((set) => ({
  waitUntil: null,
  startWaiting: () => set({ waitUntil: Date.now() + LETTER_WAIT_MS }),
  stopWaiting: () => set({ waitUntil: null }),
}));
