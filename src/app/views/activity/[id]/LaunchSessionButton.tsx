"use client";

import { useState } from "react";
import { FaRocket, FaCheck } from "react-icons/fa6";
import { createGameSession } from "@/app/dashboard/my-activities/sessionActions";

import { useRouter } from "next/navigation";

export function LaunchSessionButton({ activityId }: { activityId: number }) {
  const router = useRouter();
  const [isLaunching, setIsLaunching] = useState(false);

  const handleLaunch = async () => {
    setIsLaunching(true);
    const result = await createGameSession(activityId);
    if (result.success) {
      router.push(`/dashboard/live/${result.sessionId}`);
    } else {
      alert(result.error);
      setIsLaunching(false);
    }
  };

  return (
    <button 
      onClick={handleLaunch}
      disabled={isLaunching}
      className="btn btn-warning d-flex align-items-center gap-2 shadow-sm text-white"
      style={{ borderRadius: '12px', padding: '8px 16px', fontWeight: 'bold', background: '#ff9f43', border: 'none' }}
      title="Lanzar partida (Panel en Vivo)"
    >
      {isLaunching ? (
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
      ) : (
        <><FaRocket /> Lanzar</>
      )}
    </button>
  );
}
