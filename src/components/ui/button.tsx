import { Pressable, type PressableProps } from 'react-native';

import Text from '@/src/components/ui/text';

/**
 * - `outline` : 밝은 배경 + 검은 테두리
 * - `filled`  : 노란 배경 + 노란 테두리
 */
export type ButtonVariant = 'outline' | 'filled';

const VARIANT_CONTAINER: Record<ButtonVariant, string> = {
  outline: 'border-default-black bg-default-bg',
  filled: 'border-yellow-300 bg-yellow-200',
};

const VARIANT_LABEL: Record<ButtonVariant, string> = {
  outline: 'text-default-black',
  filled: 'text-text-primary',
};

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
}

export default function Button({
  label,
  variant = 'outline',
  className,
  ...rest
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className={`flex-row items-center justify-center rounded-[8px] border px-[20px] py-[6px] ${VARIANT_CONTAINER[variant]} ${className ?? ''}`}
      {...rest}
    >
      <Text variant="body-xs" className={VARIANT_LABEL[variant]}>
        {label}
      </Text>
    </Pressable>
  );
}
