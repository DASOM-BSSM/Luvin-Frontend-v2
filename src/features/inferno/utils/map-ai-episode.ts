/** [DRAFT] Ten-episode block story integration. */
import type { BreadProfile } from '@/src/features/home/types';
import type {
  AiCharacterView,
  AiEpisodeMessagesView,
  AiMessageView,
  AiSeasonStatusView,
} from '@/src/features/inferno/api/ai-season-types';
import { EPISODE_VOTE_PROMPTS } from '@/src/features/inferno/constants/episode-copy';
import type {
  InfernoChatMessage,
  InfernoChatPage,
  InfernoConversation,
  InfernoFeedbackTopic,
  InfernoMatchReveal,
  InfernoParticipant,
} from '@/src/features/inferno/types';
import { deriveCharacterPersona, getBreadTypeNoun } from '@/src/features/inferno/utils/character-persona';
import {
  paginateByHeight,
  type ChatPageBudget,
  type ChatPageBudgets,
} from '@/src/features/inferno/utils/paginate-chat';

/**
 * AI 시즌 상태(participants) + 회차 메시지를 화면이 이미 알고 있는 `InfernoConversation`
 * 모양으로 바꾼다. 순수 함수라 훅 밖에서도 테스트할 수 있다(§6) — "나"의 반죽 정보는
 * `useBreadStore`를 여기서 직접 읽지 않고 인자로 받는다.
 *
 * `AiCharacterView.role`은 실제 응답으로 확인함 — 대표(나)는 `'REPRESENTATIVE'`, 나머지
 * 후보는 `'CANDIDATE'`(대문자, 재확인 완료). 상대 후보 구분에 `role`을 더 쓰지 않는 이유:
 * "대표가 아니면 후보"로 충분해서 값을 하나만 비교한다.
 */
const REPRESENTATIVE_ROLE = 'REPRESENTATIVE';

/** 대표가 아닌 참가자의 role. 메시지로 참가자를 만들 때(buildCharactersFromMessages) 붙인다. */
const CANDIDATE_ROLE = 'CANDIDATE';

/** 대화를 바꾸는 데 필요한 시즌 정보. 참가자 목록만 쓴다. */
type ConversationSeason = Pick<AiSeasonStatusView, 'characters'>;

/**
 * 회차 메시지의 화자로 참가자 목록을 만든다. 지난 시즌을 다시 볼 때 쓴다(use-viewed-season) — 참가자는
 * `GET /api/ai/seasons/me`(최신 시즌만 준다)에서 오는데, 지난 시즌의 참가자를 주는 API 는 아직 없다.
 * 참가자의 빵·이름은 캐릭터 id 만으로 정해지므로(deriveCharacterPersona) 화자 id 만 있으면 된다.
 *
 * 대표(나)는 `fromRepresentative` 로 가린다. 평소에는 이 필드를 믿지 않고 role 로 판정하지만(isFromMe
 * 주석), 지난 시즌은 role 을 받을 곳이 없다. 그 회차에서 한 번도 말하지 않은 참가자는 목록에 없다.
 */
export function buildCharactersFromMessages(messages: AiMessageView[]): AiCharacterView[] {
  const characters = new Map<string, AiCharacterView>();

  for (const message of messages) {
    if (characters.has(message.speakerId)) {
      continue;
    }

    characters.set(message.speakerId, {
      characterId: message.speakerId,
      role: message.fromRepresentative ? REPRESENTATIVE_ROLE : CANDIDATE_ROLE,
      gender: '',
    });
  }

  return [...characters.values()];
}

/**
 * 투표 대신 매칭 결과를 통보받는 회차(ep2·ep4, types.ts `InfernoMatchReveal` 주석 참고).
 * 둘 다 그룹대화 → 매칭 → 1:1대화 뼈대는 같아서 같은 분기를 탄다.
 */
const MATCH_REVEAL_EPISODES = new Set([2, 4]);


/**
 * `AiMessageView.sceneKind` 값. 매칭 회차의 전체대화/1:1대화를 가르는 데 쓴다.
 *
 * 백엔드 확인 완료 — `'candidates_only'`가 예전 `'group'`을 대체한 새 이름이다(전체대화
 * 단계, 매칭 전 후보들끼리 나누는 대화). 실기기에서 새로 생성된 시즌이 `'group'` 없이
 * `'candidates_only'`/`'one_to_one'`만 주는 걸로 재현·확인했다. 이름이 바뀌기 전에 만들어진
 * 시즌이 아직 `'group'`으로 남아있을 수 있어 둘 다 받아들인다.
 */
const GROUP_SCENE_KINDS = new Set(['group', 'candidates_only']);
const PERSONAL_SCENE_KIND = 'one_to_one';

function buildParticipants(season: ConversationSeason, myProfile: BreadProfile | null): InfernoParticipant[] {
  return season.characters.map((character) => {
    if (character.role === REPRESENTATIVE_ROLE) {
      return {
        id: character.characterId,
        type: myProfile?.type ?? 'salt',
        name: myProfile?.name ?? '나의 반죽',
        isMine: true,
      };
    }

    const persona = deriveCharacterPersona(character.characterId);
    return { id: character.characterId, type: persona.type, name: persona.name, isMine: false };
  });
}

/**
 * 이 줄이 "내"(대표) 말인지. `AiMessageView.fromRepresentative` 필드를 믿지 않고
 * `speakerId`가 대표 캐릭터 id와 같은지로 직접 판정한다 — 참가자의 `isMine`(role 기반)과
 * 어긋날 수 있는 별도 신호를 메시지마다 따로 두지 않기 위해서다(사용자 지적: 대화 좌우가
 * 어긋나 보임). 이러면 "내 말 = 무조건 오른쪽"이 참가자 판정과 항상 같은 기준으로 맞는다.
 */
