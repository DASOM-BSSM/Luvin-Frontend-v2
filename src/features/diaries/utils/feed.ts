import type {
  DiaryFeedItem,
  DiaryReactionResult,
  GroupDiaryPreview,
} from '@/src/features/diaries/types';
import { toBreadType } from '@/src/features/survey/utils/map-bread-result';

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

/** 탈퇴한 사용자의 일기는 닉네임이 null 로 온다. 문구는 임시 — 정해지면 바꾼다. */
export const UNKNOWN_AUTHOR_NAME = '탈퇴한 사용자';

/** 피드 항목을 그룹 일기 카드 값으로 바꾼다. 감정일기 홈 · 감정일기 메인이 같이 쓴다. */
export function toGroupDiaryPreview(item: DiaryFeedItem): GroupDiaryPreview {
  return {
    author: {
      type: toBreadType(item.authorBreadType),
      state: 'dough',
      name: item.authorNickname ?? UNKNOWN_AUTHOR_NAME,
    },
    time: formatDiaryTime(item.createdAt),
    message: item.content,
  };
}

/**
 * 서버 시각(한국 시간 ISO-8601)의 날짜 부분이 오늘(기기 날짜)과 같은지. 서버 시각은 글자 그대로
 * "YYYY-MM-DD" 를 꺼내 비교하고, 오늘은 기기 시간대로 만든다 — 한국에서 쓰는 앱이라 둘이 같다고 본다.
 */
export function isWrittenOn(isoDateTime: string, today: Date): boolean {
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return isoDateTime.startsWith(`${yyyy}-${mm}-${dd}`);
}

/** 기기 시각을 "15:00" 같은 시:분으로. */
export function formatClockTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/** 월요일을 0 으로 하는 요일 번호(0~6). */
export function getWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}
