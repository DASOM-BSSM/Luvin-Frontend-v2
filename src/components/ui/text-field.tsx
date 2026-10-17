import { cssInterop } from 'nativewind';
import { TextInput, type KeyboardTypeOptions } from 'react-native';

import { text as textColor } from '@/src/constants/colors';
import { body } from '@/src/constants/typography';

const InteropTextInput = cssInterop(TextInput, { className: 'style' });

interface TextFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  accessibilityLabel?: string;
}

/**
 * 한 줄 입력칸. Figma "그룹 만들기 - 리원"(6199:3608)의 `input`(6151:3060) — 높이 35, 흰 바탕,
 * default/gray 테두리, 모서리 8, 안쪽 여백 12, 글자 Body/XS.
 *
 * NOTE: 글꼴·글자 크기는 `TextArea` 와 같은 이유로 className 이 아니라 style 로 넣는다(NativeWind
 * 폰트 유틸이 TextInput 에 그대로 먹지 않는 일이 있다). lineHeight 는 iOS 에서 한 줄 입력칸 글자를
 * 위로 밀어 올려서 빼고, 안드로이드 기본 세로 padding 은 py-0 으로 없앤다.
 */
export default function TextField({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  accessibilityLabel,
}: TextFieldProps) {
  return (
    <InteropTextInput
      className="h-[35px] w-full rounded-[8px] border border-default-gray bg-default-white px-[12px] py-0"
      style={{ fontFamily: body.xs.fontFamily, fontSize: body.xs.fontSize, color: textColor.primary }}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={textColor.muted}
      keyboardType={keyboardType}
      maxLength={maxLength}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      textAlignVertical="center"
      underlineColorAndroid="transparent"
    />
  );
}
