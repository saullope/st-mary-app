"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FaPlusCircle, FaClone, FaListOl, FaHeadphones, FaVideo, FaImage, FaYoutube, FaMagic, FaArrowRight, FaPen } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";

type GradeKey = 'firstGrade' | 'secondGrade' | 'thirdGrade';

interface DashboardHubProps {
  userName: string;
  drafts: any[];
}

export default function DashboardHub({ userName, drafts }: DashboardHubProps) {
  const { setSelectedGrade } = useAuth();
  const [grade, setGrade] = useState<GradeKey>('firstGrade');
  const router = useRouter();

  useEffect(() => {
    const storedGrade = localStorage.getItem('grade') as GradeKey;
    if (storedGrade) {
      setGrade(storedGrade);
      setSelectedGrade(storedGrade);
    }
  }, [setSelectedGrade]);

  const handleGradeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGrade = e.target.value as GradeKey;
    setGrade(newGrade);
    setSelectedGrade(newGrade);
    localStorage.setItem('grade', newGrade);
  };

  const getFirstName = (name: string) => name.split(' ')[0];

  return (
    <div className="container-fluid py-4 px-md-4" style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
      {/* Top Bar Context */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 pb-3 border-bottom border-secondary border-opacity-25">
        <h2 className="fw-bold mb-3 mb-md-0" style={{ color: '#2c3e50', letterSpacing: '-0.5px' }}>
          ¡Hola, <span className="text-primary">{getFirstName(userName)}</span>! ¿Qué experiencia educativa vamos a crear hoy?
        </h2>
        <div className="d-flex align-items-center bg-white rounded-pill px-3 py-2 shadow-sm border">
          <label htmlFor="gradeSelect" className="me-2 fw-bold text-muted small mb-0 text-nowrap">
            Grado:
          </label>
          <select
            id="gradeSelect"
            className="form-select border-0 bg-transparent py-0 shadow-none fw-bold text-primary"
            value={grade}
            onChange={handleGradeChange}
            style={{ minWidth: "140px", cursor: "pointer" }}
          >
            <option value="firstGrade">Primer Grado</option>
            <option value="secondGrade">Segundo Grado</option>
            <option value="thirdGrade">Tercer Grado</option>
          </select>
        </div>
      </div>

      {/* Main Actions (3 Power Cards) */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-4">
          <Link href="/dashboard/create-activity" className="text-decoration-none">
            <div className="card h-100 border-0 rounded-4 p-4 shadow-sm power-card bg-primary text-white position-relative overflow-hidden">
              <div className="card-body position-relative z-1">
                <FaPlusCircle className="display-4 mb-3 opacity-75" />
                <h3 className="fw-bold mb-2">CREAR DESDE CERO</h3>
                <p className="mb-0 opacity-75 fw-medium">Verdadero/Falso, Quiz o Memoria</p>
              </div>
              <div className="position-absolute rounded-circle bg-white opacity-10" style={{ width: '200px', height: '200px', top: '-50px', right: '-50px' }}></div>
            </div>
          </Link>
        </div>
        
        <div className="col-12 col-md-6 col-lg-4">
          <Link href="/dashboard/templates" className="text-decoration-none">
            <div className="card h-100 border-0 rounded-4 p-4 shadow-sm power-card glass-card">
              <div className="card-body">
                <FaClone className="display-4 mb-3 text-success opacity-75" />
                <h3 className="fw-bold mb-2 text-dark">PLANTILLAS LUDI</h3>
                <p className="mb-0 text-muted fw-medium">Temas prediseñados listos para usar</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="col-12 col-md-6 col-lg-4">
          <Link href="/dashboard/my-activities" className="text-decoration-none">
            <div className="card h-100 border-0 rounded-4 p-4 shadow-sm power-card glass-card">
              <div className="card-body">
                <FaListOl className="display-4 mb-3 text-warning opacity-75" />
                <h3 className="fw-bold mb-2 text-dark">MIS ACTIVIDADES</h3>
                <p className="mb-0 text-muted fw-medium">Gestiona y lanza tus juegos</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="row g-4">
        {/* Drafts Logic (Conditional) */}
        <div className="col-12 col-xl-8">
          {drafts && drafts.length > 0 && (
            <div className="mb-4">
              <h5 className="fw-bold text-muted mb-3 d-flex align-items-center">
                <FaPen className="me-2" /> CONTINUAR TRABAJANDO
              </h5>
              <div className="card border-0 shadow-sm rounded-4 overflow-hidden glass-card">
                <div className="card-body p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between">
                  <div>
                    <span className="badge bg-primary bg-opacity-10 text-primary mb-2 border border-primary border-opacity-25 rounded-pill">
                      {drafts[0].tipoActividad?.nombre || "Actividad"}
                    </span>
                    <h4 className="fw-bold text-dark mb-1">{drafts[0].activity?.activity_name || "Actividad sin título"}</h4>
                    <p className="text-muted small mb-0">Última edición hace poco</p>
                  </div>
                  <div className="mt-3 mt-md-0">
                    <button 
                      className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center transition-all hover-scale"
                      onClick={() => router.push(`/dashboard/create-activity`)}
                    >
                      Retomar <FaArrowRight className="ms-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multimedia Discovery Bar */}
          <div>
            <h5 className="fw-bold text-muted mb-3 d-flex align-items-center">
              MULTIMEDIA POWER-UP
            </h5>
            <div className="card border-0 shadow-sm rounded-4 glass-card">
              <div className="card-body p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row align-items-center justify-content-between">
                  <div className="mb-3 mb-md-0 text-center text-md-start">
                    <h6 className="fw-bold text-dark mb-1">¡Añade contenido rico a tus actividades!</h6>
                    <p className="text-muted small mb-0">Usa nuestros bancos integrados para buscar recursos al instante.</p>
                  </div>
                  <div className="d-flex gap-3 gap-md-4 align-items-center">
                    <div className="text-center icon-hover" title="Audio">
                      <div className="bg-light rounded-circle p-3 mb-1 text-primary shadow-sm border"><FaHeadphones size={24} /></div>
                    </div>
                    <div className="text-center icon-hover" title="Video">
                      <div className="bg-light rounded-circle p-3 mb-1 text-danger shadow-sm border"><FaVideo size={24} /></div>
                    </div>
                    <div className="text-center icon-hover" title="Imágenes (Unsplash)">
                      <div className="bg-light rounded-circle p-3 mb-1 text-info shadow-sm border"><FaImage size={24} /></div>
                    </div>
                    <div className="text-center icon-hover" title="YouTube">
                      <div className="bg-light rounded-circle p-3 mb-1 text-danger shadow-sm border"><FaYoutube size={24} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Quick-Start */}
        <div className="col-12 col-xl-4">
          <h5 className="fw-bold text-muted mb-3 d-flex align-items-center">
            ASISTENTE IA
          </h5>
          <div className="card border-0 shadow-sm rounded-4 text-center p-4 position-relative overflow-hidden h-100" style={{ background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)' }}>
            <div className="position-absolute w-100 h-100 top-0 left-0 bg-white opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 10%)', backgroundSize: '20px 20px' }}></div>
            <div className="card-body position-relative z-1 d-flex flex-column justify-content-center align-items-center">
              <div className="bg-white rounded-circle p-3 mb-3 shadow text-purple" style={{ color: '#9333ea' }}>
                <FaMagic size={32} />
              </div>
              <h4 className="fw-bold text-white mb-2">MAGIA LUDI</h4>
              <p className="text-white opacity-75 mb-4 small px-2">Sube un PDF, ingresa un tema o pega un texto y la IA generará las preguntas por ti.</p>
              <button 
                className="btn btn-light rounded-pill px-4 py-2 fw-bold text-purple shadow-sm d-flex align-items-center transition-all hover-scale"
                style={{ color: '#7e22ce' }}
                onClick={() => alert("¡Magia Ludi estará disponible pronto!")}
              >
                Crear desde Texto/PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.5) !important;
        }
        .power-card {
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }
        .power-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
        }
        .icon-hover {
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .icon-hover:hover {
          transform: translateY(-5px);
        }
        .icon-hover div {
          transition: background-color 0.2s ease;
        }
        .icon-hover:hover div {
          background-color: #fff !important;
        }
        .hover-scale {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-scale:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        }
      `}</style>
    </div>
  );
}