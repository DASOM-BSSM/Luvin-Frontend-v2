import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import AngleUpIcon from '@/src/assets/icons/AngleUpIcon';
import BottomNav from '@/src/components/bottom-nav';
import Button from '@/src/components/ui/button';
import Screen from '@/src/components/ui/screen';
import Text from '@/src/components/ui/text';
import TextField from '@/src/components/ui/text-field';
import GroupFormField from '@/src/features/diaries/components/group-form-field';
import useCreateRoom from '@/src/features/diaries/hooks/use-create-room';
import {
  GROUP_MEMBER_COUNT_MAX,
  GROUP_MEMBER_COUNT_MIN,
  canSubmitCreateGroupForm,
  sanitizeMemberCountInput,
} from '@/src/features/diaries/utils/group-form';

/**
 * 그룹 만들기. Figma "그룹 만들기 - 리원"(6199:3608).
 *
 * NOTE: API(`POST /api/diary-rooms`)는 그룹 이름(`name`)만 받는다. "그룹 인원수"와 "그룹장 닉네임"은
 * 시안에 있어 입력은 받지만 보낼 필드가 아직 없다 — 백엔드에 필드가 생기면 `createRoomMutation.mutate`
 * 에 함께 넣는다.
 */
export default function CreateGroupScreen() {
  const [name, setName] = useState('');
  const [memberCount, setMemberCount] = useState('');
  const [ownerNickname, setOwnerNickname] = useState('');
  const createRoomMutation = useCreateRoom();

  const canSubmit = canSubmitCreateGroupForm({ name, memberCount, ownerNickname });

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/diaries');
  }

  function handleMemberCountChange(value: string) {
    setMemberCount(sanitizeMemberCountInput(value));
  }

  function handleCreatePress() {
    createRoomMutation.mutate({ name: name.trim() }, { onSuccess: handleBackPress });
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[60px] px-[30px] pb-[24px] pt-[36px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full flex-row items-end gap-[12px]">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
            className="size-[24px] items-center justify-center"
            onPress={handleBackPress}
          >
            <View className="-rotate-90">
              <AngleUpIcon />
            </View>
          </Pressable>
          <Text variant="heading-h4" className="text-text-primary">
            그룹 만들기
          </Text>
        </View>

        <View className="w-full flex-col items-start gap-[40px]">
          <View className="w-full flex-col items-start gap-[24px]">
            <GroupFormField label="그룹 이름">
              <TextField value={name} onChangeText={setName} placeholder="그룹 이름을 작성해주세요" />
            </GroupFormField>
            <GroupFormField
              label="그룹 인원수"
              hint={`${GROUP_MEMBER_COUNT_MIN}~${GROUP_MEMBER_COUNT_MAX}명`}
            >
              <TextField
                value={memberCount}
                onChangeText={handleMemberCountChange}
                placeholder="총 인원수를 적어주세요"
                keyboardType="number-pad"
                maxLength={1}
              />
            </GroupFormField>
            <GroupFormField label="그룹장 닉네임">
              <TextField
                value={ownerNickname}
                onChangeText={setOwnerNickname}
                placeholder="자신의 닉네임을 설정해주세요"
              />
            </GroupFormField>
          </View>

          <View className="w-full flex-col items-center gap-[8px]">
            <Button
              label="그룹 만들기"
              variant="primary"
              textVariant="body-s"
              disabled={!canSubmit || createRoomMutation.isPending}
              onPress={handleCreatePress}
            />
            {createRoomMutation.isError ? (
              <Text variant="body-xs" className="text-state-error">
                그룹을 만들지 못했어요. 다시 시도해 주세요
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="diary" />
      </View>
    </Screen>
  );
}
