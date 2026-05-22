"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, ChangeEvent, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useTranslations } from "next-intl";
import styles from "./ActivityFilter.module.css";

interface ActivityType {
  id: number;
  nombre: string;
}

interface ActivityFilterProps {
  types: ActivityType[];
}

export default function ActivityFilter({ types }: ActivityFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const t = useTranslations("myActivitiesContent");
  
  const initialType = searchParams.get("typeId") || "";
  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  const updateParams = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    
    // Always reset to page 1 if we add pagination later
    // params.set('page', '1'); 

    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  // Debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      // Only update URL if the term changed from what's in URL (to avoid loop on mount if we didn't check, but params check handles it)
      const currentUrlSearch = searchParams.get("search") || "";
      if (searchTerm !== currentUrlSearch) {
        updateParams("search", searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, searchParams, updateParams]);

  const handleFilterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    updateParams("typeId", e.target.value);
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
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Type Filter */}
      <div className={styles.selectContainer}>
        <label htmlFor="activityType" className={styles.selectLabel}>
          {`${t("typeActivitySearch")}:`}
        </label>
        <select
          id="activityType"
          className={styles.typeSelect}
          value={initialType}
          onChange={handleFilterChange}
        >
          <option value="">{t("all")}</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
