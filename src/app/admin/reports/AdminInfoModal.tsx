"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { IconType } from "react-icons";
import { FaInfoCircle, FaTimes, FaStar, FaSmile, FaExclamationTriangle, FaBullseye, FaLayerGroup } from "react-icons/fa";

const SECTIONS: { key: string; Icon: IconType; color: string }[] = [
  { key: "teacher", Icon: FaStar, color: "#e5b869" },
  { key: "objective", Icon: FaBullseye, color: "#6a4bff" },
  { key: "students", Icon: FaSmile, color: "#198754" },
  { key: "consolidated", Icon: FaLayerGroup, color: "#00a3c4" },
  { key: "risk", Icon: FaExclamationTriangle, color: "#dc3545" },
];

/** Guía para interpretar las métricas del seguimiento de actividades. */
export default function AdminInfoModal() {
  const t = useTranslations("AdminGuide");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="btn d-flex align-items-center justify-content-center shadow-sm"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #00d4ff 0%, #00b4d8 100%)",
          color: "white",
          border: "none",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 10px rgba(0, 212, 255, 0.3)",
        }}
        title={t("open")}
        aria-label={t("open")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <FaInfoCircle size={18} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(3px)", zIndex: 1050 }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="card shadow-lg border-0"
            style={{ width: "90%", maxWidth: "520px", maxHeight: "calc(100vh - 2rem)", overflowY: "auto", borderRadius: "1.5rem", background: "#E8E5F7", border: "1px solid rgba(29,21,58,0.1)" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-guide-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="card-header border-0 d-flex justify-content-between align-items-center pt-4 px-4" style={{ background: "transparent" }}>
              <h2 id="admin-guide-title" className="h5 fw-bold mb-0" style={{ color: "#1D153A" }}>
                <FaInfoCircle className="me-2" style={{ color: "#6a4bff" }} aria-hidden="true" />
                {t("title")}
              </h2>
              <button type="button" className="btn btn-sm shadow-none" onClick={() => setIsOpen(false)} aria-label={t("close")}>
                <FaTimes size={20} style={{ color: "#1D153A" }} aria-hidden="true" />
              </button>
            </div>
            <div className="card-body px-4 pb-4">
              <p className="small mb-4" style={{ color: "#4a4266" }}>{t("intro")}</p>
              {SECTIONS.map(({ key, Icon, color }) => (
                <div key={key} className="mb-3 p-3 rounded-4" style={{ background: "rgba(29,21,58,0.03)", border: "1px solid rgba(29,21,58,0.05)" }}>
                  <h3 className="h6 fw-bold d-flex align-items-center" style={{ color: "#1D153A" }}>
                    <Icon className="me-2" style={{ color }} aria-hidden="true" /> {t(`${key}.title`)}
                  </h3>
                  <p className="small mb-0" style={{ color: "#4a4266" }}>{t(`${key}.body`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
