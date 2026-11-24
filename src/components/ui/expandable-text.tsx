import { useState } from 'react';
import { Pressable, type NativeSyntheticEvent, type TextLayoutEventData } from 'react-native';

import Text, { type TextVariant } from '@/src/components/ui/text';

interface ExpandableTextProps {
  children: string;
  /** 이 줄 수를 넘으면 접고 "더보기"를 붙인다. */
  maxLines: number;
  variant?: TextVariant;
  className?: string;
}

/**
 * 긴 글을 `maxLines` 줄까지만 보여주고 "더보기" · "접기"로 펼치는 글. 시안이 없어 버튼은 흐린 작은 글씨로 뒀다.
 *
 * 몇 줄인지는 처음 한 번 줄 제한 없이 그려서 잰다(`onTextLayout`) — Android 는 줄 제한을 건 채로 재면
 * 잘린 줄 수만 알려 줘서 넘쳤는지 알 수 없다.
 */
export default function ExpandableText({ children, maxLines, variant, className }: ExpandableTextProps) {
  const [lineCount, setLineCount] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const isLong = lineCount !== null && lineCount > maxLines;

  function handleTextLayout(event: NativeSyntheticEvent<TextLayoutEventData>) {
    if (lineCount === null) setLineCount(event.nativeEvent.lines.length);
  }

  function handleTogglePress() {
    setIsExpanded((expanded) => !expanded);
  }

  return (
    <>
      <Text
        variant={variant}
        className={className}
        numberOfLines={isLong && !isExpanded ? maxLines : undefined}
        onTextLayout={handleTextLayout}
      >
        {children}
      </Text>
      {isLong ? (
        <Pressable accessibilityRole="button" hitSlop={8} onPress={handleTogglePress}>
          <Text variant="body-xxs" className="text-text-muted">
            {isExpanded ? '접기' : '더보기'}
          </Text>
        </Pressable>
      ) : null}
    </>
  );
}
