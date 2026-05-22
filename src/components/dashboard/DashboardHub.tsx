"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FaPlusCircle, FaClone, FaListOl, FaHeadphones, FaVideo, FaImage, FaYoutube, FaMagic, FaArrowRight, FaPen } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import designStyles from "@/styles/pages/LudiDesign.module.css";

type GradeKey = 'firstGrade' | 'secondGrade' | 'thirdGrade';

interface DashboardHubProps {
  userName: string;
  drafts: any[];
}

export default function DashboardHub({ userName, drafts }: DashboardHubProps) {
  const { setSelectedGrade } = useAuth();
  const [grade, setGrade] = useState<GradeKey>('firstGrade');
  const router = useRouter();

  const handleNavigation = (path: string) => {
    router.push(path);
  }

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
    <div className="container-fluid py-5 px-md-5" style={{ minHeight: '100vh' }}>
      {/* Sección principal con Padding superior aumentado */}
  <section className={`${designStyles.glassCardDark} mb-5 p-4 p-md-5`}>
    
    {/* Top Bar Context: Centrado vertical y mejor espaciado */}
    <div className=" flex-md-row mb-5 pb-4 border-bottom border-light border-opacity-10">
      <h2 className={designStyles.titleLudi} style={{ marginBottom: 0, flex: 1, textAlign: 'center' }}>
        <span className={designStyles.star}>★</span> ¡Hola, <span style={{ color: '#00d4ff' }}>{getFirstName(userName)}</span>! ¿Qué deseas hacer?
      </h2>
    
    </div>

        <div className={designStyles.actionsContainer}>
          {/* Tarjeta: Crear */}
          <div
            className={`${designStyles.ludiCard} ${designStyles.cardDark}`}
            onClick={() => handleNavigation('/dashboard/create-activity')}
          >
            <div className={designStyles.ludiContent}>
              <span className={designStyles.ludiTag}><FaPlusCircle /> Crear</span>
              <h3>Diseña experiencias educativas</h3>
              <p>Ludi Quiz · Ludi Memory · True or False</p>
              <button className={designStyles.ludiBtnSmall}>Comenzar</button>
            </div>
            <img src="/images/crear.gif" alt="" className={designStyles.ludiGif} />
          </div>

          {/* Tarjeta: Plantillas */}
          <div
            className={`${designStyles.ludiCard} ${designStyles.cardPurple}`}
            onClick={() => handleNavigation('/dashboard/templates')}
          >
            <div className={designStyles.ludiContent}>
              <span className={designStyles.ludiTag}><FaClone /> Explorar</span>
              <h3>Plantillas Ludi</h3>
              <p>Explora actividades lúdicas listas para usar</p>
              <button className={designStyles.ludiBtnSmall}>Ver plantillas</button>
            </div>
            <img src="/images/plantillas.gif" alt="" className={designStyles.ludiGif} />
          </div>

          {/* Tarjeta: Gestionar */}
          <div
            className={`${designStyles.ludiCard} ${designStyles.cardBlue}`}
            onClick={() => handleNavigation('/dashboard/my-activities')}
          >
            <div className={designStyles.ludiContent}>
              <span className={designStyles.ludiTag}><FaListOl /> Gestionar</span>
              <h3>Mis actividades</h3>
              <p>Guarda, organiza y reutiliza tus actividades cuando quieras</p>
              <button className={designStyles.ludiBtnSmall}>Revisar</button>
            </div>
            <img src="/images/actividades.gif" alt="" className={designStyles.ludiGif} />
          </div>
        </div>
      </section>

      <div className="row g-4">
        {/* Drafts Logic (Conditional) */}
        <div className="col-12 col-xl-8">
          {drafts && drafts.length > 0 && (
            <div className="mb-4">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                <FaPen className="me-2" /> CONTINUAR TRABAJANDO
              </h5>
              <div className={`${designStyles.glassCardDark} p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between`}>
                <div>
                  <span className="badge bg-primary bg-opacity-25 text-white mb-2 border border-primary border-opacity-50 rounded-pill">
                    {drafts[0].tipoActividad?.nombre || "Actividad"}
                  </span>
                  <h4 className="fw-bold text-white mb-1">{drafts[0].activity?.activity_name || "Actividad sin título"}</h4>
                  <p className="text-white opacity-75 small mb-0">Última edición hace poco</p>
                </div>
                <div className="mt-3 mt-md-0">
                  <button
                    className={designStyles.btnLudi}
                    onClick={() => router.push(`/dashboard/create-activity`)}
                  >
                    Retomar <FaArrowRight className="ms-2" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}