import { Pressable, Text, PressableProps } from 'react-native';

type ButtonProps = PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary';
};

export default function Button({
  title,
  variant = 'primary',
  ...props
}: ButtonProps) {
  const base = 'px-4 py-3 rounded-full items-center justify-center';
  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-gray-600',
  } as const;
  const text = 'text-white font-medium';
  return (
    <Pressable className={`${base} ${variants[variant]}`} {...props}>
      <Text className={text}>{title}</Text>
    </Pressable>
  );
}