function isFromMe(message: AiMessageView, representativeId: string | undefined): boolean {
  return message.speakerId === representativeId;
}

function toChatMessage(message: AiMessageView, representativeId: string | undefined): InfernoChatMessage {
  return {
    id: message.messageId,
    participantId: message.speakerId,
    side: isFromMe(message, representativeId) ? 'right' : 'left',
    text: message.text,
  };
}

/**
 * 메시지를 쪽(page)으로 나눈다. 서버가 쪽 경계를 주지 않는다.
 *
 * 예전에는 무조건 세 마디씩 잘랐는데, 한 마디가 길어 말풍선이 두세 줄로 늘어나면 한 쪽이
 * 화면 높이를 넘어 위아래가 잘리고 여백 없이 붙어 보였다(사용자 지적). 지금은 화면 높이에서
 * 위아래 여백을 뺀 만큼만 채우고, 넘칠 것 같은 마디부터 다음 쪽으로 넘긴다(paginate-chat).
 */
function chunkIntoPages(
  messages: AiMessageView[],
  question: string | undefined,
  representativeId: string | undefined,
  budget: ChatPageBudget,
): InfernoChatPage[] {
  if (messages.length === 0) {
    return [];
  }

  const ranges = paginateByHeight(
    messages.map((message) => message.text),
    budget,
    question !== undefined,
  );

  return ranges.map(([start, end]) => ({
    id: `page-${start}`,
    question: start === 0 ? question : undefined,
    messages: messages.slice(start, end).map((message) => toChatMessage(message, representativeId)),
  }));
}

/**
 * 1:1 대화(personal scene) 메시지 중 대표(나)가 아닌 쪽의 speakerId 를 매칭 상대로 본다 —
 * 1:1 대화는 정의상 상대가 하나뿐이라 성립한다. 상대를 아직 못 찾으면(메시지가 비어 매칭 전)
 * undefined.
 */
function buildMatchReveal(
  personalMessages: AiMessageView[],
  participants: InfernoParticipant[],
  representativeId: string | undefined,
): InfernoMatchReveal | undefined {
  const me = participants.find((participant) => participant.isMine);
  const partnerId = personalMessages.find((message) => !isFromMe(message, representativeId))?.speakerId;
  const partner = participants.find((participant) => participant.id === partnerId);

  if (!me || !partner) {
    return undefined;
  }

  return {
    noticeMessage: `${me.name} → ${partner.name}`,
    actionLabel: `${getBreadTypeNoun(partner.type)}과 오븐 가기`,
  };
}

/** 1:1 대화에서 내 분신이 한 말만 피드백 대상으로 삼는다(types.ts 주석 참고). */
function buildFeedbackTopics(
  personalMessages: AiMessageView[],
  representativeId: string | undefined,
): InfernoFeedbackTopic[] {
  return personalMessages
    .filter((message) => isFromMe(message, representativeId))
    .map((message) => ({ messageId: message.messageId, message: message.text }));
}

/**
 * 이 회차가 "다 만들어졌다"고 볼 조건. 매칭 회차(ep2/ep4)는 `group` 메시지만 먼저 와도
 * `one_to_one`이 아직 없으면 미완성으로 본다 — 그렇지 않으면 `useAiEpisodeMessages`의
 * 폴링이 `group`만 도착한 시점에 멈춰버려서 1:1 대화가 영원히 안 내려온다(사용자 확인된
 * 버그: matchReveal이 계속 undefined인데 로딩도 에러도 아닌 채로 멈춘 화면).
 */
export function isEpisodeFullyGenerated(episodeNumber: number, messages: AiMessageView[]): boolean {
  if (messages.length === 0) {
    return false;
  }

  if (!MATCH_REVEAL_EPISODES.has(episodeNumber)) {
    return true;
  }

  return messages.some((message) => message.sceneKind === PERSONAL_SCENE_KIND);
}

export function mapAiEpisodeToConversation(
  season: ConversationSeason,
  episode: AiEpisodeMessagesView,
  myProfile: BreadProfile | null,
  /** 화면 크기에서 만든 쪽 예산(paginate-chat 의 buildChatPageBudgets). */
  pageBudgets: ChatPageBudgets,
): InfernoConversation {
  const participants = buildParticipants(season, myProfile);
  const representativeId = season.characters.find((character) => character.role === REPRESENTATIVE_ROLE)
    ?.characterId;

  if (!MATCH_REVEAL_EPISODES.has(episode.episodeNumber)) {
    return {
      episodeOrder: episode.episodeNumber,
      participants,
      pages: chunkIntoPages(episode.messages, episode.topic?.title, representativeId, pageBudgets.group),
      vote: EPISODE_VOTE_PROMPTS[episode.episodeNumber],
    };
  }

  const groupMessages = episode.messages.filter((message) => GROUP_SCENE_KINDS.has(message.sceneKind));
  const personalMessages = episode.messages.filter((message) => message.sceneKind === PERSONAL_SCENE_KIND);

  return {
    episodeOrder: episode.episodeNumber,
    versionId: episode.versionId,
    participants,
    pages: chunkIntoPages(groupMessages, undefined, representativeId, pageBudgets.group),
    matchReveal: buildMatchReveal(personalMessages, participants, representativeId),
    personalChatPages: chunkIntoPages(personalMessages, undefined, representativeId, pageBudgets.personal),
    feedbackTopics: buildFeedbackTopics(personalMessages, representativeId),
    isFeedbackSubmitted: episode.feedback != null,
    likedMessageIds: episode.likedMessageIds ?? [],

  };
}
