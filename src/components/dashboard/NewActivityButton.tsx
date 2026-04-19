"use client";

import React from "react";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import styles from "@/styles/pages/my-activities.module.css";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const t = useTranslations("myActivitiesContent");

  return (
    <Dropdown>
      <Dropdown.Toggle 
        as={CustomToggle} 
        className={styles.primaryButton}
        id="new-activity-dropdown"
      >
        <FaPlus /> {t("createActivityButton")}
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border-0 rounded-3 mt-2" style={{ overflow: "hidden" }}>
        <Dropdown.Item as="button" onClick={() => window.open('/create/ludiquiz', '_blank')} className="py-2 px-3 fw-medium text-dark">
          Ludi Quiz
        </Dropdown.Item>
        
        <Dropdown.Item as="button" onClick={() => window.open('/create/trueorfalse', '_blank')} className="py-2 px-3 fw-medium text-dark">
          Verdadero o Falso
        </Dropdown.Item>
        
        <Dropdown.Item as="button" onClick={() => router.push('/create/ludimemory')} className="py-2 px-3 fw-medium text-dark">
          Ludi Memory
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
