import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/**
 * Figma "Luvin-Design" 의 텍스트 스타일 이름과 1:1 로 대응한다.
 * (`Heading/H1`~`H5`, `Body/XL`~`XXS`)
 */
export type TextVariant =
  | 'heading-h1'
  | 'heading-h2'
  | 'heading-h3'
  | 'heading-h4'
  | 'heading-h5'
  | 'body-xl'
  | 'body-l'
  | 'body-m'
  | 'body-s'
  | 'body-xs'
  | 'body-xxs';

/**
 * RN 은 정적 폰트 파일 간 굵기 합성을 못 하므로 굵기를 패밀리로 표현한다(AGENTS.md §8).
 * 크기 토큰과 패밀리를 따로 쓰면 짝이 어긋나기 쉬워서 여기서 한 쌍으로 묶어둔다.
 */
const VARIANT_CLASS: Record<TextVariant, string> = {
  'heading-h1': 'font-yde-street-b text-heading-h1',
  'heading-h2': 'font-yde-street-b text-heading-h2',
  'heading-h3': 'font-yde-street-b text-heading-h3',
  'heading-h4': 'font-yde-street-b text-heading-h4',
  'heading-h5': 'font-yde-street-b text-heading-h5',
  'body-xl': 'font-yde-street-l text-body-xl',
  'body-l': 'font-yde-street-l text-body-l',
  'body-m': 'font-yde-street-l text-body-m',
  'body-s': 'font-yde-street-l text-body-s',
  'body-xs': 'font-yde-street-l text-body-xs',
  'body-xxs': 'font-yde-street-l text-body-xxs',
};

interface TextProps extends RNTextProps {
  variant?: TextVariant;
}

export default function Text({
  variant = 'body-m',
  className,
  ...rest
}: TextProps) {
  return <RNText className={`${VARIANT_CLASS[variant]} ${className ?? ''}`} {...rest} />;
}
