"use client";

import { useState } from "react";
import { FaShareNodes, FaCheck } from "react-icons/fa6";

export function ShareActivityButton({ activityId }: { activityId: number }) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/views/activity/${activityId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="btn btn-outline-secondary d-flex align-items-center gap-2 shadow-sm"
      style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold' }}
      title="Copiar enlace público"
    >
      {copied ? <FaCheck /> : <FaShareNodes />}
    </button>
  );
}
