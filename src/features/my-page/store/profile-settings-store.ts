import { create } from "zustand";

import type { Gender } from "@/src/features/my-page/types";
import { getStorageString, removeStorageItem, setStorageString } from "@/src/lib/storage";

/** 비민감 값이라 MMKV 에 둔다(AGENTS.md §12 표). */
const NICKNAME_KEY = "my-page.nickname";
const GENDER_KEY = "my-page.gender";

function isGender(value: string | undefined): value is Gender {
  return value === "female" || value === "male";
}

interface ProfileSettingsStore {
  /** 사용자가 "내 정보 수정"에서 새로 입력한 닉네임. 아직 아무것도 안 넣었으면 빈 문자열. */
  nickname: string;
  /**
   * 마지막으로 저장한 성별. 아직 고르지 않았으면 undefined — 기본값을 두지 않는다(사용자 결정:
   * 성별은 반드시 직접 고른다). 수정 화면의 선택값은 이 값이 아니라 서버 값을 따른다.
   */
  gender: Gender | undefined;
  setNickname: (nickname: string) => void;
  setGender: (gender: Gender) => void;
  clearGender: () => void;
}

export const useProfileSettingsStore = create<ProfileSettingsStore>((set) => {
  const storedGender = getStorageString(GENDER_KEY);

  return {
    nickname: getStorageString(NICKNAME_KEY) ?? "",
    gender: isGender(storedGender) ? storedGender : undefined,

    setNickname: (nickname) => {
      setStorageString(NICKNAME_KEY, nickname);
      set({ nickname });
    },

    setGender: (gender) => {
      setStorageString(GENDER_KEY, gender);
      set({ gender });
    },

    clearGender: () => {
      removeStorageItem(GENDER_KEY);
      set({ gender: undefined });
    },
  };
});
