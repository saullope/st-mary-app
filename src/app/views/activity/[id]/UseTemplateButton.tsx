"use client";

import { useState } from "react";
import { FaClone } from "react-icons/fa6";
import { saveTemplateCopy } from "@/app/dashboard/templates/actions";
import { notify } from "@/components/ui";
import { getEditorRoute, openPendingEditorTab } from "@/lib/editorTab";
import { useTranslations } from "next-intl";

interface UseTemplateButtonProps {
  templateActivityId: number;
  tipoActividadId: number;
}

export default function UseTemplateButton({ templateActivityId, tipoActividadId }: UseTemplateButtonProps) {
  const t = useTranslations("Templates");
  const [cloning, setCloning] = useState(false);

  const handleClone = async () => {
    const editorTab = openPendingEditorTab();
    setCloning(true);
    try {
      const result = await saveTemplateCopy(templateActivityId);
      if (result.success) {
        editorTab.navigate(getEditorRoute(tipoActividadId, result.copyId));
        setCloning(false);
      } else {
        editorTab.cancel();
        notify.error(t("cloneFailed"), result.error);
        setCloning(false);
      }
    } catch (error) {
      console.error(error);
      editorTab.cancel();
      notify.error(t("unexpected"));
      setCloning(false);
    }
  };

  return (
    <button
      onClick={handleClone}
      disabled={cloning}
      className="btn btn-primary d-flex align-items-center gap-2 shadow-sm"
      style={{
        borderRadius: '12px',
        padding: '8px 16px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease'
      }}
    >
      {cloning ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          {t("preparing")}
        </>
      ) : (
        <>
          <FaClone aria-hidden="true" />
          {t("use")}
        </>
      )}
    </button>
  );
}
