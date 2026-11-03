/**
 * [DRAFT] openapi 응답 → 앱 내부 타입(types/story.ts). 이 변환은 **이 파일에서만** 한다
 * (보정 문서 2장). 순수 함수라 훅·스토어를 읽지 않는다(§6).
 *
 * - 빵 id 는 uuid 다. 역할 고정 id 로 분기하지 않고, 내 빵은 `isMe` 로만 가린다.
 * - 서버 DTO 의 필드는 전부 선택값이라 빠진 값은 여기서 안전한 기본값으로 채운다.
 * - `attachmentStyle`·`role`(애착 역할)은 옮기지 않는다 — 화면에 절대 보이면 안 된다.
 * - 알 수 없는 블록 type 은 건너뛴다. 서버가 새 블록을 먼저 배포해도 재생이 멈추지 않게.
 */
import type {
  AiChoiceOutcomeView,
  AiEpisodeContentView,
  AiSceneBlockView,
  AiStageIntroView,
  AiStoryMessageView,
  AiStoryParticipantView,
  AiStoryStateView,
  PartnerLetterView,
} from '@/src/features/inferno/api/story-types';
import type { AiCharacterView } from '@/src/features/inferno/api/ai-season-types';
import type { InfernoPartnerLetter } from '@/src/features/inferno/types';
import type { BreadType } from '@/src/assets/images/BreadCharacter';
import type {
  ChoicePoint,
  ChoiceSubmission,
  EpisodeContent,
  EpisodeStatus,
  SeasonSetting,
  StageIntro,
  StoryBlock,
  StoryMessage,
  StoryMessageKind,
  StoryParticipant,
  StoryRoute,
  StoryState,
} from '@/src/features/inferno/types/story';
import { toBreadType } from '@/src/features/inferno/utils/bread-type';

export interface StoryMapOptions {
  /** 내 빵 그림. 서버 breadType 보다 앱이 아는 내 분신 그림을 우선한다. */
  myBreadType?: BreadType;
  /**
   * 내 빵 이름(예: "진지한 도넛 반죽"). 서버 이름보다 내 반죽 프로필을 우선한다 — 목 서버는 내 빵을
   * "고소한 소금빵 반죽"으로 고정해 보내서 다른 반죽인 사용자에게도 소금빵 이름이 나왔다(사용자 지적).
   */
  myBreadName?: string;
}

const SETTINGS: SeasonSetting[] = ['school', 'campus', 'office', 'cafe'];

function toSetting(value: string | undefined): SeasonSetting | null {
  const key = value?.toLowerCase();
  return SETTINGS.find((setting) => setting === key) ?? null;
}

function toRoute(value: string | null | undefined): StoryRoute | null {
  const key = value?.toLowerCase();
  return key === 'romance' || key === 'solo' ? key : null;
}

function toChoicePoint(value: number | undefined): ChoicePoint | null {
  return value === 1 || value === 2 || value === 3 || value === 4 ? value : null;
}

function toStatus(value: string | undefined): EpisodeStatus {
  const key = value?.toLowerCase();
  if (key === 'generating') return 'generating';
  if (key === 'failed') return 'failed';
  return 'ready';
}

function toKind(message: AiStoryMessageView): StoryMessageKind {
  const key = message.kind?.toLowerCase();
  if (key === 'narration' || !message.speakerId) return 'narration';
  return key === 'monologue' ? 'monologue' : 'chat';
}

function mapParticipant(view: AiStoryParticipantView, options: StoryMapOptions): StoryParticipant {
  const isMine = view.isMe === true;
  return {
    id: view.breadId ?? '',
    name: isMine && options.myBreadName ? options.myBreadName : (view.name ?? ''),
    type: isMine && options.myBreadType ? options.myBreadType : toBreadType(view.breadType),
    isMine,
    stageRole: isMine ? null : (view.stageRole ?? null),
  };
}

function mapMessage(view: AiStoryMessageView, participants: StoryParticipant[]): StoryMessage {
  const kind = toKind(view);
  const speakerId = kind === 'narration' ? '' : (view.speakerId ?? '');
  const isMine = participants.some((person) => person.id === speakerId && person.isMine);
  return {
    id: view.messageId ?? '',
    participantId: speakerId,
    side: isMine ? 'right' : 'left',
    text: view.text ?? '',
    kind,
    sequence: view.sequence ?? 0,
    read: view.read === true,
    typing: view.typing === true,
    deletedAfterSend: view.deletedAfterSend === true,
    sentAtLabel: view.sentAtLabel?.trim() || null,
  };
}

