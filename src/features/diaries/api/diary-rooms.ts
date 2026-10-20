import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';

import type {
  DiaryFeedItem,
  DiaryRoom,
  DiaryRoomKickResult,
  DiaryRoomMember,
  DiaryRoomMembership,
  DiaryRoomWriteRequest,
  RoomId,
  UserId,
} from '@/src/features/diaries/types';

/**
 * 공유방 API. 스펙: `docs/api/diaries.md` "공유방". 응답은 전부 `ApiEnvelope` 로 감싸져 온다.
 *
 * 공유방은 초대 방식이라 스스로 참여하는 API 가 없다 — 방장이 `addRoomMember` 로 넣어 준다.
 */

/** `POST /api/diary-rooms`. 만든 사람이 방장이 되고 멤버로도 들어간다. */
export async function createRoom(input: DiaryRoomWriteRequest): Promise<DiaryRoom> {
  const { data } = await httpClient.post<ApiEnvelope<DiaryRoom>>('/api/diary-rooms', input);
  return data.data;
}

/** `GET /api/diary-rooms` — 내가 방장이거나 멤버인 방. */
export async function getMyRooms(): Promise<DiaryRoom[]> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryRoom[]>>('/api/diary-rooms');
  return data.data;
}

export interface UpdateRoomInput extends DiaryRoomWriteRequest {
  roomId: RoomId;
}

/** `PUT /api/diary-rooms/{roomId}`. 방장만(403). */
export async function updateRoom({ roomId, ...body }: UpdateRoomInput): Promise<DiaryRoom> {
  const { data } = await httpClient.put<ApiEnvelope<DiaryRoom>>(`/api/diary-rooms/${roomId}`, body);
  return data.data;
}

/** `DELETE /api/diary-rooms/{roomId}`. 방장만(403). 방에 있던 일기도 같이 지워진다. */
export async function deleteRoom(roomId: RoomId): Promise<void> {
  await httpClient.delete(`/api/diary-rooms/${roomId}`);
}

/** `GET /api/diary-rooms/{roomId}/members`. 방장 · 멤버만(403). */
export async function getRoomMembers(roomId: RoomId): Promise<DiaryRoomMember[]> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryRoomMember[]>>(
    `/api/diary-rooms/${roomId}/members`,
  );
  return data.data;
}

export interface RoomMemberInput {
  roomId: RoomId;
  userId: UserId;
}

/** `POST /api/diary-rooms/{roomId}/members` — 초대. 방장만(403), 없는 사용자 404, 이미 멤버여도 200. */
export async function addRoomMember({ roomId, userId }: RoomMemberInput): Promise<DiaryRoomMembership> {
  const { data } = await httpClient.post<ApiEnvelope<DiaryRoomMembership>>(
    `/api/diary-rooms/${roomId}/members`,
    { userId },
  );
  return data.data;
}

/** `DELETE /api/diary-rooms/{roomId}/members/me` — 나가기. 방장은 못 나간다(400). */
export async function leaveRoom(roomId: RoomId): Promise<DiaryRoomMembership> {
  const { data } = await httpClient.delete<ApiEnvelope<DiaryRoomMembership>>(
    `/api/diary-rooms/${roomId}/members/me`,
  );
  return data.data;
}

/** `DELETE /api/diary-rooms/{roomId}/members/kick?userId=` — 강퇴. 방장만(403), 방장 자신은 400. */
export async function kickRoomMember({ roomId, userId }: RoomMemberInput): Promise<DiaryRoomKickResult> {
  const { data } = await httpClient.delete<ApiEnvelope<DiaryRoomKickResult>>(
    `/api/diary-rooms/${roomId}/members/kick`,
    { params: { userId } },
  );
  return data.data;
}

/** `GET /api/diary-rooms/{roomId}/diaries` — 이 방의 일기, 최신순. 방장 · 멤버만(403). */
export async function getRoomDiaries(roomId: RoomId): Promise<DiaryFeedItem[]> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryFeedItem[]>>(
    `/api/diary-rooms/${roomId}/diaries`,
  );
  return data.data;
}
