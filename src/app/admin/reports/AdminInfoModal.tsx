"use client";

import { useState } from "react";
import { FaInfoCircle, FaTimes, FaStar, FaSmile, FaExclamationTriangle, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function AdminInfoModal() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        className="btn d-flex align-items-center justify-content-center shadow-sm"
        style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00d4ff 0%, #00b4d8 100%)', color: 'white', border: 'none',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 10px rgba(0, 212, 255, 0.3)'
        }}
        title="Guía de Interpretación"
        onClick={() => setIsOpen(true)}
      >
        <FaInfoCircle size={18} />
      </button>
    );
  }

  return (
    <>
      <button 
        className="btn d-flex align-items-center justify-content-center shadow-sm"
        style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: '#1D153A', color: 'white', border: 'none',
            transition: 'all 0.2s ease'
        }}
        title="Cerrar Guía"
        onClick={() => setIsOpen(false)}
      >
        <FaInfoCircle size={18} />
      </button>

      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)', zIndex: 1050 }}>
        <div className="card shadow-lg border-0" style={{ width: '90%', maxWidth: '500px', borderRadius: '1.5rem', background: '#E8E5F7', border: '1px solid rgba(29,21,58,0.1)' }}>
          <div className="card-header border-0 d-flex justify-content-between align-items-center pt-4 px-4" style={{ background: 'transparent' }}>
            <h5 className="fw-bold mb-0" style={{ color: '#1D153A' }}>
              <FaInfoCircle className="me-2" style={{ color: '#6a4bff' }} />
              Guía de Analíticas
            </h5>
            <button className="btn btn-sm shadow-none" onClick={() => setIsOpen(false)}>
              <FaTimes size={20} style={{ color: '#1D153A' }} />
            </button>
          </div>
          <div className="card-body px-4 pb-4">
            <p className="small mb-4" style={{ color: '#4a4266' }}>Esta guía te ayudará a interpretar rápidamente las métricas recolectadas durante las sesiones de juego.</p>
            
            <div className="mb-3 p-3 rounded-4" style={{ background: 'rgba(29,21,58,0.03)', border: '1px solid rgba(29,21,58,0.05)' }}>
                <h6 className="fw-bold d-flex align-items-center" style={{ color: '#1D153A' }}><FaStar className="me-2" style={{ color: '#e5b869' }} /> Evaluación Docente</h6>
                <p className="small mb-0" style={{ color: '#4a4266' }}>Representa de 1 a 5 estrellas qué tan útil le pareció la actividad al educador para cumplir su objetivo académico.</p>
            </div>

            <div className="mb-3 p-3 rounded-4" style={{ background: 'rgba(29,21,58,0.03)', border: '1px solid rgba(29,21,58,0.05)' }}>
                <h6 className="fw-bold d-flex align-items-center" style={{ color: '#1D153A' }}><FaSmile className="me-2" style={{ color: '#198754' }} /> Recepción de Estudiantes</h6>
                <p className="small mb-0" style={{ color: '#4a4266' }}>Es el promedio de la "Diversión" y "Aprendizaje" que reportaron los alumnos. Mayor a 4 indica una actividad muy motivadora.</p>
            </div>

            <div className="mb-3 p-3 rounded-4" style={{ background: 'rgba(29,21,58,0.03)', border: '1px solid rgba(29,21,58,0.05)' }}>
                <h6 className="fw-bold d-flex align-items-center" style={{ color: '#1D153A' }}><FaExclamationTriangle className="me-2" style={{ color: '#dc3545' }} /> Pregunta de Riesgo</h6>
                <p className="small mb-0" style={{ color: '#4a4266' }}>Identifica automáticamente la pregunta con mayor índice de error en la clase, indicando un concepto que debe reforzarse.</p>
            </div>
            
            <div className="p-3 rounded-4" style={{ background: 'rgba(29,21,58,0.03)', border: '1px solid rgba(29,21,58,0.05)' }}>
                <h6 className="fw-bold d-flex align-items-center" style={{ color: '#1D153A' }}><FaArrowUp className="me-1"/><FaArrowDown className="me-2"/> Tendencia de Alumno</h6>
                <p className="small mb-0" style={{ color: '#4a4266' }}>Indica si el rendimiento específico del estudiante estuvo por encima (Verde) o por debajo (Rojo) del promedio general de esa sesión.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}