"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";

interface TeacherEvaluationToastProps {
  activityId: string;
  grade: string;
  onRate: (rating: number) => Promise<void>;
  initialRating: number | null;
}

export default function TeacherEvaluationToast({ activityId, grade, onRate, initialRating }: TeacherEvaluationToastProps) {
  const [isVisible, setIsVisible] = useState(initialRating === null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  if (!isVisible) return null;

  const handleRate = async (rating: number) => {
    setSubmitting(true);
    await onRate(rating);
    setSubmitting(false);
    setIsVisible(false);
  };

  return (
    <div 
      className="position-fixed bottom-0 end-0 p-3 p-md-4 z-3 no-print" 
      style={{ animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards' }}
    >
      <div 
        className="card shadow-lg border-0 rounded-4 overflow-hidden" 
        style={{ width: '320px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}
      >
        <div className="card-body p-4 position-relative">
          <button 
            className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center"
            style={{ width: '28px', height: '28px', border: '1px solid #dee2e6' }}
            onClick={() => setIsVisible(false)}
            aria-label="Cerrar"
          >
            <X size={16} className="text-secondary" />
          </button>
          
          <h6 className="fw-bold text-dark mb-1 pr-4">Evaluación Rápida</h6>
          <p className="text-muted small mb-3">¿Qué tan efectiva fue esta actividad para <strong>{grade}</strong>?</p>
          
          <div className="d-flex justify-content-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                disabled={submitting}
                className="btn btn-link p-1 text-decoration-none border-0 shadow-none bg-transparent"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRate(star)}
              >
                <Star 
                  size={32} 
                  fill={star <= hoverRating ? "#fbbf24" : "transparent"} 
                  color={star <= hoverRating ? "#fbbf24" : "#cbd5e1"} 
                  style={{ transition: 'all 0.15s ease', transform: star <= hoverRating ? 'scale(1.15)' : 'scale(1)' }}
                />
              </button>
            ))}
          </div>

          <div className="text-center">
            <button 
              className="btn btn-link text-muted small text-decoration-none p-0" 
              onClick={() => setIsVisible(false)}
              style={{ fontSize: '0.8rem' }}
            >
              Saltar
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(120%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}