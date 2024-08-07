'use client';

import { BsCheck } from 'react-icons/bs';
import clsx from 'clsx';
import {useTransition} from 'react';
import {Locale} from '@/config';
import {setUserLocale} from '@/services/locale';

type Props = {
  defaultValue: string;
  items: Array<{value: string; label: string}>;
  label: string;
};

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
  label
}: Props) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }


return (
  <div className="me-4">
    <div className="position-relative flex items-center">
      <select
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          `form-select rounded-sm transition-colors hover:bg-slate-200 cursor-pointer`,
          isPending && 'pointer-events-none opacity-60'
        )}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          background: 'none',
          paddingRight: '1.5rem',
          fontSize: '0.875rem',
          cursor:'pointer'
        }}
      >
        {items.map((item) => (
          <option
            key={item.value}
            className="d-flex cursor-default align-items-center px-3 py-2 text-base data-[highlighted]:bg-slate-100"
            value={item.value}
            style={{
              appearance: 'none',
              padding: '0.5rem', 
              borderRadius: 0,
              border: '1px solid',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '8px 10px'
            }}
          >
            {item.label}
          </option>
        ))}
      </select>
    </div>
  </div>
);
}