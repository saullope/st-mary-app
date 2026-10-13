"use client";

import type { MediaType } from "@/lib/types";
import { EditorList, EditorListItem, type EditorListTagTone } from "./EditorListItem";
import { MediaThumb } from "./MediaThumb";

export interface QuestionListEntry {
  id: number;
  text: string;
  mediaType: MediaType | null;
  mediaUrl: string | null;
  isSlide?: boolean;
  /** Distintivo propio del editor, p. ej. Verdadero/Falso. */
  tag?: { text: string; tone: EditorListTagTone };
}

interface QuestionListProps {
  items: QuestionListEntry[];
  /** Pregunta en construcción que aún no se agregó; se muestra al final. */
  draft: QuestionListEntry | null;
  selectedId: number | null;
  onSelect: (item: QuestionListEntry) => void;
  onMove: (id: number, direction: -1 | 1) => void;
  onDelete: (id: number) => void;
}

const SLIDE_TAG = { text: "Diapositiva", tone: "cyan" as const };

/** Lista de preguntas y diapositivas de LudiQuiz y Verdadero/Falso. */
export const QuestionList = ({ items, draft, selectedId, onSelect, onMove, onDelete }: QuestionListProps) => (
  <EditorList label="Preguntas de la actividad">
    {items.map((item, index) => (
      <EditorListItem
        key={item.id}
        position={index + 1}
        label={item.text}
        placeholder={item.isSlide ? "Presentación de Canva" : "Pregunta sin título"}
        leading={<MediaThumb mediaType={item.mediaType} mediaUrl={item.mediaUrl} />}
        itemName={item.isSlide ? "diapositiva" : "pregunta"}
        tag={item.isSlide ? SLIDE_TAG : item.tag}
        selected={selectedId === item.id}
        isFirst={index === 0}
        isLast={index === items.length - 1}
        onSelect={() => onSelect(item)}
        onMove={(direction) => onMove(item.id, direction)}
        onDelete={() => onDelete(item.id)}
      />
    ))}
    {draft && (
      <EditorListItem
        position={items.length + 1}
        label={draft.text}
        placeholder="Nueva pregunta..."
        leading={<MediaThumb mediaType={draft.mediaType} mediaUrl={draft.mediaUrl} />}
        itemName="pregunta"
        tag={draft.tag}
        selected
        draft
      />
    )}
  </EditorList>
);