/**
 * 대화 블록. 톡방(messenger)이 아니면 내레이션 줄은 뺀다 — 대화 장면에서 내레이션은 글자만 있는 페이지
 * 하나로 따로 떠서(서버가 장면 제목을 내레이션으로 보냄) 대화 앞에 빈 제목 페이지가 생겼다(사용자 요청으로
 * 제거). 톡방은 내레이션을 대화 사이 한 줄로 보여주므로 그대로 둔다. 내레이션만 있던 블록은 비어서
 * 재생 때 건너뛴다(story-playlist.ts playableBlocks).
 */
function mapDialogue(view: AiSceneBlockView, options: StoryMapOptions) {
  const participants = (view.participants ?? []).map((person) => mapParticipant(person, options));
  const keepNarration = view.type === 'messenger';
  const messages = [...(view.messages ?? [])]
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map((message) => mapMessage(message, participants))
    .filter((message) => keepNarration || message.kind !== 'narration');
  return { id: view.id ?? '', participants, messages };
}

export function mapStoryBlock(view: AiSceneBlockView, options: StoryMapOptions = {}): StoryBlock | null {
  const id = view.id ?? '';
  switch (view.type) {
    case 'transition':
      return { id, type: 'transition', text: view.transitionText ?? '' };
    case 'group':
    case 'pair':
      return { ...mapDialogue(view, options), type: view.type };
    case 'messenger':
      return {
        ...mapDialogue(view, options),
        type: 'messenger',
        kind: view.messenger?.kind === 'direct' ? 'direct' : 'group',
        roomName: view.messenger?.roomName ?? '',
      };
    case 'interview': {
      const dialogue = mapDialogue(view, options);
      const breadId =
        view.interview?.breadId ??
        dialogue.participants.find((person) => !person.isMine)?.id ??
        '';
      return { ...dialogue, type: 'interview', breadId };
    }
    case 'choice': {
      const pointId = toChoicePoint(view.choice?.pointId);
      if (!pointId) return null;
      return {
        id,
        type: 'choice',
        choice: {
          pointId,
          question: view.choice?.question ?? '',
          candidates: (view.choice?.candidates ?? [])
            .filter((candidate) => Boolean(candidate.breadId))
            .map((candidate) => ({ breadId: candidate.breadId ?? '', memory: candidate.memory ?? '' })),
        },
      };
    }
    case 'choice_result': {
      const pointId = toChoicePoint(view.choiceResult?.pointId);
      if (!pointId) return null;
      return {
        ...mapDialogue(view, options),
        type: 'choice_result',
        result: {
          pointId,
          breadId: view.choiceResult?.breadId ?? null,
          accepted: view.choiceResult?.accepted ?? true,
        },
      };
    }
    default:
      return null;
  }
}

export function mapStoryBlocks(views: AiSceneBlockView[] | undefined, options: StoryMapOptions = {}) {
  return (views ?? [])
    .map((view) => mapStoryBlock(view, options))
    .filter((block): block is StoryBlock => block !== null);
}

/**
 * 1화 무대 소개. 출연진에는 내 빵 표시가 없어서(계약 StageCast) 본문 참가자 중 `isMe` 인 빵 id 로 찾고,
 * 그 빵은 내 반죽 프로필 이름·그림으로 바꾼다.
 */
function mapStageIntro(
  view: AiStageIntroView | undefined,
  myId: string | undefined,
  options: StoryMapOptions,
): StageIntro | null {
  if (!view) return null;
  return {
    setting: toSetting(view.setting),
    title: view.title ?? '',
    subtitle: view.subtitle ?? '',
    cast: (view.cast ?? []).map((member) => {
      const isMine = myId !== undefined && member.breadId === myId;
      return {
        breadId: member.breadId ?? '',
        isMine,
        name: isMine && options.myBreadName ? options.myBreadName : (member.name ?? ''),
        type: isMine && options.myBreadType ? options.myBreadType : toBreadType(member.breadType),
        role: member.role ?? '',
        description: member.description ?? null,
      };
    }),
  };
}

/** 본문 참가자 중 내 빵 id. */
function myBreadIdOf(blocks: AiSceneBlockView[] | undefined): string | undefined {
  for (const block of blocks ?? []) {
    const me = block.participants?.find((person) => person.isMe === true);
    if (me?.breadId) return me.breadId;
  }
  return undefined;
}

