"use client";

import { EditorList, EditorListItem, EditorListEmpty, EditorTypePicker, type EditorTypeOption } from "@/components/editor";
import {
  allowedBlockKinds,
  isBlockAllowedForGrade,
  type LessonBlock,
  type LessonBlockKind,
} from "@/features/lesson/lessonBlocks";
import { BLOCK_ICONS, BLOCK_COLORS } from "./blockIcons";
import { useTranslations } from "next-intl";

/** "Agregar bloque" con los tipos permitidos para el grado. */
export const LessonBlockPicker = ({ gradeId, onAdd }: { gradeId: number; onAdd: (kind: LessonBlockKind) => void }) => {
  const t = useTranslations("Editor.lesson");
  const options: EditorTypeOption<LessonBlockKind>[] = allowedBlockKinds(gradeId).map((kind) => ({
    value: kind,
    label: t(`kinds.${kind}`),
    icon: BLOCK_ICONS[kind],
    color: BLOCK_COLORS[kind],
  }));

  return (
    <EditorTypePicker
      label={t("addBlock")}
      groupLabel={t("blockTypes")}
      options={options}
      hint={gradeId < 3 ? t("gradeHint") : undefined}
      onPick={onAdd}
    />
  );
};

interface LessonBlockListProps {
  blocks: LessonBlock[];
  selectedId: number | null;
  gradeId: number;
  onSelect: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
  onDelete: (id: number) => void;
}

export const LessonBlockList = ({ blocks, selectedId, gradeId, onSelect, onMove, onDelete }: LessonBlockListProps) => {
  const t = useTranslations("Editor.lesson");
  if (blocks.length === 0) {
    return <EditorListEmpty>{t("emptyList")}</EditorListEmpty>;
  }

  return (
    <EditorList label={t("listLabel")}>
      {blocks.map((block, index) => {
        const Icon = BLOCK_ICONS[block.kind];
        return (
          <EditorListItem
            key={block.id}
            position={index + 1}
            label={block.title}
            placeholder={t(`kinds.${block.kind}`)}
            leading={<Icon style={{ color: BLOCK_COLORS[block.kind] }} aria-hidden="true" />}
            itemName={t("blockItem")}
            selected={selectedId === block.id}
            warning={isBlockAllowedForGrade(block.kind, gradeId) ? undefined : t("notAllowedWarning")}
            isFirst={index === 0}
            isLast={index === blocks.length - 1}
            onSelect={() => onSelect(block.id)}
            onMove={(direction) => onMove(block.id, direction)}
            onDelete={() => onDelete(block.id)}
          />
        );
      })}
    </EditorList>
  );
};
