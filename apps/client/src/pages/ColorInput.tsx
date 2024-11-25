import { ChangeEvent } from 'react';
import { cn } from '@/lib/utils.ts';

interface ColorInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorInput({ value, onChange, className = '' }: ColorInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={cn('border-input relative h-10 w-full rounded-md border', className)}>
      <input
        type="color"
        value={value}
        onChange={handleChange}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
      <div className="flex h-full items-center px-3 text-sm">{value}</div>
      <div
        className="absolute right-0 top-0 h-full w-10 rounded-r-md"
        style={{ backgroundColor: value }}
      />
    </div>
  );
}
