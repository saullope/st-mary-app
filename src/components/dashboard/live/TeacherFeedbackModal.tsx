"use client";

import { useState } from "react";
import { Star, ThumbsUp, ThumbsDown, Smile, Meh, Frown, X } from "lucide-react";
import { Modal, Button } from "react-bootstrap";

interface FeedbackModalProps {
  show: boolean;
  onClose: (skip: boolean) => void;
  onSubmit: (feedback: any) => void;
  isTemplate: boolean;
}

export default function TeacherFeedbackModal({ show, onClose, onSubmit, isTemplate }: FeedbackModalProps) {
  const [utility, setUtility] = useState<number>(0);
  const [templateDifficulty, setTemplateDifficulty] = useState<string>("");
  const [classEngagement, setClassEngagement] = useState<number>(0);
  const [objectiveMet, setObjectiveMet] = useState<boolean | null>(null);

  const handleSubmit = () => {
    onSubmit({
      teacherRating: utility,
      templateDifficulty: isTemplate ? templateDifficulty : null,
      classEngagement: !isTemplate ? classEngagement : null,
      objectiveMet: !isTemplate ? objectiveMet : null,
    });
  };

  const isSubmitDisabled = utility === 0 || (isTemplate && !templateDifficulty) || (!isTemplate && (classEngagement === 0 || objectiveMet === null));

  return (
    <Modal show={show} onHide={() => onClose(true)} centered backdrop="static" keyboard={false}>
      <Modal.Header className="border-0 pb-0">
        <h4 className="fw-bold text-dark">Retroalimentación de la Sesión</h4>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Common Question: Pedagogical Utility */}
        <div className="mb-4">
          <p className="fw-bold text-muted mb-2">1. Utilidad pedagógica general</p>
          <div className="d-flex justify-content-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={36}
                className="cursor-pointer"
                fill={star <= utility ? "#ffc107" : "none"}
                stroke={star <= utility ? "#ffc107" : "#cbd5e1"}
                onClick={() => setUtility(star)}
              />
            ))}
          </div>
        </div>

        {/* Conditional Questions */}
        {isTemplate ? (
          // Template-specific question
          <div className="mb-4">
            <p className="fw-bold text-muted mb-2">2. Dificultad de la plantilla</p>
            <div className="d-flex justify-content-center gap-3">
              <Button variant={templateDifficulty === 'Fácil' ? 'success' : 'outline-success'} onClick={() => setTemplateDifficulty('Fácil')}>Fácil</Button>
              <Button variant={templateDifficulty === 'Medio' ? 'warning' : 'outline-warning'} onClick={() => setTemplateDifficulty('Medio')}>Medio</Button>
              <Button variant={templateDifficulty === 'Difícil' ? 'danger' : 'outline-danger'} onClick={() => setTemplateDifficulty('Difícil')}>Difícil</Button>
            </div>
          </div>
        ) : (
          // User-created activity questions
          <>
            <div className="mb-4">
              <p className="fw-bold text-muted mb-2">2. Nivel de compromiso de la clase</p>
              <div className="d-flex justify-content-center gap-3">
                  {[ {val: 1, Icon: Frown}, {val: 3, Icon: Meh}, {val: 5, Icon: Smile} ].map(({val, Icon}) => (
                      <Icon key={val} size={40} className="cursor-pointer" strokeWidth={val === classEngagement ? 2.5 : 1.5} color={val === classEngagement ? '#0d6efd' : '#6c757d'} onClick={() => setClassEngagement(val)} />
                  ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="fw-bold text-muted mb-2">3. ¿Se cumplió el objetivo de aprendizaje?</p>
              <div className="d-flex justify-content-center gap-3">
                <Button variant={objectiveMet === true ? 'primary' : 'outline-primary'} className="d-flex align-items-center gap-2" onClick={() => setObjectiveMet(true)}><ThumbsUp size={20}/> Sí</Button>
                <Button variant={objectiveMet === false ? 'secondary' : 'outline-secondary'} className="d-flex align-items-center gap-2" onClick={() => setObjectiveMet(false)}><ThumbsDown size={20}/> No</Button>
              </div>
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 d-flex justify-content-between">
        <Button variant="link" className="text-muted" onClick={() => onClose(true)}>Saltar Encuesta</Button>
        <Button variant="primary" disabled={isSubmitDisabled} onClick={handleSubmit}>Enviar Feedback</Button>
      </Modal.Footer>
    </Modal>
  );
}