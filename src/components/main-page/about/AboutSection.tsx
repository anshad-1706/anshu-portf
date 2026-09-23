import React, { useMemo } from "react";
import styles from "./AboutSection.module.css";

export interface AboutSectionProps {
  exitProgress: number; // 0 to 1
  className?: string;
}

/**
 * Computes opacity, blur filter, and translateY from normalized exitProgress
 * Suggested mapping:
 * 0.00 -> opacity 0
 * 0.20 -> About begins appearing
 * 0.50 -> About becomes readable
 * 0.75 -> About mostly established
 * 1.00 -> About fully established
 */
function computeAboutStyles(progress: number) {
  const p = Math.max(0, Math.min(1, progress));

  if (p <= 0.2) {
    return {
      opacity: 0,
      filter: "blur(14px)",
      transform: "translateY(22px)",
      isVisible: false,
    };
  }

  let opacity = 0;
  let blurPx = 14;
  let translateY = 22;

  if (p <= 0.5) {
    const t = (p - 0.2) / 0.3; // 0 -> 1
    opacity = t * 0.45;
    blurPx = 14 - t * 8; // 14 -> 6
    translateY = 22 - t * 11; // 22 -> 11
  } else if (p <= 0.75) {
    const t = (p - 0.5) / 0.25; // 0 -> 1
    opacity = 0.45 + t * 0.4; // 0.45 -> 0.85
    blurPx = 6 - t * 4.5; // 6 -> 1.5
    translateY = 11 - t * 7; // 11 -> 4
  } else {
    const t = (p - 0.75) / 0.25; // 0 -> 1
    opacity = 0.85 + t * 0.15; // 0.85 -> 1.0
    blurPx = 1.5 - t * 1.5; // 1.5 -> 0
    translateY = 4 - t * 4; // 4 -> 0
  }

  return {
    opacity: Number(opacity.toFixed(3)),
    filter: blurPx <= 0.2 ? "none" : `blur(${blurPx.toFixed(1)}px)`,
    transform: `translateY(${translateY.toFixed(1)}px)`,
    isVisible: opacity > 0.02,
  };
}

/**
 * AboutSection — Phase 06
 * The next chapter of the narrative continuing after P1–P3.
 * Fades in seamlessly as the portrait dissolves between frames 77 and 130.
 */
export const AboutSection: React.FC<AboutSectionProps> = ({
  exitProgress,
  className = "",
}) => {
  const { opacity, filter, transform, isVisible } = useMemo(
    () => computeAboutStyles(exitProgress),
    [exitProgress]
  );

  return (
    <section
      id="about"
      className={`${styles.aboutContainer} ${className}`.trim()}
      style={{
        visibility: isVisible ? "visible" : "hidden",
        pointerEvents: opacity >= 0.7 ? "auto" : "none",
      }}
      aria-label="About Anshad"
      aria-hidden={!isVisible}
    >
      <div
        className={styles.aboutWrapper}
        style={{
          opacity,
          filter,
          transform,
        }}
      >
        <span className={styles.eyebrow} aria-hidden="true">
          ABOUT / 01
        </span>
        <h2 className={styles.heading}>
          Turning complex problems into elegant, living systems.
        </h2>
        <div className={styles.body}>
          <p>
            I'm an Information Technology student and developer working across
            software architecture, AI automation, and tactile product design.
          </p>
          <p>
            Driven by craftsmanship and engineering precision, I build software that
            bridges deep computational logic with restrained, editorial interfaces.
          </p>
        </div>
        <div className={styles.metaRow}>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>DISCIPLINE</span>
            <span className={styles.metaValue}>Software Architecture · AI · Interfaces</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>LOCATION</span>
            <span className={styles.metaValue}>Kerala, India · Remote</span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>STATUS</span>
            <span className={styles.metaValue}>Available for Inquiries</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
