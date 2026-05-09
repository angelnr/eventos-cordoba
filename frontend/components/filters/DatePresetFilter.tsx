import React from 'react';
import { Button } from '../ui/Button';

interface DatePresetFilterProps {
  value?: string;
  onChange: (preset?: string) => void;
}

const PRESETS = [
  { key: 'today', label: 'Hoy' },
  { key: 'this_week', label: 'Esta semana' },
  { key: 'this_weekend', label: 'Este fin de semana' },
  { key: 'upcoming', label: 'Próximos' },
];

export default function DatePresetFilter({ value, onChange }: DatePresetFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRESETS.map(preset => (
        <Button
          key={preset.key}
          variant={value === preset.key ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onChange(value === preset.key ? undefined : preset.key)}
        >
          {preset.label}
        </Button>
      ))}
    </div>
  );
}
