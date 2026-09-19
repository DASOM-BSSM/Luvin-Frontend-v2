import { createMMKV } from 'react-native-mmkv';

/**
 * 비민감 로컬 데이터(온보딩 여부, 설문 임시저장, 토큰 잔액 등) 전용 MMKV 인스턴스.
 *
 * AGENTS.md §12/§15 — 이 파일이 MMKV를 직접 다루는 유일한 모듈이다.
 * 컴포넌트/스토어는 절대 `react-native-mmkv`를 직접 import 하지 말고 아래 함수들을 통해서만 접근할 것.
 * 토큰 등 민감하지 않은 값만 취급하고, 인증 토큰/시크릿은 여기 두지 않는다(§12 표 참고).
 */
const mmkv = createMMKV({ id: 'luvin-storage' });

export function getStorageString(key: string): string | undefined {
  return mmkv.getString(key);
}

export function setStorageString(key: string, value: string): void {
  mmkv.set(key, value);
}

export function getStorageNumber(key: string): number | undefined {
  return mmkv.getNumber(key);
}

export function setStorageNumber(key: string, value: number): void {
  mmkv.set(key, value);
}

export function getStorageBoolean(key: string): boolean | undefined {
  return mmkv.getBoolean(key);
}

export function setStorageBoolean(key: string, value: boolean): void {
  mmkv.set(key, value);
}

export function removeStorageItem(key: string): void {
  mmkv.remove(key);
}
