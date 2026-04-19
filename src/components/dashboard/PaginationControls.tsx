"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface PaginationControlsProps {
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export default function PaginationControls({ totalCount, currentPage, pageSize }: PaginationControlsProps) {
  const router = useRouter();
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
    <div className="d-flex flex-wrap justify-content-between align-items-center py-3 px-2">
      {/* Page Size Selector */}
      <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
        <span className="text-muted small">Mostrar</span>
        <select 
            className="form-select form-select-sm w-auto border-secondary-subtle"
            value={pageSize}
            onChange={handleLimitChange}
            style={{ cursor: "pointer" }}
        >
            <option value="5">5</option>
            <option value="10">10</option>
        </select>
        <span className="text-muted small">registros</span>
      </div>

      {/* Info Text */}
      <div className="text-muted small mb-2 mb-md-0">
        Mostrando <span className="fw-bold">{startRecord}</span> - <span className="fw-bold">{endRecord}</span> de <span className="fw-bold">{totalCount}</span>
      </div>

      {/* Navigation Buttons */}
      <div className="btn-group">
        <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Anterior"
        >
            <FaChevronLeft size={12} />
        </button>
        
        {/* Simple Page Numbers logic (Current / Total) */}
        <button className="btn btn-outline-secondary btn-sm disabled border-secondary-subtle text-dark fw-bold">
            {currentPage}
        </button>

        <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            title="Siguiente"
        >
            <FaChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
