/**
 * 그룹 인원수 범위(방장 포함). Figma "2~6명", 백엔드 `maxMemberCount` 도 2~6 이다 — 혼자 쓰는 방(1명)은
 * 백엔드가 400 으로 막아서 한때 1명으로 낮췄던 최소를 2명으로 되돌렸다.
 */
export const GROUP_MEMBER_COUNT_MIN = 2;
export const GROUP_MEMBER_COUNT_MAX = 6;

/** 그룹별 닉네임(그룹장 · 참여자) 최대 글자 수. 백엔드가 10자를 넘으면 400 으로 막는다. */
export const GROUP_NICKNAME_MAX_LENGTH = 10;

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

export interface JoinGroupFormValues {
  inviteCode: string;
  nickname: string;
}

/** 참여하기 버튼을 눌러도 되는지 — 초대코드와 닉네임을 모두 채워야 한다. */
export function canSubmitJoinGroupForm({ inviteCode, nickname }: JoinGroupFormValues): boolean {
  return inviteCode.trim() !== '' && nickname.trim() !== '';
}
