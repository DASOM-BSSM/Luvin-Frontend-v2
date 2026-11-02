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
  AiChoiceHttpRequest,
  AiChoiceOutcomeView,
  AiChoiceStatusView,
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

async function postChoice(order: number, pointId: ChoicePoint, breadId: string | null) {
  if (isStoryMock) return mockSubmitChoice(order, pointId, breadId);
  // 혼자 있기는 필드를 빼지 않고 null 로 보낸다(계약 0장). 스펙이 `breadId: string | null` 로
  // 바뀌어서(2026-10-26) 요청 본문도 생성된 타입으로 맞춘다.
  const { data } = await httpClient.post<ApiEnvelope<AiChoiceOutcomeView>>(
    `${episodePath(order)}/choices`,
    { pointId, breadId } satisfies AiChoiceHttpRequest,
  );
  return data.data;
}

/**
 * `POST .../episodes/{order}/choices`. `breadId: null` = 혼자 있기. 같은 body 로 재시도해도 된다.
 *
 * 선택은 비동기다(스펙 2026-10-30). 서버는 선택만 바로 저장하고 결과 장면은 뒤에서 만든다 — 예전엔 요청
 * 안에서 만들어서 15초 타임아웃에 끊긴 뒤 다시 누르면 409 `CHOICE_ALREADY_MADE` 가 왔다. `choice.status` 가
 * `generating` 이면 `blocks` 가 비어 있으므로 끝날 때까지 기다렸다가 같은 선택을 다시 보내 저장된 결과를 받는다.
 * `choice` 가 없으면(목 서버) 바로 준비된 응답이다.
 */
export async function submitEpisodeChoice(
  order: number,
  pointId: ChoicePoint,
  breadId: string | null,
  options: StoryMapOptions = {},
) {
  let view = await postChoice(order, pointId, breadId);
  if (view.choice && view.choice.status !== 'ready') {
    await settleChoiceResult(order, view.choice);
    view = await postChoice(order, pointId, breadId);
    if (view.choice && view.choice.status !== 'ready')
      throw new ChoiceResultFailedError(view.choice.errorCode ?? null);
  }
  // 원본 시즌은 `GET /me` 캐시를 그대로 갈아끼울 때 쓴다(변환은 하지 않는다).
  return { ...mapChoiceOutcome(view, options), seasonView: view.season };
}

/** 결과 장면 생성 대기 간격과 상한. 회차 완료 대기와 같은 값을 쓴다(COMPLETION_POLL_MS 와 같은 이유). */
const CHOICE_POLL_MS = 2500;
const CHOICE_LIMIT_MS = 240000;
/** 결과 장면 생성이 실패했을 때 같은 선택을 다시 보내 다시 만들게 하는 횟수. */
const CHOICE_REGENERATE_LIMIT = 2;

/** 선택은 저장됐지만 결과 장면을 만들지 못했다. 같은 선택을 다시 보내면 결과 장면만 다시 만든다. */
export class ChoiceResultFailedError extends Error {
  constructor(readonly errorCode: string | null) {
    super('Choice result generation failed');
    this.name = 'ChoiceResultFailedError';
  }
}

/** 결과 장면 대기가 상한을 넘었다. 같은 선택을 다시 보내도 서버는 새로 시작하지 않고 상태만 돌려준다. */
export class ChoiceResultTimeoutError extends Error {
  constructor() {
    super('Choice result generation timed out');
    this.name = 'ChoiceResultTimeoutError';
  }
}

async function getStoryChoice(order: number) {
  const { data } = await httpClient.get<ApiEnvelope<{ story?: AiStoryStateView }>>(
    '/api/ai/seasons/me',
  );
  const choice = data.data.story?.choice;
  return choice?.order === order ? choice : null;
}

/**
 * 이 회차 선택의 결과 장면이 준비될 때까지 `GET /me` 의 `story.choice` 를 확인한다. null 이 되거나 `ready` 면
 * 끝이다. `failed` 면 같은 선택(`story.choice.breadId`)을 다시 보내 다시 만들게 한다. `first` 를 주면 그
 * 상태부터 본다(선택 응답에 이미 들어 있을 때).
 *
 * 409 `CHOICE_ALREADY_MADE`·`CHOICE_RESULT_NOT_READY` 뒤에도 쓴다 — 결과 장면이 준비돼야 본문에 들어가고
 * 회차를 완료할 수 있다.
 */
export async function settleChoiceResult(order: number, first?: AiChoiceStatusView | null) {
  if (isStoryMock) return;
  const startedAt = Date.now();
  let regenerated = 0;
  let choice = first === undefined ? await getStoryChoice(order) : first;
  while (choice && choice.status !== 'ready') {
    if (choice.status === 'failed') {
      const pointId = toChoicePoint(choice.pointId);
      if (regenerated >= CHOICE_REGENERATE_LIMIT || !pointId)
        throw new ChoiceResultFailedError(choice.errorCode ?? null);
      regenerated += 1;
      // 결과 장면 실패는 AI 를 부른 선택에서만 난다. 혼자 있기(breadId 없음)는 AI 를 부르지 않는다.
      choice = (await postChoice(order, pointId, choice.breadId ?? null)).choice ?? null;
      continue;
    }
    if (Date.now() - startedAt > CHOICE_LIMIT_MS) throw new ChoiceResultTimeoutError();
    await wait(CHOICE_POLL_MS);
    choice = await getStoryChoice(order);
  }
}

