import { FaBookOpen, FaBrain, FaClipboardList, FaGamepad, FaListCheck } from "react-icons/fa6";
import styles from "./ActivityCollection.module.css";

const TYPE_VISUALS: Record<number, { Icon: typeof FaGamepad; className: string }> = {
  1: { Icon: FaListCheck, className: styles.typeQuiz },
  2: { Icon: FaGamepad, className: styles.typeTrueFalse },
  3: { Icon: FaBrain, className: styles.typeMemory },
  4: { Icon: FaBookOpen, className: styles.typeLesson },
  5: { Icon: FaClipboardList, className: styles.typeForm },
};

/** Class that sets the type's color variables; put it on the item so stripe, icon and cover share them. */
export function activityTypeClass(typeId: number): string {
  return TYPE_VISUALS[typeId]?.className ?? styles.typeQuiz;
}

/** Tile (list) or cover (grid) in the type's color; decorative, the type name is shown as text. */
export default function ActivityTypeIcon({ typeId }: { typeId: number }) {
  const Icon = TYPE_VISUALS[typeId]?.Icon ?? FaGamepad;
  return (
    <span className={styles.typeIcon} aria-hidden="true">
      <Icon />
    </span>
  );
}
