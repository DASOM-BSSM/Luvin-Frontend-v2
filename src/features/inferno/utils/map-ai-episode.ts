import type { BreadProfile } from '@/src/features/home/types';
import type {
  AiEpisodeMessagesView,
  AiMessageView,
  AiSeasonStatusView,
} from '@/src/features/inferno/api/ai-season-types';
import { EPISODE_VOTE_PROMPTS } from '@/src/features/inferno/constants/episode-copy';
import type { InfernoChatMessage, InfernoChatPage, InfernoConversation, InfernoParticipant } from '@/src/features/inferno/types';
import { deriveCharacterPersona } from '@/src/features/inferno/utils/character-persona';

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

export function mapAiEpisodeToConversation(
  season: AiSeasonStatusView,
  episode: AiEpisodeMessagesView,
  myProfile: BreadProfile | null,
): InfernoConversation {
  return {
    episodeOrder: episode.episodeNumber,
    participants: buildParticipants(season, myProfile),
    pages: chunkIntoPages(episode.messages, episode.topic?.title),
    vote: EPISODE_VOTE_PROMPTS[episode.episodeNumber],
  };
}
