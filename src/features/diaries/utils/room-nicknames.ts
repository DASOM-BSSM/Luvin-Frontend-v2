import type { DiaryRoomMember, UserId } from '@/src/features/diaries/types';

/**
 * 멤버 목록에서 "사용자 id → 이 그룹에서 정한 닉네임" 표를 만든다(LUV-121).
 *
 * 일기 · 댓글 · 질문 답 API 의 `authorNickname` 은 계정 닉네임이라(백엔드 확인), 그룹 닉네임은
 * 멤버 목록(`DiaryRoomMemberResponse.nickname`)에서 작성자 id 로 찾아 쓴다.
 * 닉네임이 비어 있는 멤버(닉네임이 생기기 전에 들어온 멤버)는 표에 넣지 않는다 — 그때는 빵 이름을 쓴다.
 */
export function toRoomNicknames(members: readonly DiaryRoomMember[]): Map<UserId, string> {
  const nicknames = new Map<UserId, string>();
  for (const member of members) {
    const nickname = member.nickname?.trim();
    if (nickname) nicknames.set(member.id, nickname);
  }
  return nicknames;
}
