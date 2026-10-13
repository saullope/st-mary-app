"use client";

import { GameEngine } from "./GameEngine";
import { FormEngine } from "./FormEngine";
import { MemoryEngine } from "./MemoryEngine";

// Deben coincidir con ACTIVITY_TYPE_MAP en src/lib/activity-helpers.ts
const TIPO_LUDIMEMORY = 3;
const TIPO_LUDIFORM = 5;

interface ActivityPlayerProps {
  sesion: any;
  previewMode?: boolean;
  onExit?: () => void;
  previewName?: string;
}

/** Elige el reproductor según el tipo de actividad; lo usan /play y la Vista Previa del docente. */
export const ActivityPlayer = (props: ActivityPlayerProps) => {
  const tipo = Number(props.sesion.LUDI_ACTIVIDAD.tipoActividadId);
  if (tipo === TIPO_LUDIFORM) return <FormEngine {...props} />;
  if (tipo === TIPO_LUDIMEMORY) return <MemoryEngine {...props} />;
  return <GameEngine {...props} />;
};
