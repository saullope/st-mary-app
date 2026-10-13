"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./PaginationControls.module.css";
import { useTranslations } from "next-intl";

interface PaginationControlsProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export default function PaginationControls({ totalCount, currentPage, pageSize }: PaginationControlsProps) {
  const router = useRouter();
  const t = useTranslations("Pagination");
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      params.set(key, value);
    });
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateParams({ page: newPage.toString() });
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ 
        limit: e.target.value,
        page: "1" // Reset to page 1 when changing limit
    });
  };

  if (totalCount === 0) return null;

  return (
    <div className={styles.paginationWrapper}>
      {/* Page Size Selector */}
      <div className={styles.limitSelector}>
        <label htmlFor="pagination-limit">{t("show")}</label>
        <select 
            id="pagination-limit"
            className={styles.limitSelect}
            value={pageSize}
            onChange={handleLimitChange}
        >
            <option value="5">5</option>
            <option value="10">10</option>
        </select>
        <span>{t("records")}</span>
      </div>

      {/* Info Text */}
      <div className={styles.infoText}>
        {t.rich("showing", { start: startRecord, end: endRecord, total: totalCount, span: (chunks) => <span>{chunks}</span> })}
      </div>

      {/* Navigation Buttons */}
      <div className={styles.navGroup}>
        <button 
            className={styles.navBtn}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title={t("previous")}
            aria-label={t("previous")}
        >
            <FaChevronLeft size={12} />
        </button>
        
        {/* Simple Page Numbers logic (Current / Total) */}
        <div className={styles.currentPage} aria-current="page" aria-label={t("page", { page: currentPage })}>
            {currentPage}
        </div>

        <button 
            className={styles.navBtn}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title={t("next")}
            aria-label={t("next")}
        >
            <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
