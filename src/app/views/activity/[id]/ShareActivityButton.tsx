"use client";

import { useState } from "react";
import { FaShareNodes, FaCheck } from "react-icons/fa6";
import { useTranslations } from "next-intl";

export function ShareActivityButton({ activityId }: { activityId: number }) {
  const t = useTranslations("ActivityView");
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
      title={t("copyLink")}
      aria-label={copied ? t("linkCopied") : t("copyLink")}
    >
      {copied ? <FaCheck aria-hidden="true" /> : <FaShareNodes aria-hidden="true" />}
    </button>
  );
}
