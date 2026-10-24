/**
 * [DRAFT] 새 10화 회차 API(`러빈지옥 회차` 태그). 응답은 utils/map-story.ts 로 바꿔서 돌려준다.
 *
 * `EXPO_PUBLIC_USE_MOCK=true` 면 서버 대신 api/mocks/story-mock.ts 를 부른다. 목도 openapi
 * 모양으로 답하므로 화면과 변환 함수는 어느 쪽이든 똑같이 동작한다.
 */
import {
  mockCompleteEpisode,
  mockGetEpisodeContent,
  mockSetSceneLike,
  mockSubmitChoice,
  mockSubmitSceneFeedback,
  mockTokenBalance,
  mockUnlockEpisode,
  setMockAge,
} from '@/src/features/inferno/api/mocks/story-mock';
import type {
  AiChoiceOutcomeView,
  AiEpisodeContentView,
  AiMessageLikeView,
  AiStoryFeedbackHttpRequest,
  AiStoryFeedbackView,
  AiStoryLikeHttpRequest,
  AiEpisodeUnlockView,
  AiStoryStateView,
} from '@/src/features/inferno/api/story-types';
import type { ChoicePoint } from '@/src/features/inferno/types/story';
import {
  mapChoiceOutcome,
  mapEpisodeContent,
  mapStoryState,
  type StoryMapOptions,
} from '@/src/features/inferno/utils/map-story';
import type { ApiEnvelope } from '@/src/lib/api-envelope';
import { getMyTokenBalance } from '@/src/features/tokens/api/tokens';
import type { Gender } from '@/src/features/my-page/types';
import { updateMyProfile } from '@/src/features/user/api/profile';
import httpClient from '@/src/lib/http-client';

export const isStoryMock = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

const episodePath = (order: number) => `/api/ai/seasons/episodes/${order}`;

/** `GET .../episodes/{order}/content`. 생성 중이면 `status: 'generating'` 으로 온다. */
export async function getEpisodeContent(order: number, options: StoryMapOptions = {}) {
  const view = isStoryMock
    ? await mockGetEpisodeContent(order)
    : (
        await httpClient.get<ApiEnvelope<AiEpisodeContentView>>(`${episodePath(order)}/content`)
      ).data.data;
  return mapEpisodeContent(view, order, options);
}

/** `POST .../episodes/{order}/choices`. `breadId: null` = 혼자 있기. 같은 body 로 재시도해도 된다. */
export async function submitEpisodeChoice(
  order: number,
  pointId: ChoicePoint,
  breadId: string | null,
  options: StoryMapOptions = {},
) {
  const view = isStoryMock
    ? await mockSubmitChoice(order, pointId, breadId)
    : (
        // 혼자 있기는 필드를 빼지 않고 null 로 보낸다(계약 0장). 생성된 타입은 null 을
        // 표현하지 못해서(`breadId?: string`) 요청 본문 타입을 따로 붙이지 않는다.
        await httpClient.post<ApiEnvelope<AiChoiceOutcomeView>>(`${episodePath(order)}/choices`, {
          pointId,
          breadId,
        })
      ).data.data;
  // 원본 시즌은 `GET /me` 캐시를 그대로 갈아끼울 때 쓴다(변환은 하지 않는다).
  return { ...mapChoiceOutcome(view, options), seasonView: view.season };
}

/** `POST .../episodes/{order}/complete`. 다음 회차가 열리고 회차 쪽지가 생긴다. */
export async function completeEpisode(order: number) {
  const view = isStoryMock
    ? await mockCompleteEpisode(order)
    : (await httpClient.post<ApiEnvelope<AiStoryStateView>>(`${episodePath(order)}/complete`)).data
        .data;
  return { state: mapStoryState(view), seasonView: view };
}

/** `POST .../episodes/{order}/scene-feedback`. 1:1 장면의 내 빵 대사 하나에. text 200자 이내. */
export async function submitSceneFeedback(
  order: number,
  request: Required<Pick<AiStoryFeedbackHttpRequest, 'blockId' | 'messageId' | 'text'>>,
): Promise<AiStoryFeedbackView> {
  if (isStoryMock)
    return mockSubmitSceneFeedback(order, request.blockId, request.messageId, request.text);
  const { data } = await httpClient.post<ApiEnvelope<AiStoryFeedbackView>>(
    `${episodePath(order)}/scene-feedback`,
    request,
  );
  return data.data;
}

/** `POST .../episodes/{order}/scene-likes`. 켜고 끄는 값을 직접 보낸다(토글 아님). */
export async function setSceneLike(
  order: number,
  request: Required<Pick<AiStoryLikeHttpRequest, 'blockId' | 'messageId' | 'liked'>>,
): Promise<AiMessageLikeView> {
  if (isStoryMock)
    return mockSetSceneLike(order, request.blockId, request.messageId, request.liked);
  const { data } = await httpClient.post<ApiEnvelope<AiMessageLikeView>>(
    `${episodePath(order)}/scene-likes`,
    request,
  );
  return data.data;
}

/**
 * 나이 저장(`PUT /api/users/me { age }`). 409 `AGE_REQUIRED` 바텀시트와 마이페이지가 쓴다.
 * 목 모드면 목 서버에도 알린다 — 목 서버가 1화에서 나이로 배경을 정한다.
 */
export async function saveStoryAge(age: number): Promise<void> {
  if (isStoryMock) {
    setMockAge(age);
    return;
  }
  await updateMyProfile({ age });
}

/**
 * 나이·성별 함께 저장(`PUT /api/users/me { age, gender }`, 계약 v4). 409 `AGE_REQUIRED` 바텀시트가 쓴다.
 * 둘은 반드시 같이 정한다 — "선택 안 함"은 없다. 목 모드면 목 서버에 나이만 알린다(배경을 나이로 정한다).
 */
export async function saveStoryProfile(profile: { age: number; gender: Gender }): Promise<void> {
  if (isStoryMock) {
    setMockAge(profile.age);
    return;
  }
  await updateMyProfile(profile);
}

/**
 * [DRAFT] 회차 열기(계약 v3 "토큰 정책"). 4화 이상을 처음 볼 때 토큰을 한 번 쓴다. 1~3화나 이미 연
 * 회차는 차감 없이 `unlocked: true`. 백엔드가 아직 만드는 중이라 openapi 에 확정되면 이 함수와
 * story-types.ts 의 AiEpisodeUnlockView 만 맞춰 고친다.
 * 오류: 409 `INSUFFICIENT_TOKENS`(토큰 부족).
 */
export async function unlockEpisode(order: number) {
  const view = isStoryMock
    ? await mockUnlockEpisode(order)
    : (await httpClient.post<ApiEnvelope<AiEpisodeUnlockView>>(`${episodePath(order)}/unlock`)).data
        .data;
  return { unlocked: view.unlocked === true, tokenBalance: view.tokenBalance };
}

/** 회차 열기 화면에 보여줄 보유 토큰. 목 모드면 목 서버의 토큰을 쓴다. */
export async function getStoryTokenBalance(): Promise<number> {
  if (isStoryMock) return mockTokenBalance();
  return (await getMyTokenBalance()).tokenBalance;
}
