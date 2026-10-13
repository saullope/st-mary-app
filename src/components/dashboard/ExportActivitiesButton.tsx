"use client";

import { FaFileExcel } from "react-icons/fa";
import * as XLSX from "xlsx";
import designStyles from "@/styles/pages/LudiDesign.module.css";
import { useTranslations } from "next-intl";

interface ExportActivitiesButtonProps {
  activities: any[];
}

export default function ExportActivitiesButton({ activities }: ExportActivitiesButtonProps) {
const t = useTranslations("myActivitiesContent");
  const tExport = useTranslations("ExportActivities");
  const tCommon = useTranslations("Common");

  const handleExport = () => {
    // 1. Format Data
    const dataToExport = activities.map(act => ({
      [tExport("code")]: act.activityId,
      [tExport("name")]: act.activity.activity_name,
      [tExport("type")]: tCommon(`activityTypes.${act.tipoActividadId as 1 | 2 | 3 | 4 | 5}`),
      [tExport("grade")]: act.gradoId ? tCommon(`grades.${act.gradoId as 1 | 2 | 3}`) : tCommon("noGrade"),
      [tExport("creator")]: act.user.nombre,
      [tExport("creatorEmail")]: act.user.email,
      [tExport("createdAt")]: new Date(act.activity.created_date).toLocaleDateString()
    }));

    // 2. Create Worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // 3. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, t('titlePage'));

    // 4. Write File
    XLSX.writeFile(workbook, `${tExport("fileName")}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <button
      onClick={handleExport}
      className={designStyles.btnLudiSuccess}
      title={tExport("button")}
      aria-label={tExport("button")}
      disabled={activities.length === 0}
      style={{
        backgroundColor: '#10b981', // Verde esmeralda (combina con tonos oscuros y lavanda)
        color: 'white',
        borderColor: '#10b981',
        opacity: activities.length === 0 ? 0.5 : 1
      }}
    >
      <FaFileExcel />
      {t("exportToExcel")}
    </button>
  );
}
