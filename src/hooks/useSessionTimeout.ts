import { useCallback, useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";
import { hardNavigate } from "@/lib/browserNavigation";
import {
  AUTH_API_ROUTES,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_RENEW_INTERVAL_MS,
  SESSION_WARNING_BEFORE_MS,
  type SessionEndReason,
} from "@/lib/auth/constants";

const ACTIVITY_KEY = "ludi_last_activity";
const TICK_MS = 1000;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
// Una clase en vivo cuenta como actividad aunque el docente no toque la pantalla.
const ALWAYS_ACTIVE_PATHS = ["/dashboard/live/"];

export interface SessionWarning {
  reason: SessionEndReason;
  endsAt: number;
}

function readSharedActivity(): number {
  try {
    return Number(localStorage.getItem(ACTIVITY_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeSharedActivity(value: number) {
  try {
    localStorage.setItem(ACTIVITY_KEY, String(value));
  } catch {
    // Sin almacenamiento cada pestaña lleva su propia actividad.
  }
}

/**
 * Inactividad y límite absoluto de la sesión del docente (ver lib/auth/constants).
 * La actividad se comparte entre pestañas; mientras hay actividad la cookie se renueva
 * en el servidor, y si no, se avisa antes de cerrar la sesión.
 */
export function useSessionTimeout(enabled: boolean, onEnded: () => void) {
  const [warning, setWarning] = useState<SessionWarning | null>(null);
  const lastActivityRef = useRef(Date.now());
  const lastRenewRef = useRef(Date.now());
  const absoluteEndRef = useRef<number | null>(null);
  const endingRef = useRef(false);

  const endSession = useCallback(async (reason: SessionEndReason) => {
    if (endingRef.current) return;
    endingRef.current = true;
    try {
      await signOut(auth);
      await fetch(AUTH_API_ROUTES.LOGOUT, { method: "POST" });
    } catch (error) {
      console.error("Error closing session:", error);
    }
    onEnded();
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    hardNavigate(`/auth/login?reason=${reason}&redirect=${redirect}`);
  }, [onEnded]);

  const renew = useCallback(async () => {
    lastRenewRef.current = Date.now();
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) return;
      const response = await fetch(AUTH_API_ROUTES.REFRESH, {
        method: "POST",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await response.json();
      if (response.status === 401) {
        endSession(data.reason === "absolute" ? "absolute" : "idle");
        return;
      }
      if (data.absoluteExpiresAt) absoluteEndRef.current = data.absoluteExpiresAt;
    } catch (error) {
      console.error("Error renewing session:", error);
    }
  }, [endSession]);

  const markActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    writeSharedActivity(now);
  }, []);

  /** "Seguir conectado": cuenta como actividad y renueva de inmediato. */
  const stayConnected = useCallback(() => {
    markActivity();
    setWarning(null);
    renew();
  }, [markActivity, renew]);

  useEffect(() => {
    if (!enabled) return;
    endingRef.current = false;
    lastActivityRef.current = Math.max(Date.now(), readSharedActivity());

    fetch(AUTH_API_ROUTES.REFRESH)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) absoluteEndRef.current = data.absoluteExpiresAt;
      })
      .catch(() => undefined);

    // Los eventos de alta frecuencia solo se registran una vez por segundo.
    let lastEvent = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastEvent < 1000) return;
      lastEvent = now;
      markActivity();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === ACTIVITY_KEY && event.newValue) {
        lastActivityRef.current = Math.max(lastActivityRef.current, Number(event.newValue));
      }
    };

    ACTIVITY_EVENTS.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));
    window.addEventListener("storage", onStorage);

    const timer = setInterval(() => {
      const now = Date.now();
      if (ALWAYS_ACTIVE_PATHS.some((path) => window.location.pathname.startsWith(path))) {
        lastActivityRef.current = now;
      }

      const idleEndsAt = lastActivityRef.current + SESSION_IDLE_TIMEOUT_MS;
      const absoluteEndsAt = absoluteEndRef.current;

      if (absoluteEndsAt && now >= absoluteEndsAt) return void endSession("absolute");
      if (now >= idleEndsAt) return void endSession("idle");

      if (absoluteEndsAt && absoluteEndsAt - now <= SESSION_WARNING_BEFORE_MS) {
        setWarning((current) => (current?.reason === "absolute" ? current : { reason: "absolute", endsAt: absoluteEndsAt }));
      } else if (idleEndsAt - now <= SESSION_WARNING_BEFORE_MS) {
        setWarning((current) => (current?.reason === "idle" && current.endsAt === idleEndsAt ? current : { reason: "idle", endsAt: idleEndsAt }));
      } else {
        setWarning((current) => (current ? null : current));
      }

      if (lastActivityRef.current > lastRenewRef.current && now - lastRenewRef.current >= SESSION_RENEW_INTERVAL_MS) {
        renew();
      }
    }, TICK_MS);

    return () => {
      clearInterval(timer);
      ACTIVITY_EVENTS.forEach((name) => window.removeEventListener(name, onActivity));
      window.removeEventListener("storage", onStorage);
    };
  }, [enabled, endSession, markActivity, renew]);

  return { warning, stayConnected, endNow: () => endSession("idle") };
}
