import React from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./AnimatedEditorialBackground.module.css";

export interface AnimatedEditorialBackgroundProps {
  className?: string;
}

// 4 Asymmetric, large-radius orbital paths extending beyond viewport
const PATH_1_D =
  "M -120,260 C 380,-60 1260,-30 1720,380 C 1980,620 2050,960 1620,1180";
const PATH_2_D =
  "M -160,820 C 380,1080 1140,1020 1600,740 C 1960,520 2080,240 2160,-80";
const PATH_3_D = "M 180,-100 C 560,340 980,820 1860,940";
const PATH_4_D = "M 1080,-80 C 1380,180 1680,440 2060,620";

/**
 * AnimatedEditorialBackground — Phase 07.1
 * Reworked editorial background capturing the reference atmosphere:
 *
 * Visual Layers:
 * DEPTH 1: Large soft atmospheric gray masses with embedded tactile grain
 *          (entering from left edge & bottom-right edge; clean center negative space)
 * DEPTH 1.5: Shaded soft physical floating sphere in upper-right
 * DEPTH 2: 3–4 thin, independent, asymmetric orbital vector curves (SVG)
 * DEPTH 3: 5 distinct graphite/black anchor points (#111111, 2.5–4px),
 *          with 3 dots traveling slowly along orbital paths
 *
 * Characteristics:
 * - Pure monochrome (#FFFFFF base, neutral gray masses, #111111 anchor points)
 * - 100% non-interactive (pointer-events: none)
 * - Zero React re-renders or JS frame loops (native SVG animation + CSS transforms)
 * - Accessible: respects prefers-reduced-motion
 */
export const AnimatedEditorialBackground: React.FC<
  AnimatedEditorialBackgroundProps
> = ({ className = "" }) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div
      className={`${styles.backgroundContainer} ${className}`.trim()}
      aria-hidden="true"
      data-background="animated-editorial"
    >
      {/* ====================================================================
          DEPTH 1: Large Soft Atmospheric Masses (Physical gray fields + grain)
          ==================================================================== */}
      {/* 1. Large Atmospheric Mass — Left Edge */}
      <div className={`${styles.atmosphericMass} ${styles.massLeft}`}>
        <div className={styles.massGrain} />
      </div>

      {/* 2. Large Atmospheric Mass — Bottom-Right Edge */}
      <div className={`${styles.atmosphericMass} ${styles.massBottomRight}`}>
        <div className={styles.massGrain} />
      </div>

      {/* ====================================================================
          DEPTH 1.5: Soft Floating Spheres (Shaded physical objects)
          ==================================================================== */}
      {/* Shaded soft physical sphere in upper-right area */}
      <div className={styles.floatingSphereUpperRight} />
      {/* Delicate satellite circle in lower-left periphery */}
      <div className={styles.floatingSphereSubtle} />

      {/* ====================================================================
          DEPTH 2 & 3: Thin Orbital Curves (Depth 2) & Dark Orbit Nodes (Depth 3)
          ==================================================================== */}
      <svg
        className={styles.orbitalSvg}
        viewBox="0 0 1920 1080"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Orbital Curves (Thin, technical, independent trajectories) */}
        <path d={PATH_1_D} className={styles.orbitCurvePrimary} />
        <path d={PATH_2_D} className={styles.orbitCurveSecondary} />
        <path d={PATH_3_D} className={styles.orbitCurveDashed} />
        <path d={PATH_4_D} className={styles.orbitCurveFaint} />

        {/* Depth 3: Black / Graphite Anchor Points (#111111) */}
        {/* Dot 1: Orbiting along Path 1 (28s duration) */}
        <circle r="3.5" className={styles.orbitPointLead}>
          {!shouldReduceMotion ? (
            <animateMotion
              dur="28s"
              repeatCount="indefinite"
              path={PATH_1_D}
              calcMode="linear"
            />
          ) : (
            <set attributeName="cx" to="980" />
          )}
        </circle>

        {/* Dot 2: Orbiting along Path 2 in reverse trajectory (35s duration) */}
        <circle r="4" className={styles.orbitPointSecondary}>
          {!shouldReduceMotion ? (
            <animateMotion
              dur="35s"
              repeatCount="indefinite"
              path={PATH_2_D}
              keyPoints="1;0"
              keyTimes="0;1"
              calcMode="linear"
            />
          ) : (
            <set attributeName="cx" to="1140" />
          )}
        </circle>

        {/* Dot 3: Orbiting along Dashed Path 3 (22s duration) */}
        <circle r="3" className={styles.orbitPointAnchor}>
          {!shouldReduceMotion ? (
            <animateMotion
              dur="22s"
              repeatCount="indefinite"
              path={PATH_3_D}
              calcMode="linear"
            />
          ) : (
            <set attributeName="cx" to="720" />
          )}
        </circle>

        {/* Dot 4: Stationary intentional anchor node pinned to upper-left intersection */}
        <circle cx="520" cy="240" r="4" className={styles.orbitPointAnchor} />

        {/* Dot 5: Stationary intentional anchor node in right quadrant */}
        <circle cx="1640" cy="680" r="2.5" className={styles.orbitPointSubtle} />
      </svg>
    </div>
  );
};

export default AnimatedEditorialBackground;