function toChoicePoint(value: number | undefined): ChoicePoint | null {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : null;
}

/**
 * 회차 완료는 비동기다(스펙 2026-10-28). `POST .../complete` 는 접수만 하고 `story.completion` 을
 * `{ order, status: 'completing' }` 로 바로 돌려준다. 끝나면 `completion` 이 null 이 되고 `completedOrders`
 * 에 회차가 들어간다. 그 전에 다음으로 넘어가면 2화가 열리지 않은 채 남았다(실서버 로그로 확인).
 */
const COMPLETION_POLL_MS = 2500;
/**
 * 10화 완료 대기 상한. 서버는 AI 생성을 여러 번 기다린다. 백엔드 작업 점유(worker lease)가 210초라
 * 그보다 길게 둔다(회차 생성 대기 POLL_LIMIT_MS 와 같은 값). 넘으면 다시 시도로 보낸다.
 */
const COMPLETION_LIMIT_MS = 240000;

/** 서버가 완료에 실패했다(`completion.status: failed`). 저장된 게 없어서 완료 요청을 다시 보내면 된다. */
export class EpisodeCompletionFailedError extends Error {
  constructor(readonly errorCode: string | null) {
    super('Episode completion failed');
    this.name = 'EpisodeCompletionFailedError';
  }
}

/** 완료 대기가 상한을 넘었다. 완료 요청을 다시 보내도 서버는 새로 시작하지 않고 진행 상태만 돌려준다. */
export class EpisodeCompletionTimeoutError extends Error {
  constructor() {
    super('Episode completion timed out');
    this.name = 'EpisodeCompletionTimeoutError';
  }
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

/** 이 회차 완료가 끝났는지. 실패면 던진다. */
function isCompletionDone(story: AiStoryStateView, order: number): boolean {
  const completion = story.completion;
  if (completion?.order === order && completion.status === 'failed')
    throw new EpisodeCompletionFailedError(completion.errorCode ?? null);
  return !completion && (story.completedOrders ?? []).includes(order);
}

/**
 * `POST .../episodes/{order}/complete` 를 보내고 접수 응답만 받는다(기다리지 않음). 1~9화는 이걸로 바로
 * 회차를 나가고, 서버 정리는 뒤에서 use-completion-watcher 가 확인한다(사용자 요청 — 저장을 기다리지 않게).
 * 실패(`completion.status: failed`) 뒤 다시 보내면 서버가 처음부터 다시 시도한다.
 */
export async function requestEpisodeCompletion(order: number) {
  if (isStoryMock) {
    const mock = await mockCompleteEpisode(order);
    return { state: mapStoryState(mock), seasonView: mock };
  }
  const { data } = await httpClient.post<ApiEnvelope<AiStoryStateView>>(
    `${episodePath(order)}/complete`,
  );
  return { state: mapStoryState(data.data), seasonView: data.data };
}

/**
 * 10화 전용: `POST .../episodes/{order}/complete` 를 보내고, 서버가 끝낼 때까지 `GET /me` 의 `story.completion` 을
 * 확인한다. 이미 완료한 회차면 첫 응답에서 바로 끝난다. 다음 회차가 열리고 회차 쪽지가 생긴다.
 */
export async function completeEpisode(order: number) {
  if (isStoryMock) {
    const mock = await mockCompleteEpisode(order);
    return { state: mapStoryState(mock), seasonView: mock };
  }
  const { data } = await httpClient.post<ApiEnvelope<AiStoryStateView>>(
    `${episodePath(order)}/complete`,
  );
  let story = data.data;
  const startedAt = Date.now();
  while (!isCompletionDone(story, order)) {
    if (Date.now() - startedAt > COMPLETION_LIMIT_MS) throw new EpisodeCompletionTimeoutError();
    await wait(COMPLETION_POLL_MS);
    const status = await httpClient.get<ApiEnvelope<{ story?: AiStoryStateView }>>(
      '/api/ai/seasons/me',
    );
    story = status.data.data.story ?? story;
  }
  return { state: mapStoryState(story), seasonView: story };
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
 * [DRAFT] 목 모드에서 실제 프로필의 나이를 목 서버에 알린다. 목 서버는 나이를 메모리에만 들고 있어서
 * 앱을 다시 불러올 때마다 잊었고, 프로필에 나이가 있는데도 1화가 AGE_REQUIRED 로 막혔다(사용자 지적).
 * 실제 서버 모드에서는 아무것도 하지 않는다.
 */
export function syncMockAge(age: number | undefined) {
  if (isStoryMock && age !== undefined) setMockAge(age);
}

/**
 * 나이 저장(`PUT /api/users/me { age }`). 마이페이지가 쓴다(409 `AGE_REQUIRED` 면 회차가 마이페이지로 보낸다).
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
 * 회차 열기(`POST .../episodes/{order}/unlock`, 라이브 스펙 2026-10-26 확정). 4화 이상을 처음 볼 때
 * 토큰을 한 번 쓴다. 1~3화나 이미 연 회차는 차감 없이 `unlocked: true`.
 * 오류: 409 `INSUFFICIENT_TOKENS`(토큰 부족), `PREVIOUS_EPISODE_NOT_COMPLETED`, `STORY_NOT_STARTED`,
 * `SEASON_COMPLETED`.
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
