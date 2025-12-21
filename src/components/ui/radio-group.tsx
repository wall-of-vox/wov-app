import React, { createContext, useContext, useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';

type RadioGroupContextValue = {
  value?: string;
  setValue: (v: string) => void;
  disabled?: boolean;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export type RadioGroupProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
};

export function RadioGroup({
  value,
  onValueChange,
  className,
  children,
  disabled,
}: RadioGroupProps) {
  const [internal, setInternal] = useState<string | undefined>(undefined);
  const selected = value !== undefined ? value : internal;

  const setValue = (v: string) => {
    if (disabled) return;
    if (onValueChange) onValueChange(v);
    else setInternal(v);
  };

  const ctx = useMemo(
    () => ({ value: selected, setValue, disabled }),
    [selected, disabled],
  );

  const groupClass =
    className && className.length ? className : 'flex flex-col space-y-3';

  return (
    <RadioGroupContext.Provider value={ctx}>
      <View
        className={groupClass}
        accessibilityRole="radiogroup"
        accessibilityState={{ disabled: !!disabled }}
      >
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

export type RadioGroupItemProps = {
  value: string;
  className?: string;
  disabled?: boolean;
  size?: number;
};

export function RadioGroupItem({
  value,
  className,
  disabled,
  size = 20,
}: RadioGroupItemProps) {
  const ctx = useContext(RadioGroupContext);
  const selected = ctx?.value === value;
  const isDisabled = !!disabled || !!ctx?.disabled;

  const base = 'items-center justify-center rounded-full';
  const selectedClass = selected ? 'border-primary' : 'border-gray-300';
  const opacity = isDisabled ? 'opacity-50' : '';
  const pressableClass = [base, 'border bg-white', selectedClass, opacity]
    .filter(Boolean)
    .join(' ');

  const innerSize = Math.max(0, size - 8);

  return (
    <Pressable
      className={className ? `${pressableClass} ${className}` : pressableClass}
      style={{ width: size, height: size }}
      disabled={isDisabled}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected, disabled: isDisabled }}
      onPress={() => ctx?.setValue(value)}
    >
      {selected ? (
        <View
          style={{ width: innerSize, height: innerSize }}
          className="rounded-full bg-primary"
        />
      ) : null}
    </Pressable>
  );
}

