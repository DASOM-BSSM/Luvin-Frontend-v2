/**
 * 1, "첫 만남" -> "Episode 01 :: 첫 만남"
 *
 * 홈의 formatEpisodeLabel 은 "Episode 01." 로 끝나는 다른 형식이라 따로 둔다.
 */
export function formatIntroLabel(order: number, title: string): string {
  return `${formatEpisodeNumber(order)} :: ${title}`;
}

/** 2 -> "Episode 02". ep5 하이라이트의 회차 표시(Figma 5760:4351)도 같은 모양이다. */
export function formatEpisodeNumber(order: number): string {
  return `Episode ${String(order).padStart(2, '0')}`;
}

/** 톡방 시각 표시의 시작. Figma `채팅방` (7866:4517) "오후 4시 50분". */
const STORY_CLOCK_START_MINUTES = 16 * 60 + 50;

/**
 * [DRAFT] 톡방 메시지 옆 시각. 서버가 메시지 시각을 주지 않아서(계약 v3 — 실제 시각은 쓰지 않는다)
 * 시안 시각에서 시작해 메시지마다 1분씩 흐르는 이야기 속 시각으로 보여준다. 서버가 시각을 주면 그 값으로 바꿀 것.
 * → 서버 `sentAtLabel` 이 생겼다(라이브 스펙 2026-10-26). 그 값이 빈 메시지에만 이 함수를 쓴다.
 * 0 -> "오후 4시 50분", 10 -> "오후 5시 0분"
 */
export function formatStoryClock(index: number): string {
  const total = (STORY_CLOCK_START_MINUTES + index) % (24 * 60);
  const hour = Math.floor(total / 60);
  const minute = total % 60;
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${hour12}시 ${minute}분`;
}

/** 마지막 글자에 받침이 있으면 `withBatchim`, 없으면 `withoutBatchim`. 한글이 아니면 받침 없음으로 본다. */
function josa(word: string, withBatchim: string, withoutBatchim: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${word}${hasBatchim ? withBatchim : withoutBatchim}`;
}

/**
 * 10화 인터뷰 질문. Figma `ep5-결과` INTERVIEW (7884:4650).
 * "도넛" -> "Q. 이 시즌 도넛은 당신에게 어떤 반죽이었나요?"
 */
export function formatInterviewQuestion(breadName: string): string {
  return `Q. 이 시즌 ${josa(breadName, '은', '는')} 당신에게 어떤 반죽이었나요?`;
}

/**
 * 전환 쪽지 문구를 마침표·쉼표 단위로 줄바꿈한다(사용자 결정). "..." 처럼 이어진 문장부호는 한 번만
 * 끊고, "3.5" 처럼 숫자 사이 점은 끊지 않는다. 문장부호 뒤 공백은 줄바꿈으로 바꾼다.
 * "쉬는시간, 복도에서 프레첼과" -> "쉬는시간,\n복도에서 프레첼과"
 */
export function breakAtPunctuation(text: string): string {
  return text.replace(/([.,]+)(?!\d)\s*(?=\S)/g, '$1\n');
}
