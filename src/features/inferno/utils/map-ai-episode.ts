import type { BreadProfile } from '@/src/features/home/types';
import type {
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

/** 한 쪽(page)에 몇 마디씩 담을지. 서버가 쪽 경계를 안 줘서 임의로 정한 값 — 실제 대화 길이 보고 조정할 것. */
const MESSAGES_PER_PAGE = 3;

/**
 * 투표 대신 매칭 결과를 통보받는 회차(ep2·ep4, types.ts `InfernoMatchReveal` 주석 참고).
 * 둘 다 그룹대화 → 매칭 → 1:1대화 뼈대는 같아서 같은 분기를 탄다. ep4 의 "다시 굽기"는
 * 여기서 안 만든다 — 새 1:1 대화가 API 로 어떻게 내려오는지 알 방법이 없어서
 * `rebake` 필드를 그냥 비워 둔다(use-inferno-conversation 주석 참고).
 */
const MATCH_REVEAL_EPISODES = new Set([2, 4]);

/**
 * `AiMessageView.sceneKind` 값. 매칭 회차의 전체대화/1:1대화를 가르는 데 쓴다. openapi 에
 * enum 이 문서화돼 있지 않아 지어낸 문자열이다 — 실제 응답 확인 후 다르면 이 두 줄만 고치면
 * 된다.
 */
const GROUP_SCENE_KIND = 'group';
const PERSONAL_SCENE_KIND = 'personal';

function buildParticipants(season: AiSeasonStatusView, myProfile: BreadProfile | null): InfernoParticipant[] {
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

function chunkIntoPages(
  messages: AiMessageView[],
  question: string | undefined,
  representativeId: string | undefined,
): InfernoChatPage[] {
  if (messages.length === 0) {
    return [];
  }

  const pages: InfernoChatPage[] = [];
  for (let start = 0; start < messages.length; start += MESSAGES_PER_PAGE) {
    const chunk = messages.slice(start, start + MESSAGES_PER_PAGE);
    pages.push({
      id: `page-${start}`,
      question: start === 0 ? question : undefined,
      messages: chunk.map((message) => toChatMessage(message, representativeId)),
    });
  }

  return pages;
}

/**
 * 매칭 회차의 전체대화를 한 쪽에 몰아 담는다. `MESSAGES_PER_PAGE` 로 쪼개지 않는 이유:
 * ep2 화면(use-inferno-ep2-flow)은 group 단계에서 `pages[0]` 하나만 그리고 쪽을 넘기는
 * 기능이 없다 — 시안이 전체대화를 한 화면으로 보여주기 때문(ep1 처럼 두 쪽으로 끊지 않음).
 * 여기서 쪼개면 두 번째 쪽부터는 화면에 영영 나타나지 않는다.
 */
function buildSinglePage(messages: AiMessageView[], representativeId: string | undefined): InfernoChatPage[] {
  if (messages.length === 0) {
    return [];
  }

  return [{ id: 'page-group', messages: messages.map((message) => toChatMessage(message, representativeId)) }];
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
 * 이미 매핑된 대화에서 1:1 대화 상대를 찾는다. `buildMatchReveal`과 같은 전제(1:1 대화엔
 * 상대가 하나뿐)를 쓰지만, 매핑 전 원본(AiMessageView)이 아니라 매핑된 `InfernoConversation`
 * 위에서 동작한다 — ep5 최종 매칭(map-ai-season-report.ts)처럼 이미 매핑된 ep4 대화만
 * 들고 있는 자리에서 재사용하려고 따로 둔다.
 */
export function findMatchedPartner(conversation: InfernoConversation): InfernoParticipant | undefined {
  const personalMessages = (conversation.personalChatPages ?? []).flatMap((page) => page.messages);
  const partnerId = personalMessages.find((message) => {
    const participant = conversation.participants.find((candidate) => candidate.id === message.participantId);
    return participant && !participant.isMine;
  })?.participantId;

  return conversation.participants.find((participant) => participant.id === partnerId);
}

export function mapAiEpisodeToConversation(
  season: AiSeasonStatusView,
  episode: AiEpisodeMessagesView,
  myProfile: BreadProfile | null,
): InfernoConversation {
  const participants = buildParticipants(season, myProfile);
  const representativeId = season.characters.find((character) => character.role === REPRESENTATIVE_ROLE)
    ?.characterId;

  if (!MATCH_REVEAL_EPISODES.has(episode.episodeNumber)) {
    return {
      episodeOrder: episode.episodeNumber,
      participants,
      pages: chunkIntoPages(episode.messages, episode.topic?.title, representativeId),
      vote: EPISODE_VOTE_PROMPTS[episode.episodeNumber],
    };
  }

  const groupMessages = episode.messages.filter((message) => message.sceneKind === GROUP_SCENE_KIND);
  const personalMessages = episode.messages.filter((message) => message.sceneKind === PERSONAL_SCENE_KIND);

  return {
    episodeOrder: episode.episodeNumber,
    participants,
    pages: buildSinglePage(groupMessages, representativeId),
    matchReveal: buildMatchReveal(personalMessages, participants, representativeId),
    personalChatPages: chunkIntoPages(personalMessages, undefined, representativeId),
    feedbackTopics: buildFeedbackTopics(personalMessages, representativeId),
  };
}
