import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import EditIcon from '@/src/assets/icons/EditIcon';
import TrashIcon from '@/src/assets/icons/TrashIcon';
import Text from '@/src/components/ui/text';

interface DiaryActionMenuProps {
  onDeletePress: () => void;
  onEditPress: () => void;
  /** 삭제 · 수정 요청 중이면 다시 누르지 못하게 한다(§11). */
  disabled?: boolean;
}

interface MenuRowProps {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  disabled: boolean;
}

/** 메뉴 한 줄. 시안에서 회색 바탕(default/gray)으로 칠해진 줄은 누르고 있는 상태로 본다. */
const MenuRow = ({ icon, label, onPress, disabled }: MenuRowProps) => (
  <Pressable
    accessibilityRole="button"
    disabled={disabled}
    onPress={onPress}
    className="w-full flex-row items-start gap-[10px] rounded-[8px] px-[12px] py-[6px] active:bg-default-gray"
  >
    {icon}
    <Text variant="body-xs" className="text-default-black">
      {label}
    </Text>
  </Pressable>
);

/** 내 일기의 더보기(⋮) 메뉴 — 삭제 · 수정. Figma "일기 삭제 및 수정"(6102:2606)의 6135:2755. */
export default function DiaryActionMenu({ onDeletePress, onEditPress, disabled = false }: DiaryActionMenuProps) {
  return (
    <View className="w-[113px] flex-col items-start rounded-[8px] bg-default-white p-[4px]">
      <MenuRow icon={<TrashIcon />} label="삭제" onPress={onDeletePress} disabled={disabled} />
      <MenuRow icon={<EditIcon />} label="수정" onPress={onEditPress} disabled={disabled} />
    </View>
  );
}
