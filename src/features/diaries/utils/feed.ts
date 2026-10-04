import type { DiaryFeedItem, DiaryReactionResult } from '@/src/features/diaries/types';

/** 반응 결과를 피드의 해당 일기에만 반영한다. 다른 일기는 그대로 둔다. */
export function applyReactionResult(
  feed: DiaryFeedItem[],
  result: DiaryReactionResult,
): DiaryFeedItem[] {
  return feed.map((item) =>
    item.diaryId === result.diaryId
      ? { ...item, emoji: result.emoji, liked: result.liked, likeCount: result.likeCount }
      : item,
  );
}

/** 이모지 표시 선택자(U+FE0F). 붙이면 흑백 글자 대신 컬러 이모지로 그려진다. */
const EMOJI_PRESENTATION_SELECTOR = '\uFE0F';

/** 이 값보다 작은 코드포인트는 기본이 글자 모양(흑백)일 수 있는 기호다(예: ❤ U+2764, ☺ U+263A). */
const SUPPLEMENTARY_EMOJI_START = 0x1f000;

/**
 * 서버에서 온 반응 이모지를 화면에 그릴 수 있게 다듬는다. 서버가 저장할 때 U+FE0F 를 빼서
 * "❤️" 가 "❤" 로 오는데, 그대로 그리면 흑백 하트가 될 수 있다(백엔드 안내). 그래서 한 글자짜리
 * 기호(U+1F000 미만)에 선택자가 없으면 뒤에 붙인다. 원래 컬러로 그려지는 이모지(😳 등)와
 * 여러 글자로 이뤄진 이모지는 건드리지 않는다.
 */
export function toDisplayEmoji(emoji: string): string {
  const codePoints = Array.from(emoji);
  if (codePoints.length !== 1) return emoji;

  const codePoint = codePoints[0].codePointAt(0) ?? 0;
  return codePoint < SUPPLEMENTARY_EMOJI_START ? `${emoji}${EMOJI_PRESENTATION_SELECTOR}` : emoji;
}

/**
 * 서버 시각(한국 시간 ISO-8601, 예: "2026-10-01T07:56:53.770+09:00")을 "07:56"으로 바꾼다.
 * 서버가 이미 한국 시간으로 주므로 기기 시간대로 다시 바꾸지 않고 글자 그대로 시:분만 꺼낸다.
 * 형식이 다르면 빈 문자열.
 */
export function formatDiaryTime(isoDateTime: string): string {
  const match = /T(\d{2}):(\d{2})/.exec(isoDateTime);
  return match ? `${match[1]}:${match[2]}` : '';
}
