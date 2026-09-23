import React from "react";
import styles from "./Cursor.module.css";

/**
 * CursorBody — Precision 2D Faceted Graphite Physical Pointer
 * Natural orientation: Pointing horizontally RIGHT (+X at 0°).
 * Dual faceted surface:
 *   - Upper facet: Main illuminated graphite surface
 *   - Lower facet: Shadowed secondary facet
 *   - Hairline specular ridge line along the directional axis
 *   - Soft rounded corners and restrained dark perimeter
 * Visual pivot is calibrated at (10, 11).
 */
export const CursorBody: React.FC = () => {
  return (
    <svg
      className={styles.cursorSvg}
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Upper Facet Gradient: Directional ambient highlight */}
        <linearGradient
          id="cursorFacetTop"
          x1="3.5"
          y1="4"
          x2="20.5"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#323238" />
          <stop offset="50%" stopColor="#25252a" />
          <stop offset="100%" stopColor="#1a1a1e" />
        </linearGradient>

        {/* Lower Facet Gradient: Occluded shadow face */}
        <linearGradient
          id="cursorFacetBottom"
          x1="3.5"
          y1="18"
          x2="20.5"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#1c1c20" />
          <stop offset="55%" stopColor="#141417" />
          <stop offset="100%" stopColor="#0d0d0f" />
        </linearGradient>

        {/* Hairline Central Ridge Highlight */}
        <linearGradient
          id="cursorRidgeHighlight"
          x1="6.5"
          y1="11"
          x2="20.5"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0.26" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.38" />
        </linearGradient>
      </defs>

      {/* 1. Base Silhouette with rounded corners */}
      <path
        d="M20.2 10.6C20.6 10.8 20.6 11.2 20.2 11.4L3.8 17.8C3.3 18.0 2.8 17.6 3.0 17.1L5.8 11.3C5.9 11.1 5.9 10.9 5.8 10.7L3.0 4.9C2.8 4.4 3.3 4.0 3.8 4.2L20.2 10.6Z"
        fill="#111114"
        stroke="rgba(0, 0, 0, 0.65)"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />

      {/* 2. Top Facet (Illuminated surface) */}
      <path
        d="M20.2 10.6L3.8 4.2C3.3 4.0 2.8 4.4 3.0 4.9L5.8 10.7C5.9 10.8 6.0 11.0 6.2 11.0L20.2 10.6Z"
        fill="url(#cursorFacetTop)"
      />

      {/* 3. Bottom Facet (Shadowed surface) */}
      <path
        d="M20.2 11.4L6.2 11.0C6.0 11.0 5.9 11.2 5.8 11.3L3.0 17.1C2.8 17.6 3.3 18.0 3.8 17.8L20.2 11.4Z"
        fill="url(#cursorFacetBottom)"
      />

      {/* 4. Top Rim Subtle Highlight */}
      <path
        d="M4.2 4.4L19.8 10.5"
        stroke="rgba(255, 255, 255, 0.16)"
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      {/* 5. Central Ridge Line */}
      <path
        d="M6.2 11.0L19.8 11.0"
        stroke="url(#cursorRidgeHighlight)"
        strokeWidth="0.75"
        strokeLinecap="round"
      />
    </svg>
  );
};

export default CursorBody;
