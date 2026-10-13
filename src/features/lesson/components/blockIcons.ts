import { FaYoutube, FaImage, FaBookOpen, FaMusic, FaFilePdf, FaFileWord, FaFilePowerpoint } from "react-icons/fa6";
import { SiCanva } from "react-icons/si";
import type { IconType } from "react-icons";
import type { LessonBlockKind } from "@/features/lesson/lessonBlocks";

export const BLOCK_ICONS: Record<LessonBlockKind, IconType> = {
  canva: SiCanva,
  youtube: FaYoutube,
  image: FaImage,
  reading: FaBookOpen,
  audio: FaMusic,
  pdf: FaFilePdf,
  word: FaFileWord,
  powerpoint: FaFilePowerpoint,
};

export const BLOCK_COLORS: Record<LessonBlockKind, string> = {
  canva: "#7d2ae8",
  youtube: "#e5002b",
  image: "#0096b4",
  reading: "#6a4bff",
  audio: "#e8692f",
  pdf: "#c62828",
  word: "#185abd",
  powerpoint: "#c43e1c",
};
