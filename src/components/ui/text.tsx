import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

/** `Heading/H1`~`H5`, `Body/XL`~`XXS` */
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
