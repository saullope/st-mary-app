"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, ChangeEvent, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import styles from "./ActivityFilter.module.css";

export default function ReportFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialStatus = searchParams.get("status") || "";
  const initialSearch = searchParams.get("search") || "";

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

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateParams("status", e.target.value);
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
          placeholder="Buscar actividad por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Status Filter */}
      <div className={styles.selectContainer}>
        <label htmlFor="reportStatus" className={styles.selectLabel}>
          Estado:
        </label>
        <select
          id="reportStatus"
          className={styles.typeSelect}
          value={initialStatus}
          onChange={handleFilterChange}
        >
          <option value="">Todos</option>
          <option value="ESPERANDO">Esperando / Lobby</option>
          <option value="ACTIVA">En Curso</option>
          <option value="FINALIZADA">Finalizada</option>
        </select>
      </div>
    </div>
  );
}