'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './SelectableCard.module.css';

interface SelectableCardProps {
    selected: boolean;
    onToggle: () => void;
    className?: string;
    ariaLabel?: string;
    children: React.ReactNode;
}

export const SelectableCard = ({ selected, onToggle, className, ariaLabel, children }: SelectableCardProps) => {
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onToggle();
    };

    return (
        <div
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            aria-label={ariaLabel}
            className={clsx(styles.selectableCard, selected && styles.selected, className)}
            onClick={onToggle}
            onKeyDown={handleKeyDown}
        >
            {children}
        </div>
    );
};
