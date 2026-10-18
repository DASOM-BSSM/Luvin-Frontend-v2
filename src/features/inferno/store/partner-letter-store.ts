import { create } from 'zustand';

import type { InfernoPartnerLetterSender } from '@/src/features/inferno/types';
import { getStorageJson, removeStorageItem, setStorageJson } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(§12 표). */
const PENDING_LETTER_KEY = 'inferno.pendingPartnerLetter';

/**
 * EP5 이후 최종 매칭 상대가 보내는 쪽지(사용자 결정).
 *
 * 쪽지는 푸시 알림이 아니다. EP5 를 끝낸 뒤 앱을 **다시 열면** 얼마나 지났든 상관없이, 어느 화면으로
 * 열리든 가장 먼저 뜬다. 같은 실행 안에서 EP5 를 끝내고 홈으로 돌아갈 때는 뜨지 않는다.
 *
 * "다시 열었을 때만" 은 저장 시점과 읽는 시점을 나눠서 만든다.
 * - EP5 를 끝내면 `queueLetter` 가 MMKV 에만 쓴다. 메모리 상태(`deliverableSender`)는 건드리지 않는다.
 * - `deliverableSender` 는 이 스토어가 처음 만들어질 때(앱 실행 직후) 한 번만 MMKV 에서 읽는다.
 * 그래서 이번 실행에서 쌓인 쪽지는 다음 실행에서야 보인다. 읽고 닫기 전까지는 MMKV 에 남아서
 * 앱을 열 때마다 다시 뜬다.
 *
 * NOTE: 실행 직후에 읽으려면 이 모듈이 앱 시작 때 불려야 한다 — 루트 레이아웃(_layout.tsx)이
 * 쪽지 모달을 통해 이 스토어를 쓴다. 개발 중 Fast Refresh 로 이 파일이 다시 실행되면 같은 실행
 * 안에서도 쪽지가 뜰 수 있는데, 개발 환경에서만 생기는 일이다.
 */
interface PartnerLetterStore {
  /** 이번 실행에서 보여줄 쪽지의 보낸 사람. 없으면 null. */
  deliverableSender: InfernoPartnerLetterSender | null;
  /** 다음에 앱을 열 때 보여줄 쪽지를 남긴다. 이미 남은 쪽지가 있으면 새 것으로 바꾼다. */
  queueLetter: (sender: InfernoPartnerLetterSender) => void;
  /** 이번 실행의 쪽지를 다 읽었다. 다시 뜨지 않는다. */
  markLetterRead: () => void;
  /**
   * 이번 실행에서만 쪽지를 내린다. 읽은 것으로 치지 않아서 다음에 앱을 열면 다시 뜬다.
   * 본문을 받지 못해 펼칠 수 없을 때 화면을 막아 두지 않으려고 쓴다.
   */
  hideLetterForNow: () => void;
}

export const usePartnerLetterStore = create<PartnerLetterStore>((set, get) => ({
  deliverableSender: getStorageJson<InfernoPartnerLetterSender>(PENDING_LETTER_KEY) ?? null,

  queueLetter: (sender) => setStorageJson(PENDING_LETTER_KEY, sender),

  markLetterRead: () => {
    const readSender = get().deliverableSender;
    const storedSender = getStorageJson<InfernoPartnerLetterSender>(PENDING_LETTER_KEY);

    // 이번 실행 중에 EP5 를 또 끝내서 새 쪽지가 남았으면 그건 지우지 않는다 — 다음 실행에 뜰 쪽지다.
    if (storedSender?.id === readSender?.id) {
      removeStorageItem(PENDING_LETTER_KEY);
    }

    set({ deliverableSender: null });
  },

  hideLetterForNow: () => set({ deliverableSender: null }),
}));
