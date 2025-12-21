import React, { useMemo, useState } from 'react';
import { Pressable, View, Text } from 'react-native';

export type CheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: number;
};

export function Checkbox({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  className,
  size = 20,
}: CheckboxProps) {
  const [internal, setInternal] = useState<boolean>(!!defaultChecked);
  const isControlled = useMemo(() => checked !== undefined, [checked]);
  const isChecked = isControlled ? !!checked : internal;

  const base =
    'items-center justify-center rounded-md border-2 border-primary/30';
  const active = isChecked ? 'border-primary bg-primary' : '';
  const disabledCls = disabled ? 'opacity-50' : '';
  const pressCls = [base, active, disabledCls]
    .filter(Boolean)
    .join(' ');

  const toggle = () => {
    if (disabled) return;
    const next = !isChecked;
    if (isControlled) onCheckedChange?.(next);
    else {
      setInternal(next);
      onCheckedChange?.(next);
    }
  };

  return (
    <Pressable
      className={className ? `${pressCls} ${className}` : pressCls}
      style={{ width: size, height: size }}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled: !!disabled }}
      disabled={disabled}
      onPress={toggle}
    >
      {isChecked ? (
        <View className="items-center justify-center">
          <Text className="text-white text-xs font-bold">✓</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

