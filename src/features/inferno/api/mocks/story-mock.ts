/**
 * [DRAFT] 새 10화 API 목 서버. `EXPO_PUBLIC_USE_MOCK=true` 일 때 api/story.ts 가 이 모듈을 부른다.
 *
 * 응답은 openapi 형식(uuid 빵 id, `isMe`, 메시지별 `read`/`typing`/`deletedAfterSend`)으로
 * 만들어서, 실제 API 와 똑같이 utils/map-story.ts 를 거치게 한다. 대사는 기존 목
 * (episode-blocks.ts)을 쓰고, 수락·거절 판정도 기존 규칙(resolve-choice.ts)을 그대로 쓴다 —
 * 역할 고정 id 로 분기하는 코드는 이 목 안에만 있다.
 *
 * 상태는 앱을 다시 켜기 전까지만 남는다. 시나리오는 `EXPO_PUBLIC_MOCK_SCENARIO`
 * (default | all-accept | ep6-reject), 처음 나이는 `EXPO_PUBLIC_MOCK_AGE`(비우면 나이 없음),
 * 처음 토큰은 `EXPO_PUBLIC_MOCK_TOKENS`(비우면 3).
 *
 * 회차 열기(unlock)는 계약 v3 "토큰 정책" 형식(`{ order, unlocked, tokenBalance }`)으로 답한다.
 * 1~3화는 무료라 처음부터 열려 있다.
 */
import { AxiosError, AxiosHeaders } from 'axios';

import {
  buildEpisodeContent,
  choiceResultBlocks,
} from '@/src/features/inferno/api/mocks/episode-blocks';
import { SCENE_CAST } from '@/src/features/inferno/api/mocks/scene-cast';
import {
  EPISODE_SITUATIONS,
  EPISODE_TITLES,
  STAGE_ROLES,
  STAGE_TITLES,
  settingForAge,
} from '@/src/features/inferno/api/mocks/story-settings';
import type {
  AiChoiceOutcomeView,
  AiEpisodeContentView,
  AiMessageLikeView,
  AiSceneBlockView,
  AiStoryFeedbackView,
  AiStoryMessageView,
  AiStoryParticipantView,
  AiStoryStateView,
  AiStoryUnlockFields,
  AiEpisodeUnlockView,
  PartnerLetterView,
} from '@/src/features/inferno/api/story-types';
import type { AiReportView } from '@/src/features/inferno/api/ai-season-types';
import type { InfernoParticipant } from '@/src/features/inferno/types';
import type {
  ChoicePoint,
  SceneBlock,
  SceneSeasonState,
} from '@/src/features/inferno/api/mocks/mock-scene-types';
import type { SeasonSetting } from '@/src/features/inferno/types/story';
import { applyChoice, resolveChoice } from '@/src/features/inferno/api/mocks/mock-choice-rules';

const MOCK_DELAY_MS = 300;
/** 목 서버가 정한 회차 열기 비용. 실제 값은 서버가 `episodeTokenCost` 로 준다. */
const MOCK_EPISODE_TOKEN_COST = 1;
const MOCK_FREE_ORDERS = [1, 2, 3];
const DEFAULT_MOCK_TOKENS = 3;
const LAST_ORDER = 10;
const CHOICE_ORDERS: Record<number, ChoicePoint> = { 3: 1, 5: 2, 6: 3, 8: 4 };

function parseNumber(value: string | undefined): number | null {
  const age = Number.parseInt(value ?? '', 10);
  return Number.isNaN(age) ? null : age;
}

interface MockServer {
  age: number | null;
  setting: SeasonSetting | null;
  season: SceneSeasonState;
  completed: number[];
  /** 한 번 요청한 회차. 첫 요청은 generating 으로 답해서 폴링을 확인할 수 있게 한다. */
  requested: number[];
  likes: string[];
  feedbacks: AiStoryFeedbackView[];
  unlocked: number[];
  tokens: number;
  /** 회차를 끝낼 때마다 한 통씩 쌓이는 쪽지. 서버처럼 `partnerName` 은 비워 둔다. */
  letters: PartnerLetterView[];
  readLetterIds: number[];
}

const server: MockServer = {
  age: parseNumber(process.env.EXPO_PUBLIC_MOCK_AGE),
  setting: null,
  season: { route: null, choices: [], rejectCount: {} },
  completed: [],
  requested: [],
  likes: [],
  feedbacks: [],
  unlocked: [...MOCK_FREE_ORDERS],
  tokens: parseNumber(process.env.EXPO_PUBLIC_MOCK_TOKENS) ?? DEFAULT_MOCK_TOKENS,
  letters: [],
  readLetterIds: [],
};

