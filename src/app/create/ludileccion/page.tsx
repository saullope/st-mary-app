"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getActivityForEdit } from "@/app/actions/getActivityForEdit";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import EditorTour from "@/features/tours/EditorTour";
import { EditorSidebar, EditorCanvas, EditorPlaceholder, EditorGamificationColumn, moveItem } from "@/components/editor";
import { LessonBlockList, LessonBlockPicker } from "@/features/lesson/components/LessonBlockList";
import { LessonBlockEditor } from "@/features/lesson/components/LessonBlockEditor";
import type { LessonBlock, LessonBlockKind } from "@/features/lesson/lessonBlocks";
import { useTranslations } from "next-intl";

export default function LudiLeccion() {
    const { state, setActivityType, setLessonBlocks, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const { lessonBlocks: blocks, fullScreen, config } = state;
    const searchParams = useSearchParams();
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const t = useTranslations("Editor.lesson");

    useEffect(() => {
        setActivityType("ludileccion");
    }, [setActivityType]);

    useEffect(() => {
        const idParam = searchParams.get("id");
        if (!idParam) return;
        const load = async () => {
            const result = await getActivityForEdit(parseInt(idParam));
            if (!result.success || !result.data) return;
            setActivityId(result.data.activityId);
            setTitle(result.data.title);
            updateConfig(result.data.config);
            setBackgroundImage(result.data.backgroundImage);
            setLessonBlocks(result.data.lessonBlocks);
            setSelectedId(result.data.lessonBlocks[0]?.id ?? null);
        };
        load();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage, setLessonBlocks]);

    const nextId = () => blocks.reduce((max, b) => Math.max(max, b.id), 0) + 1;

    const addBlock = (kind: LessonBlockKind) => {
        const block: LessonBlock = { id: nextId(), kind, title: "", url: null, body: kind === "reading" ? "" : undefined };
        setLessonBlocks((prev) => [...prev, block]);
        setSelectedId(block.id);
    };

    const updateBlock = (id: number, changes: Partial<LessonBlock>) => {
        setLessonBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...changes } : b)));
    };

    const moveBlock = (id: number, direction: -1 | 1) => {
        setLessonBlocks((prev) => moveItem(prev, id, direction));
    };

    const deleteBlock = (id: number) => {
        const remaining = blocks.filter((b) => b.id !== id);
        setLessonBlocks(remaining);
        if (selectedId === id) setSelectedId(remaining[0]?.id ?? null);
    };

    const selectedBlock = blocks.find((b) => b.id === selectedId) ?? null;

    return (
        <div className="row" style={{ minHeight: "calc(100vh - 80px)" }}>
            {!fullScreen && (
                <EditorSidebar
                    title={t("sidebarTitle")}
                    count={blocks.length}
                    actions={<LessonBlockPicker gradeId={config.gradeId} onAdd={addBlock} />}
                >
                    <LessonBlockList
                        blocks={blocks}
                        selectedId={selectedId}
                        gradeId={config.gradeId}
                        onSelect={setSelectedId}
                        onMove={moveBlock}
                        onDelete={deleteBlock}
                    />
                </EditorSidebar>
            )}

            <EditorCanvas title={t("canvasTitle")}>
                {selectedBlock ? (
                    <LessonBlockEditor
                        key={selectedBlock.id}
                        block={selectedBlock}
                        gradeId={config.gradeId}
                        onChange={(changes) => updateBlock(selectedBlock.id, changes)}
                    />
                ) : (
                    <EditorPlaceholder title={t("placeholderTitle")}>
                        {t("placeholderBody")}
                    </EditorPlaceholder>
                )}
            </EditorCanvas>

            <EditorTour type="ludileccion" />

            <EditorGamificationColumn />
        </div>
    );
}
