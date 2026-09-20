import type { BreadType } from '@/src/assets/images/BreadCharacter';

/** 러빈지옥 에피소드 한 편. */
export interface InfernoEpisode {
  /** 0 이면 "Episode 00" 으로 보여준다. 목록의 키 역할도 한다. */
  order: number;
  /** 시작 화면 하단 바에 들어가는 제목. 예: "러빈지옥에 대해 알려드릴게요" */
  title: string;
}

/** 말풍선이 화면 어느 쪽에 붙는지. */
export type InfernoChatSide = 'left' | 'right';

/**
 * 대화에 참여하는 반죽 하나.
 *
 * 대화 줄의 아바타도, 투표 선택지도 전부 여기서 나온다. 그래서 이름과 반죽 종류를
 * 메시지가 아니라 참가자가 들고 있다.
 */
export interface InfernoParticipant {
  /** 메시지가 가리키는 키. 서버 id 가 들어올 자리. */
  id: string;
  /** 반죽 종류. 값이 에셋 파일명과 1:1 이라 그대로 그림을 고를 수 있다. */
  type: BreadType;
  /** 투표 선택지에 보이는 이름. 예: "유쾌한 카스테라 반죽" */
  name: string;
  /** 내 분신인지. 말풍선 색이 갈리고, 투표 선택지에서는 빠진다. */
  isMine: boolean;
}

/**
 * 대화 한 줄.
 *
 * 서버가 내려줄 모양을 그대로 본뜬 순수 데이터다. 누가 말했는지는 participantId 로만
 * 가리키고, 그림·이름은 참가자 쪽에서 찾는다.
 */
export interface InfernoChatMessage {
  /** 줄을 구분하는 키. 서버 id 가 들어올 자리라 숫자가 아니라 문자열이다. */
  id: string;
  participantId: string;
  /**
   * 좌우 중 어느 쪽에 붙는지.
   *
   * 내 말인지에서 뽑지 않고 따로 두는 이유: 시안(5425:886)에서 내 분신이 아닌 프레첼도
   * 오른쪽에 붙어 있어 "내 말이면 오른쪽" 규칙이 성립하지 않는다. 규칙이 정해지기 전까지는
   * 데이터가 직접 들고 있는다. 규칙이 생기면 이 필드를 지우고 파생시키면 된다.
   */
  side: InfernoChatSide;
  text: string;
}

/**
 * 대화 한 쪽(화면 하나에 담기는 분량).
 *
 * 시안이 대화를 두 화면으로 끊어 놨고(5425:886, 6137:2782) 화면마다 위아래에 붙는 문구가
 * 달라서, 줄을 한 배열에 몰지 않고 쪽으로 나눈다.
 */
export interface InfernoChatPage {
  id: string;
  /** 대화 위에 뜨는 질문. 첫 쪽에만 있다. */
  question?: string;
  /** 대화 아래 안내. 예: "- 대화가 종료되었습니다 투표를 진행해주세요 -" */
  notice?: string;
  /** 위에서부터 이 순서대로 한 줄씩 쳐진다. */
  messages: InfernoChatMessage[];
}

/** 대화가 끝난 뒤의 투표 문구. 회차마다 다른 내용이라 대화와 같이 내려온다. */
export interface InfernoVotePrompt {
  /** 대화 끝 모달에 뜨는 문구. */
  modalMessage: string;
  /** 투표지에 뜨는 문구. */
  ballotMessage: string;
}

/**
 * 에피소드 한 편의 대화 전체.
 *
 * API 가 붙으면 이 타입이 응답 본문이 된다. 그래서 JSON 으로 그대로 직렬화되는 값만 담는다.
 */
export interface InfernoConversation {
  episodeOrder: number;
  participants: InfernoParticipant[];
  pages: InfernoChatPage[];
  vote: InfernoVotePrompt;
}
