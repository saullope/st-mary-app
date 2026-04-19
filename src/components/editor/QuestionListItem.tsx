"use client";

import Image from "next/image";
import { FaTrash, FaVideo, FaMusic, FaYoutube, FaFileImage } from 'react-icons/fa6';

// Helper function to extract the YouTube Video ID
const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

interface QuestionListItemProps {
    id: number;
    text: string;
    mediaType: "image" | "video" | "audio" | "youtube" | null;
    mediaUrl: string | null;
    correctAnswer: "true" | "false" | null;
    activityType?: "ludiquiz" | "trueorfalse" | "ludimemory" | null; // Prop opcional para saber en qué editor estamos
    isSelected: boolean;
    onClick: () => void;
    onDelete?: () => void;
}

export const QuestionListItem = ({
    id,
    text,
    mediaType,
    mediaUrl,
    correctAnswer,
    activityType,
    isSelected,
    onClick,
    onDelete,
}: QuestionListItemProps) => {

    const youtubeId = mediaType === "youtube" && mediaUrl ? getYoutubeVideoId(mediaUrl) : null;
    const youtubeThumbnailUrl = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/default.jpg` : null;

    return (
        <div className="position-relative mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="badge bg-secondary">{id} Quiz</span>
                {onDelete && (
                    <button
                        className="btn btn-sm text-muted p-0 border-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        style={{ background: 'transparent', outline: 'none', boxShadow: 'none' }}
                        title="Eliminar pregunta"
                    >
                        <FaTrash />
                    </button>
                )}
            </div>
            <div
                onClick={onClick}
                className="d-flex flex-column align-items-center border rounded p-2"
                style={{
                    borderColor: isSelected ? "#0d6efd" : "#e2e8f0",
                    borderWidth: isSelected ? "2px" : "1px",
                    borderStyle: "solid",
                    cursor: "pointer",
                    transition: "all .2s ease-in-out",
                    background: isSelected ? 'rgba(13, 110, 253, 0.05)' : 'white',
                }}
                onMouseOver={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "#cbd5e1";
                }}
                onMouseOut={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = "#e2e8f0";
                }}
            >
                <small className="text-center text-muted fw-medium mb-2 w-100 text-truncate px-2">
                    {text || "Pregunta sin título"}
                </small>
                <div
                    style={{
                        width: "60px",
                        height: "40px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        overflow: "hidden"
                    }}
                    className="d-flex justify-content-center align-items-center mb-1 position-relative"
                >
                    {(mediaType === "image" || (mediaUrl && (mediaUrl.includes("firebasestorage") || mediaUrl.includes("unsplash")) && mediaType !== "video" && mediaType !== "audio")) && mediaUrl ? (
                        <Image
                            src={mediaUrl}
                            style={{ objectFit: "cover", width: "100%", height: "100%" }}
                            alt="image preview"
                            width={60}
                            height={40}
                            unoptimized
                        />
                    ) : mediaType === "youtube" && youtubeThumbnailUrl ? (
                        <>
                            <Image
                                src={youtubeThumbnailUrl}
                                style={{ objectFit: "cover", width: "100%", height: "100%" }}
                                alt="youtube preview"
                                width={60}
                                height={40}
                                unoptimized
                            />
                            <div className="position-absolute" style={{ opacity: 0.9 }}>
                                <FaYoutube size={18} color="#ff0000" />
                            </div>
                        </>
                    ) : (
                        <span className="text-muted d-flex" style={{ fontSize: '1.2rem' }}>
                            {mediaType === "video" ? <FaVideo /> : 
                             mediaType === "youtube" ? <FaYoutube /> : 
                             mediaType === "audio" ? <FaMusic /> : 
                             <FaFileImage />}
                        </span>
                    )}
                </div>
                {correctAnswer !== null && activityType !== "ludiquiz" && (
                    <span className={`badge rounded-pill mt-1 ${correctAnswer === "true" ? "bg-success" : "bg-danger"}`} style={{ opacity: 0.8, fontSize: '0.7rem' }}>
                        {correctAnswer === "true" ? "Verdadero" : "Falso"}
                    </span>
                )}
            </div>
        </div>
    );
};
