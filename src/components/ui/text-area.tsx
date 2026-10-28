import { TextInput, View } from 'react-native';
import { cssInterop } from 'nativewind';

import { text as textColor } from '@/src/constants/colors';
import { body } from '@/src/constants/typography';

const InteropTextInput = cssInterop(TextInput, { className: 'style' });

interface TextAreaProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  /** 보이는 줄 수. 시안(5482:2063)은 여섯 줄이 들어가는 높이다. */
  numberOfLines?: number;
  accessibilityLabel?: string;
}

/**
 * 여러 줄을 받는 입력칸. Figma `Text Area` (5482:2063).
 *
 * 테두리·모서리·여백은 Dropdown 과 같은 필드 모양이고 글자만 한 단계 작다(Body/S).
 *
 * NOTE: 글꼴·글자 크기는 className 이 아니라 style 로 넣는다. NativeWind 의 폰트 유틸이
 * TextInput 에는 그대로 먹지 않아 시스템 글꼴로 떨어지는 일이 있어서, 토큰 값을 직접 준다
 * (typography.ts 의 값이라 하드코딩이 아니다).
 *
 * NOTE: iOS 는 여러 줄 `TextInput` 의 `numberOfLines` 로 높이를 정하지 않는다(한 줄 높이로 시작해 끝없이
 * 늘어난다). 그래서 테두리 · 여백은 바깥 View 가 그리고, 입력칸 높이는 줄 높이 × 줄 수로 직접 정한 뒤
 * 넘치는 글은 칸 안에서 스크롤한다.
 */
export default function TextArea({
  value,
  onChangeText,
  placeholder,
  numberOfLines = 6,
  accessibilityLabel,
}: TextAreaProps) {
  return (
    <View className="w-[295px] rounded-[12px] border border-pink-300 px-[16px] py-[12px]">
      <InteropTextInput
        className="w-full p-0"
        style={{
          ...body.s,
          color: textColor.primary,
          textAlignVertical: 'top',
          height: body.s.lineHeight * numberOfLines,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={textColor.muted}
        accessibilityLabel={accessibilityLabel}
        multiline
        numberOfLines={numberOfLines}
      />
    </View>
  );
}
