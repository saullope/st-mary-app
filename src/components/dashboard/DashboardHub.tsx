"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { FaPlusCircle, FaClone, FaListOl, FaHeadphones, FaVideo, FaImage, FaYoutube, FaMagic, FaArrowRight, FaPen } from "react-icons/fa";
import Link from "next/link";
import { useRouter } from "next/navigation";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import DashboardTour from "./DashboardTour";
import { useTranslations } from "next-intl";

type GradeKey = 'firstGrade' | 'secondGrade' | 'thirdGrade';

interface DashboardHubProps {
  userName: string;
  drafts: any[];
}

export default function DashboardHub({ userName, drafts }: DashboardHubProps) {
  const { setSelectedGrade } = useAuth();
  const [grade, setGrade] = useState<GradeKey>('firstGrade');
  const router = useRouter();
  const t = useTranslations('textDashboard');
  const tCommon = useTranslations('Common');

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
      <DashboardTour />
      {/* Sección principal */}
      <section className={`${designStyles.glassCardDark} mb-5 p-4 p-md-5`}>

        <div className="flex-md-row mb-4 pb-3 border-bottom border-light border-opacity-10">
          <h2 id="dashboard-user-greeting" className={designStyles.titleLudi} style={{ marginBottom: 0 }}>
            <span className={designStyles.star}>★</span> {t('whatYouCanDo')}
          </h2>
        </div>

        <div className={designStyles.actionsGrid}>
          {/* Tarjeta 1: #181130 */}
          <div
            id="card-create-activity"
            className={`${designStyles.ludiCard} ${designStyles.cardDark}`}
            onClick={() => handleNavigation('/dashboard/create-activity')}
          >
            <div className={designStyles.ludiContent}>
              <span className={designStyles.ludiTag}><FaPlusCircle /> {t('create')}</span>
              <h3>{t('exprienceDescription')}</h3>
              <p>{[1, 3, 2].map((id) => tCommon(`activityTypes.${id as 1 | 2 | 3}`)).join(' · ')}</p>
              <button className={designStyles.ludiBtnSmall}>{t('start')}</button>
            </div>
            <img src="/images/crear.gif" alt="" className={designStyles.ludiGifLarge} />
          </div>

          {/* Tarjeta 2: #6A42E1 */}
          <div
            id="card-templates"
            className={`${designStyles.ludiCard} ${designStyles.cardPurple}`}
            onClick={() => handleNavigation('/dashboard/templates')}
          >
            <div className={designStyles.ludiContent}>
              <span className={designStyles.ludiTag}><FaClone /> {t('explore')}</span>
              <h3>{t('ludiTemplates')}</h3>
              <p>{t('ludiTemplatesText')}</p>
              <button className={designStyles.ludiBtnSmall}>{t('seeTemplates')}</button>
            </div>
            <img src="/images/plantillas.gif" alt="" className={designStyles.ludiGifLarge} />
          </div>

          {/* Tarjeta 3: #4569D5 */}
          <div
            id="card-my-activities"
            className={`${designStyles.ludiCard} ${designStyles.cardBlue}`}
            onClick={() => handleNavigation('/dashboard/my-activities')}
          >
            <div className={designStyles.ludiContent}>
              <span className={designStyles.ludiTag}><FaListOl /> {t('manage')}</span>
              <h3>{t('myActivities')}</h3>
              <p>{t('myActivitiesDescription')}</p>
              <button className={designStyles.ludiBtnSmall}>{t('check')}</button>
            </div>
            <img src="/images/actividades.gif" alt="" className={designStyles.ludiGifLarge} />
          </div>
        </div>
      </section>

      <div id="dashboard-drafts-section" className="row g-4">
        {/* Drafts Logic (Conditional) */}
        <div className="col-12 col-xl-8">
          {drafts && drafts.length > 0 ? (
            <div className="mb-4">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontSize: 'var(--text-section)' }}>
                <FaPen className="me-2" /> {t('continueJob')}
              </h5>
              <div className={`${designStyles.glassCardDark} p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between`}>
                <div>
                  <span className="badge bg-primary bg-opacity-25 text-white mb-2 border border-primary border-opacity-50 rounded-pill">
                    {drafts[0].tipoActividad?.nombre || "Actividad"}
                  </span>
                  <h4 className="fw-bold text-white mb-1" style={{ fontSize: 'var(--text-card)' }}>{drafts[0].activity?.activity_name || t('untitledActivity')}</h4>
                  <p className="text-white opacity-75 small mb-0">{t('lastEdition')}</p>
                </div>
                <div className="mt-3 mt-md-0">
                  <button
                    className={designStyles.btnLudi}
                    onClick={() => {
                      const url = `/create/${drafts[0].tipo_activity_id}?id=${drafts[0].activity_id}`;
                      window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                  >
                    {t('resume')} <FaArrowRight className="ms-2" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <h5 className="fw-bold text-white mb-3 d-flex align-items-center" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)', fontSize: 'var(--text-section)' }}>
                <FaPen className="me-2" /> {t('continueJob')}
              </h5>
              <div className={`${designStyles.glassCardDark} p-4 text-center`}>
                <p className="text-white opacity-75 mb-0 small">{t('noDrafts')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}