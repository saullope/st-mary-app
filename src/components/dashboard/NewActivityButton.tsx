"use client";

import Link from "next/link";
import { FaPlus } from "react-icons/fa";
import { Dropdown } from "react-bootstrap";
import styles from "@/styles/pages/my-activities.module.css";

export default function NewActivityButton() {
  return (
    <Dropdown>
      <Dropdown.Toggle 
        as="div" 
        className={styles.primaryButton}
        style={{ cursor: "pointer" }}
        id="new-activity-dropdown"
      >
        <FaPlus /> Nueva Actividad
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border-0 rounded-3 mt-2" style={{ overflow: "hidden" }}>
        <Dropdown.Item as={Link} href="/create/ludiquiz" className="py-2 px-3 fw-medium text-dark" target="_blank" rel="noopener noreferrer">
          Ludi Quiz
        </Dropdown.Item>
        
        <Dropdown.Item as={Link} href="/create/trueorfalse" className="py-2 px-3 fw-medium text-dark" target="_blank" rel="noopener noreferrer">
          Verdadero o Falso
        </Dropdown.Item>
        
        <Dropdown.Item as={Link} href="/create/ludimemory" className="py-2 px-3 fw-medium text-dark" >
          Ludi Memory
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}