const scenario = () => process.env.EXPO_PUBLIC_MOCK_SCENARIO ?? 'default';

function wait() {
  return new Promise<void>((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

/** 실제 서버 오류와 같은 모양(`response.data.code`)으로 던진다. utils/story-error.ts 가 읽는다. */
function mockError(status: number, code: string | null): AxiosError {
  const config = { headers: new AxiosHeaders() };
  return new AxiosError(code ?? 'Bad Request', String(status), config, undefined, {
    data: { success: false, data: null, message: null, code },
    status,
    statusText: '',
    headers: {},
    config,
  });
}

/** 목 빵 id(`castella` 등) → 고정 uuid. 실제 서버처럼 화면에는 uuid 만 보이게 한다. */
const uuidByMockId = new Map<string, string>();
function uuidFor(mockId: string): string {
  const existing = uuidByMockId.get(mockId);
  if (existing) return existing;
  const next = `00000000-0000-4000-8000-${String(uuidByMockId.size + 1).padStart(12, '0')}`;
  uuidByMockId.set(mockId, next);
  return next;
}
function mockIdFor(uuid: string): string | undefined {
  return [...uuidByMockId.entries()].find(([, value]) => value === uuid)?.[0];
}

function stageRole(mockId: string): string | undefined {
  return server.setting ? STAGE_ROLES[server.setting][mockId]?.role : undefined;
}

function toParticipant(person: InfernoParticipant): AiStoryParticipantView {
  return {
    breadId: uuidFor(person.id),
    name: person.name,
    breadType: person.type,
    isMe: person.isMine,
    stageRole: person.isMine ? undefined : stageRole(person.id),
  };
}

function toBlock(block: SceneBlock): AiSceneBlockView {
  if (block.type === 'transition') return { id: block.id, type: 'transition', transitionText: block.text };
  if (block.type === 'choice')
    return {
      id: block.id,
      type: 'choice',
      choice: {
        pointId: block.choice.pointId,
        question: block.choice.question,
        candidates: block.choice.candidates.map((candidate) => ({
          breadId: uuidFor(candidate.breadId),
          memory: candidate.memory,
        })),
      },
    };
  const monologue = block.messages.every((message) => message.participantId === 'me');
  const events = block.type === 'messenger' ? block.events : {};
  // 혼자 있기 결과에는 대사가 없다(계약 0장) — 결과 장면 없이 다음 블록으로 넘어간다.
  const solo = block.type === 'choice_result' && block.result.breadId === null;
  const messages: AiStoryMessageView[] = solo
    ? []
    : block.messages.map((message, index) => ({
        messageId: message.id,
        sequence: index,
        speakerId: uuidFor(message.participantId),
        kind: monologue && block.type === 'pair' ? 'monologue' : 'chat',
        text: message.text,
        read: events[message.id] === 'read',
        typing: events[message.id] === 'typing',
        deletedAfterSend: events[message.id] === 'deleted',
      }));
  const base: AiSceneBlockView = {
    id: block.id,
    type: block.type,
    participants: block.participants.map(toParticipant),
    messages,
  };
  if (block.type === 'messenger') return { ...base, messenger: { kind: block.kind, roomName: block.roomName } };
  if (block.type === 'interview')
    return { ...base, interview: { breadId: uuidFor(block.messages[0]?.participantId ?? '') } };
  if (block.type === 'choice_result')
    return {
      ...base,
      choiceResult: {
        pointId: block.result.pointId,
        breadId: block.result.breadId ? uuidFor(block.result.breadId) : undefined,
        accepted: block.result.accepted,
      },
    };
  return base;
}

function statusText(mockId: string): string {
  const picks = server.season.choices.filter((choice) => choice.breadId === mockId);
  if (server.season.route === 'romance' && picks.some((choice) => choice.pointId === 3 && choice.accepted))
    return '연애 중';
  if (picks.some((choice) => !choice.accepted)) return '어색함';
  return picks.length > 0 ? '친해짐' : '알아가는 중';
}

function storyState(): AiStoryStateView & AiStoryUnlockFields {
  const confession = server.season.choices.find((choice) => choice.pointId === 3);
  return {
    setting: server.setting ?? undefined,
    currentOrder: Math.min(LAST_ORDER, Math.max(0, ...server.completed) + 1),
    completedOrders: [...server.completed].sort((a, b) => a - b),
    route: server.season.route ?? undefined,
    romancePartnerId:
      server.season.route === 'romance' && confession?.breadId ? uuidFor(confession.breadId) : undefined,
    choices: server.season.choices.map((choice) => ({
      pointId: choice.pointId,
      episodeOrder: choice.order,
      breadId: choice.breadId ? uuidFor(choice.breadId) : undefined,
      accepted: choice.accepted,
    })),
    unlockedOrders: [...server.unlocked].sort((a, b) => a - b),
    episodeTokenCost: MOCK_EPISODE_TOKEN_COST,
    breads: SCENE_CAST.filter((person) => !person.isMine).map((person) => ({
      breadId: uuidFor(person.id),
      name: person.name,
      statusText: statusText(person.id),
    })),
  };
}

/** `GET /api/ai/seasons/me` 의 `story`·`characters`. */
export function mockSeasonStory() {
  return {
    story: storyState(),
    characters: SCENE_CAST.map((person) => ({
      characterId: uuidFor(person.id),
      name: person.name,
      role: person.isMine ? 'REPRESENTATIVE' : 'CANDIDATE',
      gender: '',
    })),
    completed: server.completed.includes(LAST_ORDER),
  };
}

function blocksFor(order: number) {
  return buildEpisodeContent(order, server.season).blocks;
}

export async function mockGetEpisodeContent(order: number): Promise<AiEpisodeContentView> {
  await wait();
  if (order < 1 || order > LAST_ORDER) throw mockError(400, null);
  if (order === 1 && !server.setting) {
    if (server.age === null) throw mockError(409, 'AGE_REQUIRED');
    // 시즌 처음 1화를 요청할 때 한 번만 정한다. 나이를 바꿔도 이 시즌 배경은 그대로다.
    server.setting = settingForAge(server.age, Math.random());
  }
  if (!server.setting) throw mockError(409, 'STORY_NOT_STARTED');
  if (order > 1 && !server.completed.includes(order - 1))
    throw mockError(409, 'PREVIOUS_EPISODE_NOT_COMPLETED');
  if (!server.unlocked.includes(order)) throw mockError(409, 'EPISODE_NOT_UNLOCKED');
  if (!server.requested.includes(order)) {
    server.requested.push(order);
    return { order, status: 'generating' };
  }
  const setting = server.setting;
  return {
    order,
    status: 'ready',
    intro: { title: EPISODE_TITLES[order], situation: EPISODE_SITUATIONS[setting][order] },
    stageIntro:
      order === 1
        ? {
            setting,
            ...STAGE_TITLES[setting],
            cast: SCENE_CAST.map((person) => ({
              breadId: uuidFor(person.id),
              name: person.name,
              breadType: person.type,
              role: person.isMine ? '나' : (STAGE_ROLES[setting][person.id]?.role ?? ''),
              description: person.isMine ? undefined : STAGE_ROLES[setting][person.id]?.description,
            })),
          }
        : undefined,
    blocks: blocksFor(order).map(toBlock),
    completed: server.completed.includes(order),
    feedbacks: server.feedbacks.filter((feedback) => feedback.order === order),
    likedMessageIds: server.likes,
  };
}

export async function mockSubmitChoice(
  order: number,
  pointId: number,
  breadId: string | null,
): Promise<AiChoiceOutcomeView> {
  await wait();
  const point = CHOICE_ORDERS[order];
  if (!point || point !== pointId) throw mockError(400, null);
  if (!server.requested.includes(order)) throw mockError(409, 'CONTENT_NOT_READY');
  const mockId = breadId === null ? null : (mockIdFor(breadId) ?? null);
  if (breadId !== null && !mockId) throw mockError(400, null);
  const previous = server.season.choices.find((choice) => choice.pointId === pointId);
  if (previous && previous.breadId !== mockId) throw mockError(409, 'CHOICE_ALREADY_MADE');
  const record =
    previous ?? resolveChoice(server.season, point, order, mockId, scenario());
  server.season = applyChoice(server.season, record);
  return { blocks: choiceResultBlocks(record).map(toBlock), season: storyState() };
}

export async function mockCompleteEpisode(order: number): Promise<AiStoryStateView> {
  await wait();
  if (!server.requested.includes(order)) throw mockError(409, 'CONTENT_NOT_READY');
  const pointId = CHOICE_ORDERS[order];
  if (pointId && !server.season.choices.some((choice) => choice.pointId === pointId))
    throw mockError(409, 'CHOICE_REQUIRED');
  if (!server.completed.includes(order)) {
    server.completed.push(order);
    server.letters.push(mockLetter(order));
  }
  return storyState();
}

/** 피드백·좋아요는 상대가 있는 pair 블록의 내 빵 대사(독백 제외)에만 남길 수 있다. */
function assertMyPairLine(order: number, blockId: string | undefined, messageId: string) {
  const all = [
    ...blocksFor(order),
    ...server.season.choices.filter((choice) => choice.order === order).flatMap(choiceResultBlocks),
  ].map(toBlock);
  const block = all.find((item) => item.id === blockId);
  const message = block?.messages?.find((item) => item.messageId === messageId);
  const mine = block?.participants?.find((person) => person.isMe)?.breadId;
  if (block?.type !== 'pair' || !message || message.speakerId !== mine || message.kind === 'monologue')
    throw mockError(400, null);
}

export async function mockSubmitSceneFeedback(
  order: number,
  blockId: string,
  messageId: string,
  text: string,
): Promise<AiStoryFeedbackView> {
  await wait();
  assertMyPairLine(order, blockId, messageId);
  const feedback = { order, blockId, messageId, text };
  server.feedbacks = [...server.feedbacks.filter((item) => item.messageId !== messageId), feedback];
  return feedback;
}

export async function mockSetSceneLike(
  order: number,
  blockId: string,
  messageId: string,
  liked: boolean,
): Promise<AiMessageLikeView> {
  await wait();
  assertMyPairLine(order, blockId, messageId);
  server.likes = liked
    ? [...new Set([...server.likes, messageId])]
    : server.likes.filter((id) => id !== messageId);
  return { messageId, liked };
}

/** 목 모드에서 `PUT /api/users/me` 의 나이를 받는다. 이미 정해진 시즌 배경은 바꾸지 않는다. */
export function setMockAge(age: number) {
  server.age = age;
}

/** `POST .../episodes/{order}/unlock`. 이미 열었거나 무료 회차면 토큰을 쓰지 않는다. */
export async function mockUnlockEpisode(order: number): Promise<AiEpisodeUnlockView> {
  await wait();
  if (order < 1 || order > LAST_ORDER) throw mockError(400, null);
  if (!server.unlocked.includes(order)) {
    if (server.tokens < MOCK_EPISODE_TOKEN_COST) throw mockError(409, 'INSUFFICIENT_TOKENS');
    server.tokens -= MOCK_EPISODE_TOKEN_COST;
    server.unlocked.push(order);
  }
  return { order, unlocked: true, tokenBalance: server.tokens };
}

/** 목 모드의 보유 토큰. 회차 열기 화면이 보여준다. */
export function mockTokenBalance(): number {
  return server.tokens;
}

/** 회차 쪽지를 보내는 빵: 연애 흐름이면 상대, 아니면 친구. */
function mockLetter(order: number): PartnerLetterView {
  const confession = server.season.choices.find((choice) => choice.pointId === 3);
  const senderId =
    server.season.route === 'romance' && confession?.breadId ? confession.breadId : 'friend';
  return {
    letterId: order,
    partnerId: uuidFor(senderId),
    message:
      order === LAST_ORDER
        ? '같은 시간을 함께 보내줘서 고마워. 네 속도로 지내도 괜찮아.'
        : `${order}화 이야기 고마웠어. 다음 이야기에서도 편하게 이야기하자.`,
  };
}

/** `GET /api/ai/seasons/letters/unread`. 안 읽은 쪽지가 없으면 null. */
export async function mockGetUnreadLetter(): Promise<PartnerLetterView | null> {
  await wait();
  return (
    server.letters.find((letter) => !server.readLetterIds.includes(letter.letterId ?? -1)) ?? null
  );
}

/** `POST /api/ai/seasons/letters/{letterId}/read`. */
export async function mockMarkLetterRead(letterId: number): Promise<void> {
  await wait();
  if (!server.readLetterIds.includes(letterId)) server.readLetterIds.push(letterId);
}

/** `GET /api/ai/seasons/report`. 10화를 끝내야 생긴다. 하이라이트는 비워 둬 앱이 선택 기록으로 채운다. */
export async function mockGetSeasonReport(): Promise<AiReportView> {
  await wait();
  if (!server.completed.includes(LAST_ORDER)) throw mockError(404, null);
  const confession = server.season.choices.find((choice) => choice.pointId === 3);
  return {
    finalPartnerId:
      server.season.route === 'romance' && confession?.breadId ? uuidFor(confession.breadId) : '',
    tendency: '마음이 움직이면 먼저 표현하지만, 상대의 속도도 기다릴 줄 알아요.',
    feedback: '서운한 마음은 짐작하기보다 말로 꺼내 보면 더 가까워질 수 있어요.',
    strengths: ['솔직한 표현', '상대 배려'],
    weaknesses: ['혼자 결론 내리기'],
    highlights: {},
  };
}
