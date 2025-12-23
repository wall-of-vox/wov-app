import { Pressable, Text, PressableProps } from 'react-native';

type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'destructive' | 'neutral' | 'outline';
  className?: string;
};

export default function Button({
  title,
  variant = 'primary',
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'px-4 py-2 rounded-full items-center justify-center';
  const variants = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    destructive: 'bg-destructive',
    neutral: 'bg-white',
    outline: 'border border-primary',
  } as const;
  const text = (variant === 'neutral' || variant === 'outline') ? 'text-primary font-medium' : 'text-white font-medium';
  const disabledClass = disabled ? 'opacity-50' : '';
  const pressableClass = [base, variants[variant], className, disabledClass].filter(Boolean).join(' ');
  return (
    <Pressable className={pressableClass} disabled={disabled} {...props}>
      <Text className={text}>{title}</Text>
    </Pressable>
  );
}
