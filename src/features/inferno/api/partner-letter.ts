/**
 * [DRAFT] 회차 쪽지. 회차를 완료할 때마다 서버가 한 통씩 만들고(10화 쪽지가 시즌 종료 쪽지),
 * 앱은 안 읽은 쪽지를 받아 펼친 뒤 읽음으로 표시한다(계약 0장). 응답 형식은 기존 그대로다.
 * `EXPO_PUBLIC_USE_MOCK=true` 면 목 서버를 쓴다.
 */
import { mockGetUnreadLetter, mockMarkLetterRead } from '@/src/features/inferno/api/mocks/story-mock';
import { isStoryMock } from '@/src/features/inferno/api/story';
import type { PartnerLetterView } from '@/src/features/inferno/api/story-types';
import type { ApiEnvelope } from '@/src/lib/api-envelope';
import httpClient from '@/src/lib/http-client';

/** `GET /api/ai/seasons/letters/unread`. 안 읽은 쪽지가 없으면 null. */
export async function getUnreadLetter(): Promise<PartnerLetterView | null> {
  if (isStoryMock) return mockGetUnreadLetter();
  const { data } = await httpClient.get<ApiEnvelope<PartnerLetterView | null>>(
    '/api/ai/seasons/letters/unread',
  );
  return data.data ?? null;
}

/** `POST /api/ai/seasons/letters/{letterId}/read`. */
export async function markLetterRead(letterId: number): Promise<void> {
  if (isStoryMock) return mockMarkLetterRead(letterId);
  await httpClient.post(`/api/ai/seasons/letters/${letterId}/read`);
}
