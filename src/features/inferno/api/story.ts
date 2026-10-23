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
} from '@/src/features/inferno/api/mocks/story-mock';
import type {
  AiChoiceOutcomeView,
  AiEpisodeContentView,
  AiMessageLikeView,
  AiStoryFeedbackHttpRequest,
  AiStoryFeedbackView,
  AiStoryLikeHttpRequest,
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