export function mapEpisodeContent(
  view: AiEpisodeContentView,
  order: number,
  options: StoryMapOptions = {},
): EpisodeContent {
  return {
    order: view.order ?? order,
    status: toStatus(view.status),
    errorCode: view.errorCode ?? null,
    intro: view.intro ? { title: view.intro.title ?? '', situation: view.intro.situation ?? '' } : null,
    stageIntro: mapStageIntro(view.stageIntro, myBreadIdOf(view.blocks), options),
    blocks: mapStoryBlocks(view.blocks, options),
    completed: view.completed === true,
    revision: view.revision ?? 0,
    feedbacks: Object.fromEntries(
      (view.feedbacks ?? [])
        .filter((feedback) => Boolean(feedback.messageId))
        .map((feedback) => [feedback.messageId ?? '', feedback.text ?? '']),
    ),
    likedMessageIds: view.likedMessageIds ?? [],
  };
}

export function mapStoryState(
  view: AiStoryStateView | undefined,
): StoryState {
  return {
    setting: toSetting(view?.setting),
    currentOrder: view?.currentOrder ?? 1,
    completedOrders: view?.completedOrders ?? [],
    route: toRoute(view?.route),
    romancePartnerId: view?.romancePartnerId ?? null,
    choices: (view?.choices ?? []).flatMap((choice) => {
      const pointId = toChoicePoint(choice.pointId);
      return pointId
        ? [
            {
              pointId,
              order: choice.episodeOrder ?? 0,
              breadId: choice.breadId ?? null,
              accepted: choice.accepted ?? true,
            },
          ]
        : [];
    }),
    breads: (view?.breads ?? []).map((bread) => ({
      breadId: bread.breadId ?? '',
      name: bread.name ?? '',
      statusText: bread.statusText ?? '',
    })),
    unlockedOrders: view?.unlockedOrders ?? [],
    episodeTokenCost: view?.episodeTokenCost ?? null,
    completion:
      view?.completion?.order !== undefined && view.completion.status
        ? {
            order: view.completion.order,
            status: view.completion.status,
            errorCode: view.completion.errorCode ?? null,
          }
        : null,
  };
}

export function mapChoiceOutcome(
  view: AiChoiceOutcomeView,
  options: StoryMapOptions = {},
): ChoiceSubmission {
  return { blocks: mapStoryBlocks(view.blocks, options), season: mapStoryState(view.season) };
}

/** 쪽지 발신 빵 이름을 못 찾은 이유. 화면에는 쓰지 않고 개발 로그로만 남긴다. */
export type LetterSenderMissingReason =
  | 'no-partner-id'
  | 'characters-not-loaded'
  | 'partner-id-not-in-characters'
  | 'character-name-empty';

/**
 * 회차 쪽지 발신 빵 이름(계약 v5 7장 "회차 쪽지 발신자").
 * 1. 서버 `partnerName`(백엔드가 채우기로 함) → 2. `partnerId` 를 시즌 출연진(`characters[].characterId`)과
 * 맞춘 이름. 둘 다 없으면 name 은 null 이고 이유를 같이 돌려준다.
 */
export function resolveLetterSender(
  view: Pick<PartnerLetterView, 'partnerId' | 'partnerName'>,
  characters: AiCharacterView[] | undefined,
): { name: string | null; missingReason: LetterSenderMissingReason | null } {
  const fromServer = view.partnerName?.trim();
  if (fromServer) return { name: fromServer, missingReason: null };
  if (!view.partnerId) return { name: null, missingReason: 'no-partner-id' };
  if (!characters) return { name: null, missingReason: 'characters-not-loaded' };
  const sender = characters.find((character) => character.characterId === view.partnerId);
  if (!sender) return { name: null, missingReason: 'partner-id-not-in-characters' };
  const name = sender.name?.trim();
  return name ? { name, missingReason: null } : { name: null, missingReason: 'character-name-empty' };
}

/** 회차 쪽지. 발신 빵 이름은 resolveLetterSender 로 찾는다. */
export function mapPartnerLetter(
  view: PartnerLetterView,
  characters: AiCharacterView[] | undefined,
): InfernoPartnerLetter & {
  letterId: number | null;
  senderMissingReason: LetterSenderMissingReason | null;
} {
  const sender = resolveLetterSender(view, characters);
  return {
    letterId: view.letterId ?? null,
    partnerName: sender.name,
    message: view.message ?? '',
    senderMissingReason: sender.missingReason,
  };
}
