"use client";

import type { MediaType } from "@/lib/types";
import { EditorList, EditorListItem, type EditorListTagTone } from "./EditorListItem";
import { MediaThumb } from "./MediaThumb";
import { useTranslations } from "next-intl";

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

/** Lista de preguntas y diapositivas de LudiQuiz y Verdadero/Falso. */
export const QuestionList = ({ items, draft, selectedId, onSelect, onMove, onDelete }: QuestionListProps) => {
  const t = useTranslations("Editor.list");
  const slideTag = { text: t("slideTag"), tone: "cyan" as const };
  return (
  <EditorList label={t("questionsLabel")}>
    {items.map((item, index) => (
      <EditorListItem
        key={item.id}
        position={index + 1}
        label={item.text}
        placeholder={item.isSlide ? t("slidePlaceholder") : t("untitledQuestion")}
        leading={<MediaThumb mediaType={item.mediaType} mediaUrl={item.mediaUrl} />}
        itemName={item.isSlide ? t("slideItem") : t("questionItem")}
        tag={item.isSlide ? slideTag : item.tag}
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
        placeholder={t("newQuestion")}
        leading={<MediaThumb mediaType={draft.mediaType} mediaUrl={draft.mediaUrl} />}
        itemName={t("questionItem")}
        tag={draft.tag}
        selected
        draft
      />
    )}
  </EditorList>
  );
};
