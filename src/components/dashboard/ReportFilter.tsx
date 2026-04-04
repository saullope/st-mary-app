"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, ChangeEvent, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

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
    <div className="d-flex flex-wrap align-items-center gap-3">
      {/* Search Input */}
      <div className="position-relative flex-grow-1" style={{ minWidth: "250px" }}>
        <FaSearch className="position-absolute text-muted" style={{ top: "50%", left: "15px", transform: "translateY(-50%)" }} />
        <input 
          type="text" 
          className="form-control border-0 bg-light ps-5 py-2 rounded-pill shadow-sm"
          placeholder="Buscar actividad por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ fontSize: "0.95rem" }}
        />
      </div>

      {/* Status Filter */}
      <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 shadow-sm">
        <label htmlFor="reportStatus" className="me-2 fw-bold text-secondary text-nowrap small mb-0">
          Estado:
        </label>
        <select
          id="reportStatus"
          className="form-select border-0 bg-transparent py-1 shadow-none"
          value={initialStatus}
          onChange={handleFilterChange}
          style={{ minWidth: "150px", cursor: "pointer", fontWeight: 500 }}
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