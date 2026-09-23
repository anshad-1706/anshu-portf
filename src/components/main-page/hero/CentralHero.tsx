import React from "react";
import styles from "./CentralHero.module.css";

export interface CentralHeroProps {
  isHomeVisible: boolean;
  className?: string;
}

/**
 * CentralHero — Phase 07.2
 * The central Home visual containing:
 * Level 1: ANSHAD in Akira Expanded Demo font
 * Level 2: "Currently an Information Technology Student" editorial subtitle
 *
 * Restrained cinematic entrance: opacity 0 -> 1, blur -> 0, translateY 6px -> 0.
 */
export const CentralHero: React.FC<CentralHeroProps> = ({
  isHomeVisible,
  className = "",
}) => {
  return (
    <div
      className={`${styles.heroContainer} ${className}`.trim()}
      aria-label="Anshad — Identity"
    >
      <div className={styles.headingAnchor}>
        <h1
          className={`${styles.nameHeading} ${
            isHomeVisible ? styles.nameVisible : styles.nameHidden
          }`}
        >
          ANSHAD
        </h1>
        <p
          className={`${styles.subtitle} ${
            isHomeVisible ? styles.subtitleVisible : styles.subtitleHidden
          }`}
        >
          Currently an Information Technology Student
        </p>
      </div>
    </div>
  );
};

export default CentralHero;
