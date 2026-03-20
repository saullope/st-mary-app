"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, ChangeEvent, useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

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
    <div className="d-flex flex-wrap align-items-center gap-3">
      {/* Search Input */}
      <div className="position-relative flex-grow-1" style={{ minWidth: "250px" }}>
        <FaSearch className="position-absolute text-muted" style={{ top: "50%", left: "15px", transform: "translateY(-50%)" }} />
        <input 
          type="text" 
          className="form-control border-0 bg-light ps-5 py-2 rounded-pill shadow-sm"
          placeholder="Buscar por nombre de actividad..."
          value={searchTerm}
          onChange={handleSearchChange}
          style={{ fontSize: "0.95rem" }}
        />
      </div>

      {/* Type Filter */}
      <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 shadow-sm">
        <label htmlFor="activityType" className="me-2 fw-bold text-secondary text-nowrap small mb-0">
          TIPO:
        </label>
        <select
          id="activityType"
          className="form-select border-0 bg-transparent py-1 shadow-none"
          value={initialType}
          onChange={handleFilterChange}
          style={{ minWidth: "150px", cursor: "pointer", fontWeight: 500 }}
        >
          <option value="">Todos</option>
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
