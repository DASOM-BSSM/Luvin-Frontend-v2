import { Switch, View } from 'react-native';

import Text from '@/src/components/ui/text';
import theme from '@/src/constants/theme';
import useMyProfile from '@/src/features/user/hooks/use-my-profile';
import useUpdateProfile from '@/src/features/user/hooks/use-update-profile';

/**
 * 마이페이지 "AI 캐릭터 개인화" 토글 — 서버 learningEnabled. 시안이 없어 RN Switch 에 토큰 색을 입혔다.
 * 바꾸는 즉시 PUT /api/users/me 로 저장한다.
 */
export default function AiPersonalizationToggle() {
  const myProfileQuery = useMyProfile();
  const updateProfileMutation = useUpdateProfile();

  const savedValue = myProfileQuery.data?.learningEnabled ?? true;
  const pendingValue = updateProfileMutation.variables?.learningEnabled;
  // 저장 중 · 저장 뒤 다시 불러오는 동안에는 방금 고른 값을 보여준다 — 잠깐 원래 값으로 튀지 않게.
  const isSaving =
    updateProfileMutation.isPending ||
    (updateProfileMutation.isSuccess && myProfileQuery.isFetching);
  const isEnabled = isSaving && pendingValue !== undefined ? pendingValue : savedValue;

  function handleToggleValueChange(next: boolean) {
    updateProfileMutation.mutate({ learningEnabled: next });
  }

  return (
    <View className="w-full flex-col items-start gap-[12px]">
      <View className="w-full flex-row items-center justify-between gap-[12px]">
        <Text variant="heading-h5" className="text-text-primary">
          AI 캐릭터 개인화
        </Text>
        <Switch
          value={isEnabled}
          disabled={myProfileQuery.isPending || updateProfileMutation.isPending}
          onValueChange={handleToggleValueChange}
          trackColor={{ false: theme.colors.default.gray, true: theme.colors.pink[500] }}
          thumbColor={theme.colors.default.white}
          ios_backgroundColor={theme.colors.default.gray}
        />
      </View>
      <Text variant="body-xs" className="text-text-muted">
        내 일기 · 댓글 · 답변에서 말투와 성향을 뽑아 러빈지옥 속 내 캐릭터에 반영해요. 끄면 내 글을
        캐릭터에 쓰지 않아요.
      </Text>
      {updateProfileMutation.isError ? (
        <Text variant="body-xs" className="text-state-error">
          설정을 바꾸지 못했어요. 다시 시도해주세요
        </Text>
      ) : null}
    </View>
  );
}
