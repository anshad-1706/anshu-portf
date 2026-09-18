import React from "react";
import styles from "./layers.module.css";

/**
 * BackgroundLayer — Structural placeholder for canvas background
 */
export const BackgroundLayer: React.FC = () => {
  return (
    <div
      className={`${styles.layerBase} ${styles.backgroundLayer}`}
      data-layer="background"
      aria-hidden="true"
    />
  );
};

export default BackgroundLayer;
