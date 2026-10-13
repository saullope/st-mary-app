"use client";

import { EditorList, EditorListItem, EditorListEmpty, EditorTypePicker, type EditorTypeOption } from "@/components/editor";
import {
  allowedBlockKinds,
  isBlockAllowedForGrade,
  LESSON_BLOCK_LABELS,
  type LessonBlock,
  type LessonBlockKind,
} from "@/features/lesson/lessonBlocks";
import { BLOCK_ICONS, BLOCK_COLORS } from "./blockIcons";

/** "Agregar bloque" con los tipos permitidos para el grado. */
export const LessonBlockPicker = ({ gradeId, onAdd }: { gradeId: number; onAdd: (kind: LessonBlockKind) => void }) => {
  const options: EditorTypeOption<LessonBlockKind>[] = allowedBlockKinds(gradeId).map((kind) => ({
    value: kind,
    label: LESSON_BLOCK_LABELS[kind],
    icon: BLOCK_ICONS[kind],
    color: BLOCK_COLORS[kind],
  }));

  return (
    <EditorTypePicker
      label="Agregar bloque"
      groupLabel="Tipos de bloque disponibles"
      options={options}
      hint={gradeId < 3 ? "Lectura, audio y documentos se habilitan desde tercer grado." : undefined}
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
  if (blocks.length === 0) {
    return <EditorListEmpty>Agrega el primer bloque: una presentación, un video, una imagen o una lectura.</EditorListEmpty>;
  }

  return (
    <EditorList label="Bloques de la lección">
      {blocks.map((block, index) => {
        const Icon = BLOCK_ICONS[block.kind];
        return (
          <EditorListItem
            key={block.id}
            position={index + 1}
            label={block.title}
            placeholder={LESSON_BLOCK_LABELS[block.kind]}
            leading={<Icon style={{ color: BLOCK_COLORS[block.kind] }} aria-hidden="true" />}
            itemName="bloque"
            selected={selectedId === block.id}
            warning={isBlockAllowedForGrade(block.kind, gradeId) ? undefined : "No disponible para este grado"}
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
