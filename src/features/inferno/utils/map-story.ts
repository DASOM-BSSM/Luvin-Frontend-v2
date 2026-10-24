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
  AiStoryUnlockFields,
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
}

const SETTINGS: SeasonSetting[] = ['school', 'campus', 'office', 'cafe'];

function toSetting(value: string | undefined): SeasonSetting | null {
  const key = value?.toLowerCase();
  return SETTINGS.find((setting) => setting === key) ?? null;
}

function toRoute(value: string | undefined): StoryRoute | null {
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
    name: view.name ?? '',
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
  };
}

function mapDialogue(view: AiSceneBlockView, options: StoryMapOptions) {
  const participants = (view.participants ?? []).map((person) => mapParticipant(person, options));
  const messages = [...(view.messages ?? [])]
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0))
    .map((message) => mapMessage(message, participants));
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

function mapStageIntro(view: AiStageIntroView | undefined): StageIntro | null {
  if (!view) return null;
  return {
    setting: toSetting(view.setting),
    title: view.title ?? '',
    subtitle: view.subtitle ?? '',
    cast: (view.cast ?? []).map((member) => ({
      breadId: member.breadId ?? '',
      name: member.name ?? '',
      type: toBreadType(member.breadType),
      role: member.role ?? '',
      description: member.description ?? null,
    })),
  };
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
    stageIntro: mapStageIntro(view.stageIntro),
    blocks: mapStoryBlocks(view.blocks, options),
    completed: view.completed === true,
    feedbacks: Object.fromEntries(
      (view.feedbacks ?? [])
        .filter((feedback) => Boolean(feedback.messageId))
        .map((feedback) => [feedback.messageId ?? '', feedback.text ?? '']),
    ),
    likedMessageIds: view.likedMessageIds ?? [],
  };
}

export function mapStoryState(
  view: (AiStoryStateView & AiStoryUnlockFields) | undefined,
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
  };
}

export function mapChoiceOutcome(
  view: AiChoiceOutcomeView,
  options: StoryMapOptions = {},
): ChoiceSubmission {
  return { blocks: mapStoryBlocks(view.blocks, options), season: mapStoryState(view.season) };
}

/**
 * 회차 쪽지. 서버 `partnerName` 은 비어 있어서(계약 0장) `partnerId` 를 시즌 출연진
 * (`GET /me` 의 `characters[].characterId`)과 맞춰 이름을 찾는다. 못 찾으면 이름 없이 보낸다.
 */
export function mapPartnerLetter(
  view: PartnerLetterView,
  characters: AiCharacterView[] | undefined,
): InfernoPartnerLetter & { letterId: number | null } {
  const sender = characters?.find((character) => character.characterId === view.partnerId);
  return {
    letterId: view.letterId ?? null,
    partnerName: view.partnerName || sender?.name || '',
    message: view.message ?? '',
  };
}
