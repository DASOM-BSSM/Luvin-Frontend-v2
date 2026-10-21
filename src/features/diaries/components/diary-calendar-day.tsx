import { Pressable, View } from 'react-native';
import type { DateData } from 'react-native-calendars';

import SentimentNavIcon from '@/src/assets/icons/SentimentNavIcon';
import Text from '@/src/components/ui/text';
import theme from '@/src/constants/theme';

export interface DiaryCalendarDayProps {
  date?: DateData;
  /** react-native-calendars 가 넘기는 상태. 다른 달 날짜는 'disabled'. */
  state?: string;
  onPress?: (date?: DateData) => void;
  /** 이 날 일기를 썼는지. */
  written: boolean;
  selected: boolean;
}

/**
 * 달력 날짜 한 칸. Figma "일기 모아보기"(6199:3820) — 웃는 얼굴(16) 아래 날짜(Body/XXS).
 * 일기를 쓴 날은 분홍, 아니면 회색. 다른 달 날짜는 글자도 회색, 고른 날은 검정 동그라미.
 */
export default function DiaryCalendarDay({ date, state, onPress, written, selected }: DiaryCalendarDayProps) {
  const isOtherMonth = state === 'disabled';

  function handlePress() {
    onPress?.(date);
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={date ? `${date.month}월 ${date.day}일${written ? ', 일기 있음' : ''}` : undefined}
      accessibilityState={{ selected }}
      disabled={isOtherMonth}
      className="flex-col items-center justify-center"
      onPress={handlePress}
    >
      <SentimentNavIcon
        size={16}
        color={written && !isOtherMonth ? theme.pink[500] : theme.default.gray}
      />
      <View
        className={`size-[16px] items-center justify-center rounded-full ${selected ? 'bg-default-black' : ''}`}
      >
        <Text
          variant="body-xxs"
          className={`text-center ${selected ? 'text-default-white' : isOtherMonth ? 'text-default-gray' : 'text-text-primary'}`}
        >
          {date ? String(date.day).padStart(2, '0') : ''}
        </Text>
      </View>
    </Pressable>
  );
}
