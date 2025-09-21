"use client";

import Image from "next/image";

interface QuestionListItemProps {
    id: number;
    text: string;
    mediaType: "image" | "video" | "audio" | "youtube" | null;
    mediaUrl: string | null;
    correctAnswer: "true" | "false" | null;
    isSelected: boolean;
    onClick: () => void;
}

export const QuestionListItem = ({
    id,
    text,
    mediaType,
    mediaUrl,
    correctAnswer,
    isSelected,
    onClick,
}: QuestionListItemProps) => {
    return (
        <>
            <span className="badge bg-secondary mb-2">{id} Quiz</span>
            <li
                onClick={onClick}
                className="d-flex flex-column align-items-center border rounded p-2 mb-3"
                style={{
                    border: isSelected ? "3px solid #0d6efd" : "2px solid #ccc",
                    cursor: "pointer",
                    transition: "border .3s ease-in-out",
                }}
            >
                <small className="text-center text-muted">{text.slice(0, 20)}...</small>
                <div
                    style={{
                        width: "40px",
                        height: "40px",
                        backgroundColor: "#f0f0f0",
                    }}
                    className="d-flex justify-content-center align-items-center mb-2"
                >
                    {mediaType === "image" && mediaUrl && (
                        <Image
                            src={mediaUrl}
                            style={{ maxWidth: "100%", maxHeight: "100%" }}
                            alt="media preview"
                            width={40}
                            height={40}
                        />
                    )}
                    {(mediaType === "video" || mediaType === "youtube") && (
                        <span className="text-muted">🎥</span>
                    )}
                    {mediaType === "audio" && <span className="text-muted">🎵</span>}
                    {!mediaUrl && !mediaType && <span className="text-muted">🖼️</span>}
                </div>
                <span className="badge rounded-pill bg-light text-dark mt-1">
                    {correctAnswer === "true" ? "✔️" : "❌"}
                </span>
            </li>
        </>
    );
};
