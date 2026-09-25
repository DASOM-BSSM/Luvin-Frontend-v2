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
 * `AiCharacterView.role`이 정확히 어떤 문자열로 "나"를 가리키는지 openapi에 문서화가
 * 안 돼 있어 `'representative'`로 가정했다 — 실제 응답 확인 후 다르면 이 한 줄만 고치면 된다.
 */
const REPRESENTATIVE_ROLE = 'representative';

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

function toChatMessage(message: AiMessageView): InfernoChatMessage {
  return {
    id: message.messageId,
    participantId: message.speakerId,
    side: message.fromRepresentative ? 'right' : 'left',
    text: message.text,
  };
}

function chunkIntoPages(messages: AiMessageView[], question: string | undefined): InfernoChatPage[] {
  if (messages.length === 0) {
    return [];
  }

  const pages: InfernoChatPage[] = [];
  for (let start = 0; start < messages.length; start += MESSAGES_PER_PAGE) {
    const chunk = messages.slice(start, start + MESSAGES_PER_PAGE);
    pages.push({
      id: `page-${start}`,
      question: start === 0 ? question : undefined,
      messages: chunk.map(toChatMessage),
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
function buildSinglePage(messages: AiMessageView[]): InfernoChatPage[] {
  if (messages.length === 0) {
    return [];
  }

  return [{ id: 'page-group', messages: messages.map(toChatMessage) }];
}

/**
 * 1:1 대화(personal scene) 메시지 중 대표(나)가 아닌 쪽의 speakerId 를 매칭 상대로 본다 —
 * 1:1 대화는 정의상 상대가 하나뿐이라 성립한다. 상대를 아직 못 찾으면(메시지가 비어 매칭 전)
 * undefined.
 */
function buildMatchReveal(
  personalMessages: AiMessageView[],
  participants: InfernoParticipant[],
): InfernoMatchReveal | undefined {
  const me = participants.find((participant) => participant.isMine);
  const partnerId = personalMessages.find((message) => !message.fromRepresentative)?.speakerId;
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
function buildFeedbackTopics(personalMessages: AiMessageView[]): InfernoFeedbackTopic[] {
  return personalMessages
    .filter((message) => message.fromRepresentative)
    .map((message) => ({ messageId: message.messageId, message: message.text }));
}

export function mapAiEpisodeToConversation(
  season: AiSeasonStatusView,
  episode: AiEpisodeMessagesView,
  myProfile: BreadProfile | null,
): InfernoConversation {
  const participants = buildParticipants(season, myProfile);

  if (!MATCH_REVEAL_EPISODES.has(episode.episodeNumber)) {
    return {
      episodeOrder: episode.episodeNumber,
      participants,
      pages: chunkIntoPages(episode.messages, episode.topic?.title),
      vote: EPISODE_VOTE_PROMPTS[episode.episodeNumber],
    };
  }

  const groupMessages = episode.messages.filter((message) => message.sceneKind === GROUP_SCENE_KIND);
  const personalMessages = episode.messages.filter((message) => message.sceneKind === PERSONAL_SCENE_KIND);

  return {
    episodeOrder: episode.episodeNumber,
    participants,
    pages: buildSinglePage(groupMessages),
    matchReveal: buildMatchReveal(personalMessages, participants),
    personalChatPages: chunkIntoPages(personalMessages, undefined),
    feedbackTopics: buildFeedbackTopics(personalMessages),
  };
}
