import { create } from 'zustand';

import { useInfernoStore } from '@/src/features/inferno/store/inferno-store';
import type { InfernoPartnerLetterSender } from '@/src/features/inferno/types';
import { getStorageJson, removeStorageItem, setStorageJson } from '@/src/lib/storage';

/** 비민감 값이라 MMKV 에 둔다(§12 표). */
const PENDING_LETTER_KEY = 'inferno.pendingPartnerLetter';

/**
 * 계정의 쪽지 키. 주인 userId 를 모르면 계정별로 나누기 전의 키다(inferno-store 의 progressStorageKeys 와
 * 같은 규칙).
 */
function letterStorageKey(ownerUserId: number | undefined): string {
  return ownerUserId === undefined ? PENDING_LETTER_KEY : `${PENDING_LETTER_KEY}.${ownerUserId}`;
}

/**
 * 이번 실행에서 남긴 쪽지 id. 이번 실행에서 EP5 를 끝내고 남긴 쪽지는 다음 실행에 떠야 하므로, 같은 실행
 * 안에서 다시 로그인해도 띄우지 않는다.
 */
const lettersQueuedThisRun = new Set<string>();

/** 이 계정에 남아 있는 쪽지 중 이번 실행에서 보여줄 것. 없거나 이번 실행에서 남긴 쪽지면 null. */
function readDeliverableSender(ownerUserId: number | undefined): InfernoPartnerLetterSender | null {
  const sender = getStorageJson<InfernoPartnerLetterSender>(letterStorageKey(ownerUserId));

  return sender && !lettersQueuedThisRun.has(sender.id) ? sender : null;
}

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
 * 쪽지는 계정(userId)별로 저장한다 — 예전에는 기기에 하나만 둬서 같은 기기에서 다른 계정으로 로그인하면
 * 이전 계정의 쪽지가 떴다. 주인은 러빈지옥 진행 기록의 주인(useInfernoStore.ownerUserId)과 같고, 로그인·
 * 로그아웃 때 `switchUser` 로 함께 바꾼다. 로그아웃하면 쪽지를 지우지 않고 내려놓기만 해서, 같은 계정으로
 * 다시 로그인하면 그 계정의 쪽지가 뜬다(이번 실행에서 남긴 쪽지는 빼고).
 *
 * NOTE: 실행 직후에 읽으려면 이 모듈이 앱 시작 때 불려야 한다 — 루트 레이아웃(_layout.tsx)이
 * 쪽지 모달을 통해 이 스토어를 쓴다. 개발 중 Fast Refresh 로 이 파일이 다시 실행되면 같은 실행
 * 안에서도 쪽지가 뜰 수 있는데, 개발 환경에서만 생기는 일이다.
 */
interface PartnerLetterStore {
  /** 지금 쪽지의 주인 userId. 계정별로 나누기 전 기록이거나 로그아웃 상태면 undefined. */
  ownerUserId: number | undefined;
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
  /** 쪽지를 다른 계정 것으로 바꾼다. 로그인하면 그 userId, 로그아웃·세션 만료면 null. 지우지 않는다. */
  switchUser: (userId: number | null) => void;
  /** 지금 계정의 쪽지를 기기에서 완전히 지우고 내려놓는다(계정 탈퇴). */
  forgetCurrentUser: () => void;
}

/** 앱을 켤 때의 주인. 러빈지옥 진행 기록과 같은 계정이다. */
const initialOwnerUserId = useInfernoStore.getState().ownerUserId;

export const usePartnerLetterStore = create<PartnerLetterStore>((set, get) => ({
  ownerUserId: initialOwnerUserId,

  deliverableSender: readDeliverableSender(initialOwnerUserId),

  queueLetter: (sender) => {
    lettersQueuedThisRun.add(sender.id);
    setStorageJson(letterStorageKey(get().ownerUserId), sender);
  },

  markLetterRead: () => {
    const key = letterStorageKey(get().ownerUserId);
    const readSender = get().deliverableSender;
    const storedSender = getStorageJson<InfernoPartnerLetterSender>(key);

    // 이번 실행 중에 EP5 를 또 끝내서 새 쪽지가 남았으면 그건 지우지 않는다 — 다음 실행에 뜰 쪽지다.
    if (storedSender?.id === readSender?.id) {
      removeStorageItem(key);
    }

    set({ deliverableSender: null });
  },

  hideLetterForNow: () => set({ deliverableSender: null }),

  switchUser: (userId) => {
    // 계정별로 나누기 전 쪽지는 주인을 알 수 없어 다음 계정에 넘기지 않고 지운다(진행 기록과 같다).
    if (get().ownerUserId === undefined) {
      removeStorageItem(letterStorageKey(undefined));
    }

    const owner = userId ?? undefined;
    set({
      ownerUserId: owner,
      deliverableSender: owner === undefined ? null : readDeliverableSender(owner),
    });
  },

  forgetCurrentUser: () => {
    removeStorageItem(letterStorageKey(get().ownerUserId));
    get().switchUser(null);
  },
}));
