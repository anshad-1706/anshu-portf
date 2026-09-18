import React from "react";
import styles from "./Cursor.module.css";

/**
 * CursorBody — Faceted graphite 3D physical pointer
 * Precision vector geometry with dual directional facets, subtle specular ridge,
 * and ambient occlusion depth.
 */
export const CursorBody: React.FC = () => {
  return (
    <svg
      className={styles.cursorSvg}
      viewBox="0 0 20 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Upper Left Facet Gradient: Directional ambient highlight */}
        <linearGradient id="cursorFacetLeft" x1="1" y1="1" x2="5.5" y2="18.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3c3c40" />
          <stop offset="45%" stopColor="#2c2c30" />
          <stop offset="100%" stopColor="#212124" />
        </linearGradient>

        {/* Lower Right Facet Gradient: Occluded shadow face */}
        <linearGradient id="cursorFacetRight" x1="1" y1="1" x2="16.5" y2="15.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#222225" />
          <stop offset="60%" stopColor="#171719" />
          <stop offset="100%" stopColor="#101012" />
        </linearGradient>

        {/* Hairline Central Ridge Highlight */}
        <linearGradient id="ridgeHighlight" x1="1" y1="1" x2="5.5" y2="14.5" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.06" />
        </linearGradient>
      </defs>

      {/* 1. Base Outer Silhouette Stroke */}
      <path
        d="M1 1L16.5 15.5L8.5 15.8L5.5 21.5L1 1Z"
        fill="#121214"
        stroke="rgba(0, 0, 0, 0.5)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* 2. Left Illuminated Facet */}
      <path
        d="M1 1L1 18L5.5 14.2L1 1Z"
        fill="url(#cursorFacetLeft)"
      />

      {/* 3. Right Shadowed Facet */}
      <path
        d="M1 1L5.5 14.2L8.2 14.4L16.2 15.2L1 1Z"
        fill="url(#cursorFacetRight)"
      />

      {/* 4. Tail Stem Facet (Adds mechanical/physical realism) */}
      <path
        d="M5.5 14.2L8.2 14.4L5.6 21L3.8 20.2L5.5 14.2Z"
        fill="#18181b"
      />

      {/* 5. Central Specular Ridge Line */}
      <path
        d="M1 1L5.5 14.2"
        stroke="url(#ridgeHighlight)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />

      {/* 6. Subtle Outer Left Rim Highlight */}
      <path
        d="M1 1.5L1 17.5"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CursorBody;
