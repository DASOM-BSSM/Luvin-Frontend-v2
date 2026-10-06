import type { ReactNode } from 'react';
import { View } from 'react-native';

import Text from '@/src/components/ui/text';

interface GroupFormFieldProps {
  label: string;
  /** 제목 옆 보조 문구. 예: "2~6명" */
  hint?: string;
  children: ReactNode;
}

/** 제목 + 입력칸 한 묶음. Figma "그룹 만들기 - 리원"의 6151:3065 · 6151:3066 · 6151:3185. */
export default function GroupFormField({ label, hint, children }: GroupFormFieldProps) {
  return (
    <View className="w-full flex-col items-start gap-[8px]">
      <View className="flex-row items-start gap-[6px]">
        <Text variant="heading-h5" className="text-text-primary">
          {label}
        </Text>
        {hint ? (
          <Text variant="body-s" className="text-text-secondary">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}
