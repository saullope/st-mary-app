"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, ChangeEvent, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "@/components/dashboard/ActivityFilter.module.css";
import { useTranslations } from "next-intl";

export default function AdminReportFilter() {
  const router = useRouter();
  const t = useTranslations("AdminFilter");
  const searchParams = useSearchParams();
  
  const initialSearch = searchParams.get("search") || "";
  const initialGrade = searchParams.get("grade") || "";
  const initialDate = searchParams.get("dateRange") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");

    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      const currentUrlSearch = searchParams.get("search") || "";
      if (searchTerm !== currentUrlSearch) {
        updateParams("search", searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, updateParams]);

  const handleGradeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateParams("grade", e.target.value);
  };

  const handleDateChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateParams("dateRange", e.target.value);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className={styles.filterWrapper}>
      {/* Search Input */}
      <div className={styles.searchContainer}>
        <FaSearch className={styles.searchIcon} />
        <input 
          type="text" 
          className={styles.searchInput}
          placeholder={t("searchPlaceholder")}
          aria-label={t("searchPlaceholder")}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Grade Filter */}
      <div className={styles.selectContainer}>
        <label htmlFor="gradeFilter" className={styles.selectLabel}>
          {t("grade")}
        </label>
        <select
          id="gradeFilter"
          className={styles.typeSelect}
          value={initialGrade}
          onChange={handleGradeChange}
        >
          <option value="">{t("allGrades")}</option>
          <option value="1">{t("grade1")}</option>
          <option value="2">{t("grade2")}</option>
          <option value="3">{t("grade3")}</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className={styles.selectContainer}>
        <label htmlFor="dateFilter" className={styles.selectLabel}>
          {t("date")}
        </label>
        <select
          id="dateFilter"
          className={styles.typeSelect}
          value={initialDate}
          onChange={handleDateChange}
        >
          <option value="">{t("allTime")}</option>
          <option value="7">{t("last7")}</option>
          <option value="30">{t("last30")}</option>
        </select>
      </div>
    </div>
  );
}