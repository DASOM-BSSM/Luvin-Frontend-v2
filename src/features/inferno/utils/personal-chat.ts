import type { InfernoChatPage, InfernoParticipant } from '@/src/features/inferno/types';

/**
 * 1:1 대화의 상대 반죽. 지금 보이는 쪽(page)이 아니라 1:1 대화 전체에서 찾는다.
 *
 * 예전에는 쪽마다 "이 쪽에서 말한 반죽"으로 골라서, 내 말만 있는 쪽에서는 상대를 못 찾아
 * 왼쪽 아래 반죽이 하나만 나왔다(사용자 지적). 대화를 화면 높이에 맞춰 나누면서
 * (paginate-chat) 내 말만 있는 쪽이 더 자주 생긴다. 상대는 대화 내내 같으므로 한 번만 정한다.
 *
 * ep2·ep4 참가자 목록에는 전체대화에 나온 넷이 다 들어 있어서, "내가 아닌 첫 반죽"이 아니라
 * 1:1 대화에서 실제로 말한 반죽을 고른다.
 */
export function findPersonalChatPartner(
  pages: InfernoChatPage[],
  participants: InfernoParticipant[],
): InfernoParticipant | undefined {
  const speakerIds = new Set(pages.flatMap((page) => page.messages.map((message) => message.participantId)));

  return participants.find(({ id, isMine }) => !isMine && speakerIds.has(id));
}
