/** [DRAFT] 나이 저장 후 프로필을 다시 받고, 막혀 있던 회차 본문을 다시 요청한다(보정 문서 7장). */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveStoryAge } from '@/src/features/inferno/api/story';
import { userKeys } from '@/src/features/user/api/query-keys';

export default function useSaveAge(onSaved: () => void) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: saveStoryAge,
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: userKeys.me });
      onSaved();
    },
  });
}
