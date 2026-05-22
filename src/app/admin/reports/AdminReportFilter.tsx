"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, ChangeEvent, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "@/components/dashboard/ActivityFilter.module.css";

export default function AdminReportFilter() {
  const router = useRouter();
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
          placeholder="Buscar por actividad o educador..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Grade Filter */}
      <div className={styles.selectContainer}>
        <label htmlFor="gradeFilter" className={styles.selectLabel}>
          Grado:
        </label>
        <select
          id="gradeFilter"
          className={styles.typeSelect}
          value={initialGrade}
          onChange={handleGradeChange}
        >
          <option value="">Todos</option>
          <option value="1">1º Grado</option>
          <option value="2">2º Grado</option>
          <option value="3">3º Grado</option>
        </select>
      </div>

      {/* Date Filter */}
      <div className={styles.selectContainer}>
        <label htmlFor="dateFilter" className={styles.selectLabel}>
          Fecha:
        </label>
        <select
          id="dateFilter"
          className={styles.typeSelect}
          value={initialDate}
          onChange={handleDateChange}
        >
          <option value="">Todo el Histórico</option>
          <option value="7">Últimos 7 días</option>
          <option value="30">Últimos 30 días</option>
        </select>
      </div>
    </div>
  );
}