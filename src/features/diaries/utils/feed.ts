import type {
  DiaryCalendarDay,
  DiaryFeedItem,
  DiaryReactionResult,
  GroupDiaryPreview,
} from '@/src/features/diaries/types';
import { getBreadFlavorName } from '@/src/features/inferno/utils/character-persona';
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

/** [DRAFT] 빵 타입을 모를 때(설문 전 · 서버가 안 줌)의 이름. 문구는 임시 — 정해지면 바꾼다. */
export const UNKNOWN_BREAD_NAME = '이름 없는 빵';

/** 이름을 정할 작성자 정보. 닉네임은 탈퇴 여부를 가리는 데만 쓰고 화면에는 내지 않는다. */
export interface AuthorNameSource {
  isMine: boolean;
  /** 계정 닉네임. 탈퇴했으면 null. */
  nickname: string | null;
  /** 서버가 정한 빵 이름(예: "쫀쫀한 카스테라"). 설문 전 · 탈퇴면 null. */
  breadName: string | null;
  /** 서버 빵 타입 id(예: "salt_bread"). 모르면 null. */
  breadType: string | null;
}

/**
 * 감정일기에서 보여줄 작성자 이름 — 실제 이름(계정 닉네임)은 러빈지옥 회차 밖에서는 쓰지 않고 늘 빵 이름이다
 * (사용자 결정). 나는 내 빵 이름, 남은 서버가 정한 빵 이름(`breadName`, 모든 화면에서 같은 이름)이다.
 * 빵 이름이 없으면 탈퇴한 사람은 `UNKNOWN_AUTHOR_NAME`, 그 밖에는 빵 종류("카스테라") · `UNKNOWN_BREAD_NAME`.
 */
export function resolveAuthorName(source: AuthorNameSource, myName: string): string {
  if (source.isMine) return myName;
  if (source.breadName) return source.breadName;
  if (source.nickname === null) return UNKNOWN_AUTHOR_NAME;
  const type = toBreadType(source.breadType);
  return type ? getBreadFlavorName(type) : UNKNOWN_BREAD_NAME;
}

/** 내 반죽 이름("쫀쫀한 소금빵 반죽")에서 "반죽"을 뗀 빵 이름. 감정일기는 "쫀쫀한 소금빵"으로 쓴다(Figma 5950:6585). */
export function toPlainBreadName(doughName: string): string {
  return doughName.replace(/\s*반죽$/, '');
}

/**
 * 피드 항목을 그룹 일기 카드 값으로 바꾼다. 감정일기 홈 · 감정일기 메인이 같이 쓴다.
 * `myName` 은 내 빵 이름(`useMyDiaryAuthor`) — 내 일기면 그 이름을 쓴다.
 */
export function toGroupDiaryPreview(item: DiaryFeedItem, myName: string): GroupDiaryPreview {
  return {
    author: {
      type: toBreadType(item.authorBreadType),
      state: 'dough',
      name: resolveAuthorName(
        {
          isMine: item.isMine,
          nickname: item.authorNickname,
          breadName: item.authorBreadName,
          breadType: item.authorBreadType,
        },
        myName,
      ),
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

/** 한국 시간(KST)은 UTC+9 — 정각 칸을 한국 시간 기준으로 나눌 때 쓴다. */
const KST_OFFSET_MS = 9 * HOUR_MS;

/** 시각(ms)이 들어 있는 한국 시간 정각 칸 번호. 같은 번호면 같은 날 같은 시다. */
function toKstHourIndex(time: number): number {
  return Math.floor((time + KST_OFFSET_MS) / HOUR_MS);
}

/** 피드에서 내가 가장 최근에 쓴 일기 시각(ms). 안 썼으면 undefined. */
export function getLastWrittenAt(feed: DiaryFeedItem[]): number | undefined {
  const mine = feed.filter((item) => item.isMine).map((item) => Date.parse(item.createdAt));
  return mine.length > 0 ? Math.max(...mine) : undefined;
}

/**
 * 다시 쓸 수 있을 때까지 남은 초. 지금 쓸 수 있으면 0.
 *
 * 일기는 한국 시간 정각 칸(예: 20:00~20:59)마다 한 번 쓴다(사용자 결정). 예전에는 "마지막으로 쓴 뒤 1시간"
 * 이었는데, 감정일기 메인이 정각 칸으로 화면을 나누면서 19:50 에 쓰면 20시 칸에서 20:50 까지 아무것도
 * 못 쓰고 빈 화면이 됐다. 그래서 지금 칸에 이미 썼을 때만 다음 정각까지 기다린다.
 */
export function getCooldownSeconds(lastWrittenAt: number | undefined, now: number): number {
  if (lastWrittenAt === undefined) return 0;
  const nowIndex = toKstHourIndex(now);
  if (toKstHourIndex(lastWrittenAt) !== nowIndex) return 0;
  const nextSlotStart = (nowIndex + 1) * HOUR_MS - KST_OFFSET_MS;
  return Math.max(0, Math.ceil((nextSlotStart - now) / 1000));
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

/** "YYYY-MM-DD" → 달력 API 에 넘길 연 · 월(1~12). */
export function toYearMonth(dateString: string): { year: number; month: number } {
  const [year, month] = dateString.split('-').map(Number);
  return { year, month };
}

/** 달력 API 응답 → 내가 일기를 쓴 날짜("YYYY-MM-DD", 한국 시간) 모음. */
export function toWrittenDates(days: DiaryCalendarDay[]): Set<string> {
  return new Set(days.map((day) => day.date));
}
