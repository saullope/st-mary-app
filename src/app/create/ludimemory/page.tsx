"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getActivityForEdit } from "@/app/actions/getActivityForEdit";
import { useActivityEditor } from "@/context/ActivityEditorContext";
import { EditorCanvas, EditorGamificationColumn } from "@/components/editor";
import { MemoryBoardEditor } from "@/features/memory/components/MemoryBoardEditor";

export default function LudiMemory() {
    const { state, setActivityType, setMemoryImages, setTitle, updateConfig, setActivityId, setBackgroundImage } = useActivityEditor();
    const searchParams = useSearchParams();

    useEffect(() => {
        setActivityType("ludimemory");
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
            setMemoryImages(result.data.memoryImages);
        };
        load();
    }, [searchParams, setActivityId, setTitle, updateConfig, setBackgroundImage, setMemoryImages]);

    return (
        <div className="row" style={{ minHeight: "calc(100vh - 80px)" }}>
            <EditorCanvas title="LudiMemory">
                <MemoryBoardEditor images={state.memoryImages} onChange={setMemoryImages} />
            </EditorCanvas>

            <EditorGamificationColumn />
        </div>
    );
}
