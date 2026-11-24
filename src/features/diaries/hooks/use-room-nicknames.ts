import useRoomMembers from '@/src/features/diaries/hooks/use-room-members';
import type { RoomId, UserId } from '@/src/features/diaries/types';
import { toRoomNicknames } from '@/src/features/diaries/utils/room-nicknames';

/**
 * 이 그룹에서 정한 닉네임을 사용자 id 로 찾는 함수(LUV-121). 멤버 목록을 받기 전이거나 닉네임이 없으면 null —
 * 그때 화면은 빵 이름을 쓴다(`resolveAuthorName`).
 */
export default function useRoomNicknames(roomId: RoomId | undefined) {
  const nicknames = toRoomNicknames(useRoomMembers(roomId).data ?? []);

  return function getRoomNickname(userId: UserId | null | undefined): string | null {
    if (userId === null || userId === undefined) return null;
    return nicknames.get(userId) ?? null;
  };
}
