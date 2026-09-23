import React from "react";
import styles from "./CentralHero.module.css";

export interface CentralHeroProps {
  isHomeVisible: boolean;
  className?: string;
}

/**
 * CentralHero — Phase 06
 * The central Home visual containing ANSHAD in Akira Expanded Demo font.
 * Restrained cinematic entrance: opacity 0 -> 1, blur 12px -> 0, scale 0.97 -> 1, translateY 8px -> 0.
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
      <h1
        className={`${styles.nameHeading} ${
          isHomeVisible ? styles.nameVisible : styles.nameHidden
        }`}
      >
        ANSHAD
      </h1>
    </div>
  );
};

export default CentralHero;
