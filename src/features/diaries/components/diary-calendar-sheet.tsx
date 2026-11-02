import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import Text from '@/src/components/ui/text';
import { ERROR_MESSAGES } from '@/src/constants/error-messages';
import DiaryCalendarDay, { type DiaryCalendarDayProps } from '@/src/features/diaries/components/diary-calendar-day';
import useMyDiaryCalendar from '@/src/features/diaries/hooks/use-my-diary-calendar';
import {
  formatYearMonth,
  shiftMonth,
  toDateString,
  toWrittenDates,
  toYearMonth,
} from '@/src/features/diaries/utils/feed';

/** Figma 요일 줄(일요일 시작). */
const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

interface DiaryCalendarSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** react-native-calendars 의 기본 머리(월 제목 · 화살표 · 요일)는 쓰지 않고 시안대로 직접 그린다. */
const EmptyHeader = () => null;

/**
 * 일기 모아보기. Figma "일기 모아보기"(6199:3820) — 아래에서 올라오는 흰 시트에 한 달 달력.
 * 날짜 계산(달마다 칸 배치)만 react-native-calendars 를 쓰고, 머리와 날짜 칸은 직접 그린다.
 *
 * 일기를 쓴 날은 `GET /api/diaries/calendar` 로 보이는 달마다 받는다 — 모든 그룹의 내 일기가 대상이다.
 * 받는 중이거나 실패하면 모든 날이 회색이고, 실패하면 머리 아래에 다시 시도 문구가 뜬다.
 * 날짜를 눌러 그날 일기를 보는 화면은 시안이 없어 고르기만 된다.
 */
export default function DiaryCalendarSheet({ visible, onClose }: DiaryCalendarSheetProps) {
  const today = toDateString(new Date());
  const [visibleMonth, setVisibleMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const { year, month } = toYearMonth(visibleMonth);
  const calendarQuery = useMyDiaryCalendar(year, month);
  const writtenDates = toWrittenDates(calendarQuery.data ?? []);

  function handlePrevPress() {
    setVisibleMonth((month) => shiftMonth(month, -1));
  }

  function handleNextPress() {
    setVisibleMonth((month) => shiftMonth(month, 1));
  }

  function handleRetryPress() {
    calendarQuery.refetch();
  }

  function handleDayPress(date?: DateData) {
    if (date) setSelectedDate(date.dateString);
  }

  function renderDay(props: Omit<DiaryCalendarDayProps, 'written' | 'selected'>) {
    const dateString = props.date?.dateString ?? '';
    return (
      <DiaryCalendarDay
        {...props}
        onPress={handleDayPress}
        written={writtenDates.has(dateString)}
        selected={dateString === selectedDate}
      />
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-default-black/30" onPress={onClose}>
        {/* 안쪽을 눌렀을 때 닫히지 않도록 이벤트를 여기서 멈춘다. */}
        <Pressable className="w-full flex-col items-start gap-[12px] rounded-t-[8px] bg-default-white px-[20px] pb-[20px] pt-[10px]">
          <View className="w-full items-center">
            <View className="h-[2px] w-[60px] rounded-full bg-text-muted" />
          </View>

          <View className="w-full flex-row items-center justify-between">
            <Text variant="body-xs" className="text-text-primary">
              {formatYearMonth(visibleMonth)}
            </Text>
            <View className="flex-row items-center gap-[8px]">
              <Pressable accessibilityRole="button" accessibilityLabel="이전 달" hitSlop={8} onPress={handlePrevPress}>
                <View className="-rotate-90">
                  <AngleUpIcon />
                </View>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="다음 달" hitSlop={8} onPress={handleNextPress}>
                <View className="rotate-90">
                  <AngleUpIcon />
                </View>
              </Pressable>
            </View>
          </View>

          {calendarQuery.isError ? (
            <Pressable accessibilityRole="button" onPress={handleRetryPress}>
              <Text variant="body-xxs" className="text-state-error">
                {ERROR_MESSAGES.diaryCalendarFailed}
              </Text>
            </Pressable>
          ) : null}

          <View className="w-full flex-row items-center justify-around">
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} variant="body-xxs" className="text-center text-text-primary">
                {label}
              </Text>
            ))}
          </View>

          <View className="w-full">
            <Calendar
              key={visibleMonth}
              current={visibleMonth}
              firstDay={0}
              customHeader={EmptyHeader}
              dayComponent={renderDay}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
