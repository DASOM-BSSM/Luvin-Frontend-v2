/** 그룹 인원수 범위. Figma "그룹 인원수 2~6명". */
export const GROUP_MEMBER_COUNT_MIN = 2;
export const GROUP_MEMBER_COUNT_MAX = 6;

/** 숫자 키패드로 받은 인원수 입력에서 숫자만 남긴다. */
export function sanitizeMemberCountInput(value: string): string {
  return value.replace(/[^0-9]/g, '');
}

/** 비어 있지 않고 2~6 사이인지. */
export function isValidMemberCount(value: string): boolean {
  if (value === '') return false;
  const count = Number(value);
  return Number.isInteger(count) && count >= GROUP_MEMBER_COUNT_MIN && count <= GROUP_MEMBER_COUNT_MAX;
}

export interface CreateGroupFormValues {
  name: string;
  memberCount: string;
  ownerNickname: string;
}

/** 만들기 버튼을 눌러도 되는지 — 세 칸 모두 채우고 인원수가 범위 안이어야 한다. */
export function canSubmitCreateGroupForm({ name, memberCount, ownerNickname }: CreateGroupFormValues): boolean {
  return name.trim() !== '' && ownerNickname.trim() !== '' && isValidMemberCount(memberCount);
}
