"use client";

import { useState } from "react";
import { FaRocket, FaCheck } from "react-icons/fa6";
import { createGameSession } from "@/app/dashboard/my-activities/sessionActions";

export function LaunchSessionButton({ activityId }: { activityId: number }) {
  const [pin, setPin] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    const result = await createGameSession(activityId);
    if (result.success) {
      setPin(result.pin || "");
    } else {
      alert(result.error);
    }
    setIsLaunching(false);
  };

  if (pin) {
    return (
      <div className="d-flex align-items-center gap-2 bg-success text-white px-3 py-2 shadow-sm" style={{ borderRadius: '12px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>PIN:</span>
        <strong style={{ fontSize: '1.2rem', letterSpacing: '2px' }}>{pin}</strong>
      </div>
    );
  }

  return (
    <button 
      onClick={handleLaunch}
      disabled={isLaunching}
      className="btn btn-warning d-flex align-items-center gap-2 shadow-sm text-white"
      style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', background: '#ff9f43', border: 'none' }}
      title="Lanzar partida (Obtener PIN)"
    >
      {isLaunching ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      ) : (
        <><FaRocket /> Lanzar</>
      )}
    </button>
  );
}
