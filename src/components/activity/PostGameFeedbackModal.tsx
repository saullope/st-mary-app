"use client";

import React, { useState } from "react";
import { Star, ThumbsUp, X, ThumbsDown } from "lucide-react";

interface PostGameFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isTemplate: boolean;
}

export const PostGameFeedbackModal = ({ isOpen, onClose, onSubmit, isTemplate }: PostGameFeedbackModalProps) => {
  const [utilityRating, setUtilityRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // Conditional state
  const [difficultyRating, setDifficultyRating] = useState<number | null>(null);
  const [objectiveMet, setObjectiveMet] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      utilityRating,
      difficultyRating,
      objectiveMet
    });
  };

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 z-3 d-flex justify-content-center align-items-center" style={{ background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' }}>
      <div 
        className="card shadow-xl border-0 rounded-4 overflow-hidden" 
        style={{ width: '90%', maxWidth: '420px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="card-body p-4 position-relative text-center">
          <button 
            className="btn btn-sm btn-light rounded-circle position-absolute top-0 end-0 m-3 d-flex align-items-center justify-content-center"
            style={{ width: '32px', height: '32px' }}
            onClick={onClose}
          >
            <X size={18} className="text-secondary" />
          </button>
          
          <h4 className="fw-bold text-dark mb-2">¡Sesión Terminada!</h4>
          <p className="text-muted small mb-4">Tu evaluación nos ayuda a mejorar LudiGame.</p>
          
          {/* Conditional Question */}
          <div className="mb-4 bg-light rounded-4 p-3 border">
            {isTemplate ? (
              <>
                <p className="fw-bold text-dark mb-3 small">¿Dificultad acorde al grado?</p>
                <div className="d-flex justify-content-center gap-3">
                  {[
                    { val: 1, label: "Baja" },
                    { val: 2, label: "Adecuada" },
                    { val: 3, label: "Alta" }
                  ].map(option => (
                    <button
                      key={option.val}
                      className={`btn btn-sm rounded-pill px-3 fw-bold ${difficultyRating === option.val ? 'btn-primary shadow-sm' : 'btn-outline-secondary'}`}
                      onClick={() => setDifficultyRating(option.val)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="fw-bold text-dark mb-3 small">¿Objetivo pedagógico cumplido?</p>
                <div className="d-flex justify-content-center gap-3">
                  <button
                    className={`btn rounded-circle p-3 d-flex align-items-center justify-content-center ${objectiveMet === true ? 'btn-success text-white shadow' : 'btn-light text-secondary border'}`}
                    onClick={() => setObjectiveMet(true)}
                  >
                    <ThumbsUp size={24} />
                  </button>
                  <button
                    className={`btn rounded-circle p-3 d-flex align-items-center justify-content-center ${objectiveMet === false ? 'btn-danger text-white shadow' : 'btn-light text-secondary border'}`}
                    onClick={() => setObjectiveMet(false)}
                  >
                    <ThumbsDown size={24} />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Global Utility */}
          <div className="mb-4">
            <p className="fw-bold text-dark mb-2">Utilidad General</p>
            <div className="d-flex justify-content-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className="btn btn-link p-1 text-decoration-none border-0 shadow-none bg-transparent"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setUtilityRating(star)}
                >
                  <Star 
                    size={36} 
                    fill={star <= (hoverRating || utilityRating) ? "#fbbf24" : "transparent"} 
                    color={star <= (hoverRating || utilityRating) ? "#fbbf24" : "#cbd5e1"} 
                    style={{ transition: 'all 0.15s ease', transform: star <= hoverRating ? 'scale(1.15)' : 'scale(1)' }}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="d-flex flex-column gap-2 mt-4">
            <button 
              className="btn btn-primary rounded-pill py-2 fw-bold shadow-sm"
              disabled={utilityRating === 0 || (isTemplate ? difficultyRating === null : objectiveMet === null)}
              onClick={handleSubmit}
            >
              Enviar Evaluación y Terminar
            </button>
            <button 
              className="btn btn-link text-muted small text-decoration-none fw-medium" 
              onClick={onClose}
            >
              Saltar Encuesta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};