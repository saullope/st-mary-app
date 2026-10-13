"use client";

import { FaCircleDot, FaSquareCheck, FaAlignLeft } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { EditorList, EditorListItem, EditorListEmpty, EditorTypePicker } from "@/components/editor";
import {
  FORM_QUESTION_TYPES,
  validateFormQuestion,
  type FormQuestion,
  type FormQuestionType,
} from "@/features/form/formQuestions";
import { useTranslations } from "next-intl";

export const FORM_TYPE_ICONS: Record<FormQuestionType, IconType> = {
  single: FaCircleDot,
  multiple: FaSquareCheck,
  long: FaAlignLeft,
};

export const FORM_TYPE_COLORS: Record<FormQuestionType, string> = {
  single: "#6a4bff",
  multiple: "#0096b4",
  long: "#e8692f",
};

export const FormQuestionPicker = ({ onAdd }: { onAdd: (type: FormQuestionType) => void }) => {
  const t = useTranslations("Editor.form");
  return (
    <EditorTypePicker
      label={t("addQuestion")}
      groupLabel={t("questionTypes")}
      options={FORM_QUESTION_TYPES.map((type) => ({
        value: type,
        label: t(`types.${type}`),
        icon: FORM_TYPE_ICONS[type],
        color: FORM_TYPE_COLORS[type],
      }))}
      onPick={onAdd}
    />
  );
};

interface FormQuestionListProps {
  questions: FormQuestion[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  onMove: (id: number, direction: -1 | 1) => void;
  onDelete: (id: number) => void;
}

export const FormQuestionList = ({ questions, selectedId, onSelect, onMove, onDelete }: FormQuestionListProps) => {
  const t = useTranslations("Editor.form");
  if (questions.length === 0) {
    return <EditorListEmpty>{t("emptyList")}</EditorListEmpty>;
  }

  return (
    <EditorList label={t("listLabel")}>
      {questions.map((question, index) => {
        const Icon = FORM_TYPE_ICONS[question.type];
        return (
          <EditorListItem
            key={question.id}
            position={index + 1}
            label={question.text}
            placeholder={t(`types.${question.type}`)}
            leading={<Icon style={{ color: FORM_TYPE_COLORS[question.type] }} aria-hidden="true" />}
            itemName={t("questionItem")}
            selected={selectedId === question.id}
            warning={validateFormQuestion(question) ? t("incomplete") : undefined}
            isFirst={index === 0}
            isLast={index === questions.length - 1}
            onSelect={() => onSelect(question.id)}
            onMove={(direction) => onMove(question.id, direction)}
            onDelete={() => onDelete(question.id)}
          />
        );
      })}
    </EditorList>
  );
};
