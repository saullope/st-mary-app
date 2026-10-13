"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import { useTranslations } from "next-intl";
import { useSelectedGrade } from "@/hooks/useSelectedGrade";
import { isFormAvailableForGrade } from "@/features/form/formQuestions";

// Custom Toggle to fix React 19 ref warning
const CustomToggle = React.forwardRef<HTMLDivElement, any>(
  ({ children, onClick, className }, ref) => (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      className={className}
      style={{ cursor: "pointer" }}
    >
      {children}
    </div>
  )
);
CustomToggle.displayName = 'CustomToggle';

export default function NewActivityButton() {
  const t = useTranslations("myActivitiesContent");
  const selectedGrade = useSelectedGrade();

  return (
    <Dropdown>
      <Dropdown.Toggle 
        as={CustomToggle} 
        className={designStyles.btnLudi}
        id="new-activity-dropdown"
      >
        <FaPlus /> {t("createActivityButton")}
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border-0 rounded-3 mt-2" style={{ overflow: "hidden" }}>
        <Dropdown.Item as="button" onClick={() => window.open('/create/ludiquiz', '_blank', 'noopener,noreferrer')} className="py-2 px-3 fw-medium text-dark">
          Ludi Quiz
        </Dropdown.Item>
        
        <Dropdown.Item as="button" onClick={() => window.open('/create/trueorfalse', '_blank', 'noopener,noreferrer')} className="py-2 px-3 fw-medium text-dark">
          Verdadero o Falso
        </Dropdown.Item>
        
        <Dropdown.Item as="button" onClick={() => window.open('/create/ludimemory', '_blank', 'noopener,noreferrer')} className="py-2 px-3 fw-medium text-dark">
          Ludi Memory
        </Dropdown.Item>

        <Dropdown.Item as="button" onClick={() => window.open('/create/ludileccion', '_blank', 'noopener,noreferrer')} className="py-2 px-3 fw-medium text-dark">
          Ludi Lección
        </Dropdown.Item>

        {isFormAvailableForGrade(selectedGrade) && (
          <Dropdown.Item as="button" onClick={() => window.open('/create/ludiform', '_blank', 'noopener,noreferrer')} className="py-2 px-3 fw-medium text-dark">
            Ludi Form
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}
