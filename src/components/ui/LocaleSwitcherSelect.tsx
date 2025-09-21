'use client';

import clsx from 'clsx';
import {useTransition} from 'react';
import {Locale} from '@/config';
import {setUserLocale} from '@/services/locale';

type Props = {
  defaultValue: string;
  items: Array<{value: string; label: string}>;
  label: string;
};

export const LocaleSwitcherSelect = ({
  defaultValue,
  items,
  label
}: Props) => {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }


return (
  <div className="me-4">
    <div className="position-relative">
      <select
        defaultValue={defaultValue}
        onChange={(e) => onChange(e.target.value)}
        className={clsx(
          `form-select transition-all duration-300 cursor-pointer`,
          isPending && 'pointer-events-none opacity-60'
        )}
        style={{
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '15px',
          padding: '8px 35px 8px 15px',
          fontSize: '0.9rem',
          fontWeight: 'bold',
          fontFamily: 'Comic Sans MS, cursive',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
          minWidth: '120px'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
        }}
      >
        {items.map((item) => (
          <option
            key={item.value}
            value={item.value}
            style={{
              background: '#667eea',
              color: 'white',
              padding: '10px',
              fontFamily: 'Comic Sans MS, cursive',
              fontWeight: 'bold'
            }}
          >
            {item.value === 'en' ? '🇺🇸 English' : '🇳🇮 Español'}
          </option>
        ))}
      </select>
      
      {/* Flecha personalizada */}
      <div 
        style={{
          position: 'absolute',
          right: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          color: 'white',
          fontSize: '12px'
        }}
      >
        ▼
      </div>
    </div>
  </div>
);
}