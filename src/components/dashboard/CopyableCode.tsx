"use client";

import { useState } from "react";
import { FaCopy, FaCheck } from "react-icons/fa";

interface CopyableCodeProps {
  code: string | number;
}

export default function CopyableCode({ code }: CopyableCodeProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(code));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div
      className="d-flex align-items-center position-relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ cursor: "pointer", width: "fit-content" }}
      onClick={handleCopy}
      title="Clic para copiar código"
    >
      <span className="fw-bold text-muted me-2">#{code}</span>
      
      {/* Icono que aparece al hover o cuando está copiado */}
      <span
        style={{
          opacity: isHovered || copied ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
          color: copied ? "#198754" : "#6c757d", // Green if copied, gray if hover
        }}
      >
        {copied ? <FaCheck size={14} /> : <FaCopy size={14} />}
      </span>

      {/* Tooltip flotante temporal */}
      {copied && (
        <span
          className="position-absolute bg-dark text-white text-xs px-2 py-1 rounded"
          style={{
            top: "-30px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.75rem",
            whiteSpace: "nowrap",
            zIndex: 10
          }}
        >
          ¡Copiado!
        </span>
      )}
    </div>
  );
}
