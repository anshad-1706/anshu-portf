import { forwardRef, type ReactNode } from "react";
import styles from "./FileVisual.module.css";

export interface FileVisualProps {
  isOpen: boolean;
  onClick?: () => void;
  shouldReduceMotion?: boolean;
  children?: ReactNode;
}

/**
 * FileVisual — Phase 05
 * Physical layered 3D project file modeled on the approved reference.
 * Pure CSS 3D transitions with preserve-3d, rotateX bottom-origin hinging, and staggered sheet articulation.
 * Depth Order: Floor Shadow (z:1) → Folder Back (z:2) → Sheets (z:3) → Front Pocket (z:5) → Cards Slot (z:8).
 */
export const FileVisual = forwardRef<HTMLDivElement, FileVisualProps>(
  ({ isOpen, onClick, children }, ref) => {
    // Exact sculpted front pocket contour path
    const pocketPath =
      "M 0,16 Q 0,0 16,0 L 54,0 Q 64,0 70,8 L 76,15 Q 82,21 92,21 L 140,21 Q 156,21 156,36 L 156,70 Q 156,90 136,90 L 20,90 Q 0,90 0,70 Z";
    const topRimPath =
      "M 0,16 Q 0,0 16,0 L 54,0 Q 64,0 70,8 L 76,15 Q 82,21 92,21 L 140,21 Q 156,21 156,36";

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        className={`${styles.fileVisualContainer} ${isOpen ? `fileOpen ${styles.fileOpen} ${styles.isOpen}` : ""}`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick?.();
          }
        }}
        aria-label={isOpen ? "Close Project File" : "Open Project File"}
        aria-expanded={isOpen}
      >
        {/* 1. Floor Drop Shadow (z-index: 1) */}
        <div className={styles.floorShadow} aria-hidden="true" />

        {/* 2. Folder Back Plate (z-index: 2) */}
        <div className={styles.folderBack} aria-hidden="true" />

        {/* 3. Project Cards Slot (z-index: 3) — The 3 primary project cards live here in the file cavity */}
        <div className={styles.cardsSlot}>{children}</div>

        {/* 4. Smoked Translucent Front Pocket (z-index: 5) */}
        <div className={styles.frontPocketWrapper} aria-hidden="true">
          <svg
            viewBox="0 0 156 90"
            className={styles.frontPocketSvg}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Translucent smoked glass gradient allowing mock cards to remain visible */}
              <linearGradient id="smokeGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#28282c" stopOpacity="0.70" />
                <stop offset="50%" stopColor="#1e1e22" stopOpacity="0.72" />
                <stop offset="100%" stopColor="#141416" stopOpacity="0.80" />
              </linearGradient>

              {/* Specular top rim highlight */}
              <linearGradient id="specularRim" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.50" />
                <stop offset="35%" stopColor="#ffffff" stopOpacity="0.40" />
                <stop offset="70%" stopColor="#ffffff" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* Smoked glass body */}
            <path
              d={pocketPath}
              fill="url(#smokeGlass)"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />

            {/* Specular glass top rim highlight */}
            <path
              d={topRimPath}
              fill="none"
              stroke="url(#specularRim)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    );
  }
);

FileVisual.displayName = "FileVisual";

export default FileVisual;
