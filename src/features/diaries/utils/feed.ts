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
    myEmoji: item.emoji ? toDisplayEmoji(item.emoji) : null,
  };
}

/**
 * 지금 쓰는 일기가 들어갈 시간 칸 — "15:00" 처럼 정각으로 보여준다. 일기는 1시간에 한 번 쓰는
 * 거라 분은 버린다(15:37 에 써도 "15:00").
 */
export function formatHourSlot(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:00`;
}

/** 월요일을 0 으로 하는 요일 번호(0~6). */
export function getWeekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** 서버 제목 길이 제한(1~100자). */
const DIARY_TITLE_MAX_LENGTH = 100;

/**
 * 일기 제목. 시안(일기 올리기 6031:2645)에는 제목 칸이 없는데 API 는 `title` 이 필수라, 내용의 첫 줄을
 * 100자까지 잘라 제목으로 쓴다. 백엔드가 제목을 선택값으로 바꾸면 이 함수는 없앤다.
 */
export function toDiaryTitle(content: string): string {
  const firstLine = content.trim().split('\n')[0] ?? '';
  return firstLine.slice(0, DIARY_TITLE_MAX_LENGTH);
}

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** 서버 시각(ISO-8601, 시간대 포함)을 "방금 전" · "N분 전" · "N시간 전" · "N일 전" 으로. */
export function formatRelativeTime(isoDateTime: string, now: Date): string {
  const elapsed = now.getTime() - Date.parse(isoDateTime);
  if (Number.isNaN(elapsed) || elapsed < MINUTE_MS) return '방금 전';
  if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)}분 전`;
  if (elapsed < DAY_MS) return `${Math.floor(elapsed / HOUR_MS)}시간 전`;
  return `${Math.floor(elapsed / DAY_MS)}일 전`;
}

/** 일기는 1시간에 한 번만 올릴 수 있다(기획). */
export const DIARY_WRITE_COOLDOWN_MS = HOUR_MS;

/** 피드에서 내가 가장 최근에 쓴 일기 시각(ms). 안 썼으면 undefined. */
export function getLastWrittenAt(feed: DiaryFeedItem[]): number | undefined {
  const mine = feed.filter((item) => item.isMine).map((item) => Date.parse(item.createdAt));
  return mine.length > 0 ? Math.max(...mine) : undefined;
}

/** 다시 쓸 수 있을 때까지 남은 초. 지금 쓸 수 있으면 0. */
export function getCooldownSeconds(lastWrittenAt: number | undefined, now: number): number {
  if (lastWrittenAt === undefined) return 0;
  return Math.max(0, Math.ceil((lastWrittenAt + DIARY_WRITE_COOLDOWN_MS - now) / 1000));
}

/** 남은 초 → "12분 05초 후 가능". */
export function formatCooldown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, '0');
  return `${minutes}분 ${rest}초 후 가능`;
}

/** 일기 반응으로 고를 수 있는 이모지. Figma "일기 반응 및 댓글"(5950:6274)의 6085:2602. */
export const REACTION_EMOJIS = ['❤️', '😊', '😭', '😂', '🥺', '😍'] as const;

/** 기기 날짜 → "YYYY-MM-DD" (react-native-calendars 의 dateString 형식). */
export function toDateString(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mm}-${dd}`;
}

/** "YYYY-MM-DD" 의 달을 delta 만큼 옮긴 그 달 1일. */
export function shiftMonth(dateString: string, delta: number): string {
  const [year, month] = dateString.split('-').map(Number);
  return toDateString(new Date(year, month - 1 + delta, 1));
}

/** "YYYY-MM-DD" → "2026년 9월". */
export function formatYearMonth(dateString: string): string {
  const [year, month] = dateString.split('-').map(Number);
  return `${year}년 ${month}월`;
}

/** 내가 일기를 쓴 날짜("YYYY-MM-DD") 모음. 서버 시각의 날짜 부분을 그대로 쓴다(한국 시간). */
export function getMyDiaryDates(feed: DiaryFeedItem[]): Set<string> {
  return new Set(feed.filter((item) => item.isMine).map((item) => item.createdAt.slice(0, 10)));
}
