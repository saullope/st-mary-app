"use client";

import { FaVideo, FaMusic, FaYoutube, FaFileImage, FaListCheck } from "react-icons/fa6";
import { SiCanva } from "react-icons/si";
import type { MediaType } from "@/lib/types";
import styles from "./EditorList.module.css";

const getYoutubeVideoId = (url: string) => {
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

interface MediaThumbProps {
  mediaType: MediaType | null;
  mediaUrl: string | null;
}

/** Miniatura del multimedia de una pregunta; ícono cuando no hay imagen que mostrar. */
export const MediaThumb = ({ mediaType, mediaUrl }: MediaThumbProps) => {
  if (mediaUrl && mediaType === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={mediaUrl} alt="" />;
  }

  const youtubeId = mediaType === "youtube" && mediaUrl ? getYoutubeVideoId(mediaUrl) : null;
  if (youtubeId) {
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`https://img.youtube.com/vi/${youtubeId}/default.jpg`} alt="" />
        <span className={styles.leadingOverlay} aria-hidden="true"><FaYoutube /></span>
      </>
    );
  }

  const Icon = !mediaUrl
    ? FaListCheck
    : mediaType === "canva"
      ? SiCanva
      : mediaType === "youtube"
        ? FaYoutube
        : mediaType === "video"
          ? FaVideo
          : mediaType === "audio"
            ? FaMusic
            : FaFileImage;
  return <Icon aria-hidden="true" />;
};
