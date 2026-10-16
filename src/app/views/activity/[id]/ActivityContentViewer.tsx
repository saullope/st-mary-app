"use client";

import { useEffect, useState, useRef } from "react";
import { toFormQuestionType } from "@/features/form/formQuestions";
import styles from "@/styles/pages/view-activity.module.css";
import MultimediaDisplay from "@/components/activity/MultimediaDisplay";
import { FaCheck, FaTimes, FaDownload } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useTranslations } from "next-intl";

export default function ActivityContentViewer({ activity }: { activity: any }) {
  const [activeQuestion, setActiveQuestion] = useState<number>(0);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const t = useTranslations("ActivityContent");
  const tCommon = useTranslations("Common");
  const tTypes = useTranslations("Editor.form.types");
  const typeName = tCommon(`activityTypes.${activity.tipoActividadId as 1 | 2 | 3 | 4 | 5}`);
  const gradeName = activity.gradoId ? tCommon(`grades.${activity.gradoId as 1 | 2 | 3}`) : tCommon("noGrade");
  // Verdadero/Falso se guardan en español: se muestran por posición en el idioma activo.
  const trueFalseLabel = (indice: number) => (indice === 1 ? t("true") : t("false"));

  const isMemory = activity.tipoActividadId === 3;

  useEffect(() => {
    if (isMemory) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveQuestion(index);
          }
        });
      },
      { rootMargin: "-20% 0px -80% 0px" }
    );

    questionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isMemory]);

  const scrollToQuestion = (index: number) => {
    questionRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(t("pdfActivity", { name: activity.activity.activity_name }), 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(t("pdfType", { type: typeName }), 14, 28);
    doc.text(t("pdfGrade", { grade: gradeName }), 14, 34);

    doc.setTextColor(0);

    if (isMemory) {
      doc.setFontSize(14);
      doc.text(t("pdfPairs"), 14, 45);

      const pairsData = activity.memoriaParejas.map((p: any, idx: number) => [
        t("pair", { number: idx + 1 }),
        p.etiqueta || t("noText")
      ]);

      autoTable(doc, {
        startY: 50,
        head: [[t("pdfId"), t("pdfContent")]],
        body: pairsData,
        theme: 'striped',
        headStyles: { fillColor: [106, 75, 255] }
      });
    } else {
      doc.setFontSize(14);
      doc.text(t("pdfAnswers"), 14, 45);

      // Las diapositivas no tienen respuesta correcta: no van en la hoja de respuestas.
      const qData = activity.preguntas.filter((q: any) => !q.esContenido).map((q: any, idx: number) => {
        const correctOptions = q.opciones.filter((o: any) => o.esCorrecta || o.es_correcta);
        let correctText = t("notApplicable");

        if (q.tipoPregunta === "long") {
            correctText = t("openAnswer");
        } else if (correctOptions.length > 0) {
            correctText = correctOptions
              .map((o: any) => activity.tipoActividadId === 2 ? trueFalseLabel(o.indice) : (o.texto || t("correctOption")))
              .join(", ");
        }

        return [
          idx + 1,
          q.enunciado,
          correctText
        ];
      });

      autoTable(doc, {
        startY: 50,
        head: [['#', t("pdfQuestion"), t("pdfCorrect")]],
        body: qData,
        theme: 'striped',
        headStyles: { fillColor: [106, 75, 255] }
      });
    }

    doc.save(`Actividad_${activity.activity.activity_name.replace(/\s+/g, '_')}.pdf`);
  };

  // Numeración solo de preguntas reales; las diapositivas se rotulan aparte.
  const questionLabels: string[] = [];
  let questionCounter = 0;
  const isLesson = activity.tipoActividadId === 4;
  (activity.preguntas || []).forEach((p: any, idx: number) => {
    questionLabels.push(isLesson ? t("block", { number: idx + 1 }) : p.esContenido ? t("slide") : t("question", { number: ++questionCounter }));
  });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{t("title")}</h2>
        <button
            className="btn shadow-sm d-flex align-items-center"
            style={{ background: '#1D153A', color: 'white', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={handleExportPDF}
        >
            <FaDownload className="me-2" style={{ color: '#00d4ff' }} aria-hidden="true" /> {t("exportPdf")}
        </button>
      </div>

      {isMemory ? (
        <div className={styles.memoryGrid}>
          {activity.memoriaParejas.map((pareja: any, idx: number) => (
            <div key={Number(pareja.id)} className={styles.memoryPair}>
              <h5 className="mb-3 text-muted" style={{ fontSize: 'var(--text-section)' }}>{t("pair", { number: idx + 1 })}</h5>
              {pareja.tarjetas[0]?.recurso && (
                <MultimediaDisplay
                  url={pareja.tarjetas[0].recurso.url}
                  type="IMAGEN"
                  width={150}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          <div className="col-12 col-lg-9">
            {activity.preguntas.map((pregunta: any, idx: number) => (
              <div
                key={Number(pregunta.id)}
                className={styles.questionCard}
                ref={(el) => { questionRefs.current[idx] = el; }}
                data-index={idx}
              >
                <div className={styles.questionHeader}>
                  <span className={styles.questionNumber}>
                    {questionLabels[idx]}
                    {pregunta.tipoPregunta && <span className="ms-2 fw-normal" style={{ color: '#6a4bff' }}>· {tTypes(toFormQuestionType(pregunta.tipoPregunta))}</span>}
                  </span>
                  {!pregunta.esContenido && (
                    <span className="badge" style={{ background: '#1D153A', color: 'white' }}>
                      {t("points", { points: pregunta.puntaje || activity.config?.puntajeBase || 0 })}
                    </span>
                  )}
                </div>
                <div className={styles.questionBody}>
                  <h3 className={styles.questionText}>{pregunta.enunciado}</h3>
                  {pregunta.contenidoTexto && (
                    <p className="mb-4" style={{ whiteSpace: 'pre-line', lineHeight: 1.7, color: '#2d2640' }}>{pregunta.contenidoTexto}</p>
                  )}

                  {/* Media de la pregunta */}
                  {pregunta.preguntaRecursos && pregunta.preguntaRecursos.length > 0 && (
                    <div className="mb-4 text-center">
                      <MultimediaDisplay
                        url={pregunta.preguntaRecursos[0].recurso.url}
                        type={pregunta.preguntaRecursos[0].recurso.tipo?.nombre || "IMAGEN"}
                      />
                    </div>
                  )}

                  {pregunta.tipoPregunta === "long" && (
                    <p className="mb-0 fst-italic" style={{ color: '#4a4266' }}>
                      {t("longHint")}
                    </p>
                  )}

                  {/* Opciones */}
                  <div className={styles.optionsGrid}>
                    {pregunta.opciones.map((opcion: any) => {
                      const isTrueFalse = activity.tipoActividadId === 2;
                      const displayContent = isTrueFalse ? trueFalseLabel(opcion.indice) : (opcion.texto || trueFalseLabel(opcion.indice));

                      return (
                        <div
                          key={Number(opcion.id)}
                          className={`${styles.optionCard} ${(opcion.esCorrecta || opcion.es_correcta) ? styles.optionCorrect : styles.optionIncorrect}`}
                        >
                          {opcion.opcionRecursos?.[0]?.recurso?.url && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={opcion.opcionRecursos[0].recurso.url}
                              alt=""
                              className="d-block mx-auto mb-2"
                              style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }}
                            />
                          )}
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            {((opcion.esCorrecta || opcion.es_correcta)) ? <FaCheck style={{ color: '#198754' }} aria-label={t("correct")} role="img" /> : <FaTimes style={{ color: '#dc3545' }} aria-label={t("incorrect")} role="img" />}
                            <span style={{ fontWeight: '600' }}>{displayContent}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-12 col-lg-3 d-none d-lg-block">
            <div className={styles.scrollSpySidebar}>
              <h6 className="fw-bold mb-3 text-uppercase" style={{ color: '#1D153A', fontSize: 'var(--text-meta)' }}>{t("index")}</h6>
              <ul className={styles.scrollSpyList}>
                {activity.preguntas.map((pregunta: any, idx: number) => (
                  <li
                    key={idx}
                    className={`${styles.scrollSpyItem} ${activeQuestion === idx ? styles.scrollSpyItemActive : ''}`}
                    onClick={() => scrollToQuestion(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        scrollToQuestion(idx);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-current={activeQuestion === idx ? 'true' : undefined}
                  >
                    <span className="text-truncate d-inline-block w-100" title={pregunta.enunciado}>
                        {questionLabels[idx]}{pregunta.enunciado ? `: ${pregunta.enunciado}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}