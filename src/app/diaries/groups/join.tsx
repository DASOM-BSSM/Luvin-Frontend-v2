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
import { canSubmitJoinGroupForm } from '@/src/features/diaries/utils/group-form';

/**
 * 그룹 참여하기. Figma "그룹 참여하기"(6199:3756).
 *
 * NOTE: 초대코드로 참여하는 API 가 아직 없다 — 백엔드는 방장이 userId 로 멤버를 추가하는 초대
 * 방식만 있다(`docs/api/diaries.md`). 그래서 화면과 입력 검사까지만 만들고 버튼은 아직 아무 요청도
 * 보내지 않는다. 초대코드 참여 API 가 생기면 `handleJoinPress` 에서 부른다.
 */
export default function JoinGroupScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');

  const canSubmit = canSubmitJoinGroupForm({ inviteCode, nickname });

  function handleBackPress() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/diaries');
  }

  // 초대코드 참여 API 가 생기면 연결한다.
  function handleJoinPress() {}

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
              />
            </GroupFormField>
          </View>

          <Button
            label="그룹 참여하기"
            variant="primary"
            textVariant="body-s"
            disabled={!canSubmit}
            onPress={handleJoinPress}
          />
        </View>
      </ScrollView>

      <View className="pb-[10px]">
        <BottomNav active="diary" />
      </View>
    </Screen>
  );
}
