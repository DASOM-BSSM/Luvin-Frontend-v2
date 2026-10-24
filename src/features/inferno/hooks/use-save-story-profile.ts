/**
 * [DRAFT] 나이·성별을 함께 저장한 뒤 프로필을 다시 받고, 막혀 있던 회차 본문을 다시 요청한다
 * (보정 문서 7장, 계약 v4). 마이페이지가 기기에 들고 있는 성별도 같이 맞춘다 — 안 맞추면
 * 마이페이지 수정 화면이 예전 성별로 다시 저장할 수 있다.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveStoryProfile } from '@/src/features/inferno/api/story';
import { useProfileSettingsStore } from '@/src/features/my-page/store/profile-settings-store';
import { userKeys } from '@/src/features/user/api/query-keys';

export default function useSaveStoryProfile(onSaved: () => void) {
  const client = useQueryClient();
  const setGender = useProfileSettingsStore((state) => state.setGender);
  return useMutation({
    mutationFn: saveStoryProfile,
    onSuccess: (_, profile) => {
      setGender(profile.gender);
      void client.invalidateQueries({ queryKey: userKeys.me });
      onSaved();
    },
  });
}
