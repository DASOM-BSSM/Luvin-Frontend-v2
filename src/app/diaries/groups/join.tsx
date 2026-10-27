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
import useJoinRoom from '@/src/features/diaries/hooks/use-join-room';
import type { DiaryRoomMembership } from '@/src/features/diaries/types';
import { getJoinRoomErrorMessage } from '@/src/features/diaries/utils/errors';
import {
  GROUP_NICKNAME_MAX_LENGTH,
  canSubmitJoinGroupForm,
} from '@/src/features/diaries/utils/group-form';

/**
 * 그룹 참여하기. Figma "그룹 참여하기"(6199:3756).
 *
 * 초대코드와 "나의 닉네임"(이 그룹에서 쓸 닉네임)으로 `POST /api/diary-rooms/join` 에 참여하고,
 * 성공하면 그 그룹의 감정일기 메인으로 간다. 뒤로가기로 이 폼에 돌아오지 않도록 replace 로 이동한다.
 */
export default function JoinGroupScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');

  const joinRoomMutation = useJoinRoom();

  const canSubmit = canSubmitJoinGroupForm({ inviteCode, nickname });

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/diaries');
  }

  function handleJoinSuccess({ roomId }: DiaryRoomMembership) {
    router.replace({ pathname: '/diaries/groups/[roomId]', params: { roomId } });
  }

  function handleJoinPress() {
    joinRoomMutation.mutate(
      { inviteCode: inviteCode.trim(), nickname: nickname.trim() },
      { onSuccess: handleJoinSuccess },
    );
  }

  return (
    <Screen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-col gap-[60px] px-[30px] pb-[24px] pt-[36px]"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full flex-row items-center gap-[12px]">
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
            그룹 참여하기
          </Text>
        </View>

        <View className="w-full flex-col items-start gap-[40px]">
          <View className="w-full flex-col items-start gap-[24px]">
            <GroupFormField label="초대코드">
              <TextField
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="그룹장에게 받은 초대코드를 입력해주세요"
              />
            </GroupFormField>
            <GroupFormField label="나의 닉네임">
              <TextField
                value={nickname}
                onChangeText={setNickname}
                placeholder="자신의 닉네임을 설정해주세요"
                maxLength={GROUP_NICKNAME_MAX_LENGTH}
              />
            </GroupFormField>
          </View>

          <View className="w-full flex-col items-center gap-[8px]">
            <Button
              label="그룹 참여하기"
              variant="primary"
              textVariant="body-s"
              disabled={!canSubmit || joinRoomMutation.isPending}
              onPress={handleJoinPress}
            />
            {joinRoomMutation.isError ? (
              <Text variant="body-xs" className="text-state-error">
                {getJoinRoomErrorMessage(joinRoomMutation.error)}
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
