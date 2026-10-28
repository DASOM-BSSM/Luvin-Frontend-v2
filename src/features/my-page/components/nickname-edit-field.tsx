import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import Text from '@/src/components/ui/text';
import { text as textColor } from '@/src/constants/colors';
import { body } from '@/src/constants/typography';
import { useProfileSettingsStore } from '@/src/features/my-page/store/profile-settings-store';

/**
 * "어떻게 불러드릴까요?" 닉네임 입력 행. Figma 6620:4676.
 *
 * 기본은 잠겨 있고(편집 불가) "수정"을 눌러야 입력할 수 있다 — 다시 누르면("완료") 스토어에
 * 저장하고 잠긴다.
 */
export default function NicknameEditField() {
  const nickname = useProfileSettingsStore((state) => state.nickname);
  const setNickname = useProfileSettingsStore((state) => state.setNickname);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(nickname);

  function handleToggleEditPress() {
    if (isEditing) {
      setNickname(draft);
    }
    setIsEditing((editing) => !editing);
  }

  return (
    <View className="w-full flex-row items-center gap-[4px]">
      <View className="h-[35px] flex-1 flex-row items-center rounded-[8px] border border-default-gray bg-default-white px-[12px]">
        {/* TextInput 은 안드로이드 기본 세로 padding 이 붙어서 py 를 주면 수정 버튼보다
            높아진다 — p-0 + textAlignVertical="center" 로 버튼과 높이(35px)를 맞춘다. */}
        <TextInput
          value={draft}
          onChangeText={setDraft}
          editable={isEditing}
          placeholder="이름 혹은 닉네임을 작성해주세요"
          placeholderTextColor={textColor.muted}
          textAlignVertical="center"
          underlineColorAndroid="transparent"
          numberOfLines={1}
          className="w-full flex-1 p-0 text-text-primary"
          // 줄 높이는 빼고 글꼴 · 크기만 준다 — iOS 한 줄 입력칸에 160% 줄 높이를 주면 글자가 아래로 밀려 잘린다.
          style={{ fontFamily: body.xs.fontFamily, fontSize: body.xs.fontSize }}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        className="h-[35px] items-center justify-center rounded-[8px] bg-yellow-300 px-[10px]"
        onPress={handleToggleEditPress}
      >
        <Text variant="body-xs" className="text-text-primary">
          {isEditing ? '완료' : '수정'}
        </Text>
      </Pressable>
    </View>
  );
}
