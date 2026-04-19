"use client";

import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import styles from "@/styles/pages/my-activities.module.css";
import { useTranslations } from "next-intl";

interface ExportActivitiesButtonProps {
  activities: any[];
}

export default function ExportActivitiesButton({ activities }: ExportActivitiesButtonProps) {
const t = useTranslations("myActivitiesContent");

  const handleExport = () => {
    // 1. Format Data
    const dataToExport = activities.map(act => ({
      "Código": act.activityId,
      "Nombre": act.activity.activity_name,
      "Tipo": act.tipoActividad.nombre,
      "Grado": act.grado?.grade_type_name || "N/A",
      "Creador": act.user.nombre,
      "Email Creador": act.user.email,
      "Fecha Creación": new Date(act.activity.created_date).toLocaleDateString()
    }));

    // 2. Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('titlePage'));

    // 4. Write File
    XLSX.writeFile(workbook, `Mis_Actividades_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className={styles.secondaryButton}
      title="Exportar a Excel"
      disabled={activities.length === 0}
    >
      <FaFileExcel className="text-success" />
      {t("exportToExcel")}
    </button>
  );
}
