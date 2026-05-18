'use client';

import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const emitChange = useMemo(() => debounce((nextValue: string) => onChange(nextValue), 450), [onChange]);

  useEffect(() => () => emitChange.cancel(), [emitChange]);

  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Omnisearch</span>
      <input
        value={draft}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraft(nextValue);
          emitChange(nextValue);
        }}
        placeholder="Search SKU, item name, category, supplier, or location"
        className="h-12 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
      />
    </label>
  );
}
