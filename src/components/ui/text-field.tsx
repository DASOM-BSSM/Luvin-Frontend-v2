import { TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { text as textColor } from '@/src/constants/colors';

interface TextFieldProps {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  accessibilityLabel?: string;
  /** false 면 읽기 전용(그룹 설정하기의 잠긴 그룹 이름 · 초대코드). 기본 true. */
  editable?: boolean;
}

/**
 * 한 줄 입력칸. Figma "그룹 만들기 - 리원"(6199:3608)의 `input`(6151:3060) — 높이 35, 흰 바탕,
 * default/gray 테두리, 모서리 8, 안쪽 여백 12, 글자 Body/XS.
 *
 * 마이페이지 닉네임 입력칸(nickname-edit-field.tsx)과 같은 방식으로 만든다 — 테두리 상자는 View 가
 * 그리고, 안쪽 `TextInput` 은 NativeWind 기본 className 만 쓴다. 예전에는 `TextInput` 에
 * `cssInterop` 을 한 번 더 걸고 className 과 style 을 함께 넘겼는데, 그룹 만들기에서 글자가 입력되지
 * 않는다는 리뷰가 있어(LUV-83) 실기기에서 잘 되던 이 방식으로 바꿨다.
 *
 * 안드로이드는 TextInput 에 기본 세로 padding 이 붙어서 p-0 + textAlignVertical="center" 로 높이를 맞춘다.
 */
export default function TextField({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  accessibilityLabel,
  editable = true,
}: TextFieldProps) {
  return (
    <View className="h-[35px] w-full flex-row items-center rounded-[8px] border border-default-gray bg-default-white px-[12px]">
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={textColor.muted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        editable={editable}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        textAlignVertical="center"
        underlineColorAndroid="transparent"
        numberOfLines={1}
        className="w-full flex-1 p-0 font-yde-street-l text-body-xs text-text-primary"
      />
    </View>
  );
}
