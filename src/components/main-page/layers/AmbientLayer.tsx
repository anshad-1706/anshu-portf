import React from "react";
import styles from "./layers.module.css";

/**
 * AmbientLayer — Structural placeholder for ambient lighting / atmosphere
 */
export const AmbientLayer: React.FC = () => {
  return (
    <div
      className={`${styles.layerBase} ${styles.ambientLayer}`}
      data-layer="ambient"
      aria-hidden="true"
    />
  );
};

export default AmbientLayer;
