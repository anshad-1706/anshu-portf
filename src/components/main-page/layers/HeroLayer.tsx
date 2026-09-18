import React from "react";
import styles from "./layers.module.css";

interface HeroLayerProps {
  children?: React.ReactNode;
}

/**
 * HeroLayer — Structural placeholder for central hero & portrait coordinates
 */
export const HeroLayer: React.FC<HeroLayerProps> = ({ children }) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.heroLayer}`}
      data-layer="hero"
    >
      <div className={styles.heroAnchor} data-anchor="hero">
        {children}
      </div>
    </div>
  );
};

export default HeroLayer;
