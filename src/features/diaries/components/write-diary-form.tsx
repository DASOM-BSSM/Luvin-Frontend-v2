import { useEffect, useState } from 'react';
import { TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';

import BreadCharacter from '@/src/assets/images/BreadCharacter';
import Button from '@/src/components/ui/button';
import Text from '@/src/components/ui/text';
import { text as textColor } from '@/src/constants/colors';
import { body } from '@/src/constants/typography';
import type { GroupDiaryAuthor } from '@/src/features/diaries/types';
import { formatCooldown, getCooldownSeconds } from '@/src/features/diaries/utils/feed';

const InteropTextInput = cssInterop(TextInput, { className: 'style' });

/** 서버 내용 길이 제한(1~5000자). */
const CONTENT_MAX_LENGTH = 5000;

/** 입력칸이 이 줄 수까지 늘어나고, 넘으면 칸 안에서 스크롤한다 — 카드가 화면 밖으로 밀리지 않게. */
const CONTENT_MAX_VISIBLE_LINES = 8;

export interface WriteDiaryFormProps {
  author: GroupDiaryAuthor;
  /** 카드 가운데 시각. 예: "15:00" */
  time: string;
  /** 수정할 때 처음 채워둘 내용. */
  initialContent?: string;
  /** 버튼 문구. 예: "일기 올리기", "수정하기" */
  submitLabel: string;
  /** 요청을 보내는 중이면 버튼을 막는다(§11). */
  isSubmitting: boolean;
  errorMessage?: string;
  /**
   * 내가 마지막으로 일기를 쓴 시각(ms). 1시간이 안 지났으면 버튼에 남은 시간을 보여주고 막는다
   * (기획: 1시간에 한 번). 수정할 때는 넘기지 않는다.
   */
  lastWrittenAt?: number;
  /** 저장은 이 모달이 아니라 부르는 쪽이 한다 — 작성은 useCreateDiary, 수정은 useUpdateDiary. */
  onSubmit: (content: string) => void;
}

/**
 * 일기 쓰기 카드 + 저장 버튼. Figma "일기 올리기"(6031:2645). 일기 올리기 모달(`WriteDiaryModal`)과
 * 일기 상세의 수정(`EditDiaryForm`)이 같이 쓴다. 처음 그릴 때의 `initialContent` 로 시작하므로, 열 때마다
 * 새로 그려야 이전 입력이 남지 않는다.
 */
export default function WriteDiaryForm({
  author,
  time,
  initialContent = '',
  submitLabel,
  isSubmitting,
  errorMessage,
  lastWrittenAt,
  onSubmit,
}: WriteDiaryFormProps) {
  const [content, setContent] = useState(initialContent);
  const [now, setNow] = useState(Date.now);
  const cooldownSeconds = getCooldownSeconds(lastWrittenAt, now);
  const isCoolingDown = cooldownSeconds > 0;
  const canSubmit = content.trim() !== '' && !isSubmitting && !isCoolingDown;

  // 남은 시간을 1초마다 다시 그린다. 다 지나면 멈춘다.
  useEffect(() => {
    if (!isCoolingDown) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isCoolingDown]);

  function handleSubmitPress() {
    onSubmit(content.trim());
  }

  return (
    <View className="w-full flex-col items-start gap-[20px]">
      {/* 시안 높이(162)는 최소값으로 두고, 글이 길어지면 카드가 같이 늘어난다(고정이면 시각과 첫 줄이 겹쳤다). */}
      <View className="min-h-[162px] w-full flex-col items-center justify-between gap-[8px] overflow-hidden rounded-[8px] bg-default-white p-[12px]">
        <View className="w-full flex-row items-center gap-[4px]">
          {author.type ? (
            <BreadCharacter
              type={author.type}
              state={author.state}
              className="h-[17px] w-[25px]"
              accessibilityLabel={author.name}
            />
          ) : null}
          <Text variant="body-xs" className="text-center text-default-black">
            {author.name}
          </Text>
        </View>
        <View className="w-full flex-col items-center">
          <Text variant="heading-h2" className="text-center text-text-primary">
            {time}
          </Text>
          {/* 글꼴은 TextField 와 같은 이유로 style 로 넣는다(text-field.tsx 주석 참고). */}
          {/* lineHeight 까지 토큰 그대로 넣는다 — 빠지면 iOS 여러 줄 입력칸에서 글자 윗부분이 잘린다. */}
          <InteropTextInput
            className="w-full p-0"
            style={{
              ...body.xs,
              color: textColor.primary,
              maxHeight: body.xs.lineHeight * CONTENT_MAX_VISIBLE_LINES,
            }}
            value={content}
            onChangeText={setContent}
            placeholder="당신의 생각을 적어주세요"
            placeholderTextColor={textColor.muted}
            accessibilityLabel="일기 내용"
            multiline
            autoFocus
            maxLength={CONTENT_MAX_LENGTH}
            textAlign="center"
            underlineColorAndroid="transparent"
          />
        </View>
        <View className="h-[18px] w-full" />
      </View>
      <View className="w-full flex-col items-center gap-[8px]">
        <Button
          label={isCoolingDown ? formatCooldown(cooldownSeconds) : submitLabel}
          variant="infoSave"
          disabled={!canSubmit}
          onPress={handleSubmitPress}
        />
        {errorMessage ? (
          <Text variant="body-xs" className="text-state-error">
            {errorMessage}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
