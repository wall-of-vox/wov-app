import { View, Text, TextInput, TextInputProps } from 'react-native';
import { ReactNode } from 'react';

type Variant =
  | 'default'
  | 'active'
  | 'neutral'
  | 'muted_outline'
  | 'destructive'
  | 'outline'
  | 'outline_light'
  | 'outline_secondary'
  | 'secondary'
  | 'ghost'
  | 'link'
  | 'accent'
  | 'hero'
  | 'primary';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  variant?: Variant;
  right?: ReactNode;
};

export default function Input({
  label,
  error,
  variant = 'default',
  right,
  editable = true,
  ...props
}: InputProps) {
  const baseInput = 'border rounded-full px-6';
  const variants = {
    default: 'border-gray-300 bg-white',
    active: 'border-primary bg-white',
    neutral: 'border-gray-200 bg-white',
    muted_outline: 'border-muted bg-transparent',
    destructive: 'border-red-500 bg-white',
    outline: 'border-primary bg-transparent',
    outline_light: 'border-light bg-transparent',
    outline_secondary: 'border-secondary bg-transparent',
    secondary: 'border-secondary bg-secondary/10',
    ghost: 'border-transparent bg-transparent',
    link: 'border-transparent bg-transparent',
    accent: 'border-accent bg-white',
    hero: 'border-primary bg-white',
    primary: 'border-primary bg-white',
  } as const;

  const inputClassName = [
    baseInput,
    variants[variant],
    error ? 'border-red-500' : '',
    !editable ? 'opacity-50' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <View className="gap-2">
      {label ? <Text className="text-gray-700">{label}</Text> : null}
      <View className="relative">
        <TextInput className={inputClassName} editable={editable} {...props} />
        {right ? (
          <View className="absolute right-0 top-0 h-full px-4 py-2 items-center justify-center">
            {right}
          </View>
        ) : null}
      </View>
      {error ? <Text className="text-sm text-red-600">{error}</Text> : null}
    </View>
  );
}
