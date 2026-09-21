import type {
  InfernoChatPage,
  InfernoConversation,
  InfernoHighlightLine,
  InfernoParticipant,
} from '@/src/features/inferno/types';

/** 하이라이트로 보여줄 줄 수. */
const HIGHLIGHT_LINE_COUNT = 3;

export interface InfernoEpisodeHighlight {
  lines: InfernoHighlightLine[];
  /** 하이라이트 줄에 실제로 등장한, 나 아닌 참가자. 전부 내 줄만 뽑혔으면 undefined. */
  featuredParticipant?: InfernoParticipant;
}

/**
 * 회차 대화에서 ep5 하이라이트로 보여줄 3마디(와 그 안에 나온 상대)를 뽑는다.
 *
 * 결정적인 한 줄(showHeart)이 있으면 그 줄 + 그 앞의 두 줄까지 총 3마디를 쓴다 —
 * ep2/ep4처럼 매칭 상대가 직접 마음을 드러낸 줄 하나만 뚝 떼어 보여주면 맥락이 없어서다.
 * showHeart 표시가 없는 회차(ep1/ep3)는 마지막 쪽의 마지막 세 줄로 대신한다 — 대화가
 * 가장 무르익은 지점이라서다.
 *
 * `featuredParticipant`를 뽑힌 줄 안에서 찾는 이유: 참가자 목록 순서(예: 카스테라가 항상
 * 두 번째)로 아무나 골랐다가는 하이라이트에 실제로 나오지 않는 반죽이 대표 이미지로
 * 뜨는 문제가 있었다(재확인 완료 — 네 회차 다 실제로는 도넛이 등장하는데 목록 순서상
 * 카스테라가 뽑혔었다).
 */
export function pickEpisodeHighlight(conversation: InfernoConversation): InfernoEpisodeHighlight {
  const participantById = new Map(conversation.participants.map((participant) => [participant.id, participant]));
  const allPages: InfernoChatPage[] = [...conversation.pages, ...(conversation.personalChatPages ?? [])];
  const allMessages = allPages.flatMap((page) => page.messages);

  const heartIndex = allMessages.findIndex((message) => message.showHeart);
  const messages =
    heartIndex >= 0
      ? allMessages.slice(Math.max(0, heartIndex - HIGHLIGHT_LINE_COUNT + 1), heartIndex + 1)
      : allMessages.slice(-HIGHLIGHT_LINE_COUNT);

  const featuredMessage = messages.find((message) => participantById.get(message.participantId)?.isMine === false);
  const featuredParticipant = featuredMessage ? participantById.get(featuredMessage.participantId) : undefined;

  const lines: InfernoHighlightLine[] = [];
  for (const message of messages) {
    const participant = participantById.get(message.participantId);
    if (participant) {
      lines.push({ message, participant });
    }
  }

  return { lines, featuredParticipant };
}
