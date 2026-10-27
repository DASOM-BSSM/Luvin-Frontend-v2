import httpClient from '@/src/lib/http-client';
import type { ApiEnvelope } from '@/src/lib/api-envelope';

import type {
  DiaryFeedItem,
  DiaryRoom,
  DiaryRoomInviteCode,
  DiaryRoomKickResult,
  DiaryRoomMember,
  DiaryRoomMembership,
  DiaryRoomWriteRequest,
  JoinRoomRequest,
  RoomId,
  UserId,
} from '@/src/features/diaries/types';

/**
 * 공유방 API. 스펙: `docs/api/openapi.json` "감정일기 공유방". 응답은 전부 `ApiEnvelope` 로 감싸져 온다.
 *
 * 참여는 초대코드로 한다 — 방장 · 멤버가 `getRoomInviteCode` 로 코드를 보고, 받은 사람이
 * `joinRoomByInviteCode` 로 들어온다. 방장이 userId 로 직접 넣는 `addRoomMember` 도 남아 있다.
 */

/**
 * `POST /api/diary-rooms`. 만든 사람이 방장이 되고 `ownerNickname` 이 그 방의 방장 닉네임이 된다.
 * `maxMemberCount` 가 2~6 밖이면 400.
 */
export async function createRoom(input: DiaryRoomWriteRequest): Promise<DiaryRoom> {
  const { data } = await httpClient.post<ApiEnvelope<DiaryRoom>>('/api/diary-rooms', input);
  return data.data;
}

/** `GET /api/diary-rooms/{roomId}` — 방 하나. 방장 · 멤버만(403), 없는 방은 404. */
export async function getRoom(roomId: RoomId): Promise<DiaryRoom> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryRoom>>(`/api/diary-rooms/${roomId}`);
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

/**
 * `PUT /api/diary-rooms/{roomId}`. 방장만(403). 모든 필드를 다시 보낸다. 최대 인원을 지금 인원보다
 * 적게 하면 409 `DIARY_ROOM_MAX_BELOW_MEMBER_COUNT`, 방장 닉네임이 다른 멤버와 겹치면
 * 409 `DIARY_ROOM_NICKNAME_DUPLICATED`.
 */
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

/** `GET /api/diary-rooms/{roomId}/invite-code` — 방장 · 멤버만(403). */
export async function getRoomInviteCode(roomId: RoomId): Promise<DiaryRoomInviteCode> {
  const { data } = await httpClient.get<ApiEnvelope<DiaryRoomInviteCode>>(
    `/api/diary-rooms/${roomId}/invite-code`,
  );
  return data.data;
}

/** `POST /api/diary-rooms/{roomId}/invite-code` — 재발급. 방장만(403), 이전 코드는 바로 못 쓴다. */
export async function reissueRoomInviteCode(roomId: RoomId): Promise<DiaryRoomInviteCode> {
  const { data } = await httpClient.post<ApiEnvelope<DiaryRoomInviteCode>>(
    `/api/diary-rooms/${roomId}/invite-code`,
  );
  return data.data;
}

/**
 * `POST /api/diary-rooms/join` — 초대코드로 참여. 대소문자 상관없고, 이미 멤버여도 200(닉네임은 안 바뀐다).
 * 틀린 코드면 404, 인원이 가득 찼으면 409 `DIARY_ROOM_FULL`, 같은 방에 같은 닉네임이 있으면
 * 409 `DIARY_ROOM_NICKNAME_DUPLICATED`.
 */
export async function joinRoomByInviteCode(input: JoinRoomRequest): Promise<DiaryRoomMembership> {
  const { data } = await httpClient.post<ApiEnvelope<DiaryRoomMembership>>(
    '/api/diary-rooms/join',
    input,
  );
  return data.data;
}
