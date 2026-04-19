"use client";

import React, { useState } from 'react';
import { Frown, Meh, Smile, SmilePlus, HeartPulse } from 'lucide-react';

interface ActivityRatingModalProps {
  onRate: (enjoyment: number, learning: number) => void;
}

export const ActivityRatingModal = ({ onRate }: ActivityRatingModalProps) => {
  const [enjoyment, setEnjoyment] = useState<number | null>(null);
  const [learning, setLearning] = useState<number | null>(null);

  const handleRating = (type: 'enjoyment' | 'learning', value: number) => {
    if (type === 'enjoyment') setEnjoyment(value);
    if (type === 'learning') setLearning(value);

    // If both are rated, submit automatically after a short delay
    if ((type === 'enjoyment' && learning !== null) || (type === 'learning' && enjoyment !== null)) {
      setTimeout(() => {
        onRate(type === 'enjoyment' ? value : enjoyment!, type === 'learning' ? value : learning!);
      }, 300);
    }
  };

  const IconMap = [
    { value: 1, Icon: Frown, color: 'text-danger' },
    { value: 2, Icon: Meh, color: 'text-warning' },
    { value: 3, Icon: Smile, color: 'text-primary' },
    { value: 4, Icon: SmilePlus, color: 'text-info' },
    { value: 5, Icon: HeartPulse, color: 'text-success' },
  ];

  return (
    <div className="card shadow-lg border-0 rounded-4 overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
      <div className="card-body p-4 text-center">
        <h4 className="fw-bold mb-4 text-dark">¡Cuéntanos tu experiencia!</h4>

        <div className="mb-4">
          <p className="fw-bold text-muted mb-2">¿Qué tan divertido fue jugar?</p>
          <div className="d-flex justify-content-center gap-2 gap-md-4">
            {IconMap.map(({ value, Icon, color }) => (
              <button
                key={`enjoy-${value}`}
                onClick={() => handleRating('enjoyment', value)}
                className={`btn btn-light rounded-circle shadow-sm d-flex justify-content-center align-items-center ${enjoyment === value ? 'border-2 border-primary bg-primary bg-opacity-10' : 'border-0'}`}
                style={{ width: '60px', height: '60px', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                onMouseEnter={(e) => { if (enjoyment !== value) e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { if (enjoyment !== value) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Icon size={32} className={enjoyment === value ? color : 'text-secondary'} strokeWidth={enjoyment === value ? 2.5 : 1.5} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="fw-bold text-muted mb-2">¿Sientes que aprendiste algo nuevo?</p>
          <div className="d-flex justify-content-center gap-2 gap-md-4">
            {IconMap.map(({ value, Icon, color }) => (
              <button
                key={`learn-${value}`}
                onClick={() => handleRating('learning', value)}
                className={`btn btn-light rounded-circle shadow-sm d-flex justify-content-center align-items-center ${learning === value ? 'border-2 border-primary bg-primary bg-opacity-10' : 'border-0'}`}
                style={{ width: '60px', height: '60px', transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                onMouseEnter={(e) => { if (learning !== value) e.currentTarget.style.transform = 'scale(1.1)'; }}
                onMouseLeave={(e) => { if (learning !== value) e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <Icon size={32} className={learning === value ? color : 'text-secondary'} strokeWidth={learning === value ? 2.5 : 1.5} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};