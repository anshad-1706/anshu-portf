import React from "react";
import styles from "./layers.module.css";

export interface FocusBlurLayerProps {
  isBlurred?: boolean;
}

/**
 * FocusBlurLayer — Phase 06.2
 * Separate background focus de-emphasis layer sitting immediately behind ProjectLayer (z-index: 45).
 * When ProjectFileHub opens: 0px -> 5px blur (3px on mobile) subtle softening with cubic-bezier(0.16, 1, 0.3, 1).
 * When closing: 5px -> 0px blur return.
 * The ProjectFileHub and all 3 ProjectCards remain completely sharp at z-index: 60.
 */
export const FocusBlurLayer: React.FC<FocusBlurLayerProps> = ({
  isBlurred = false,
}) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.focusBlurLayer} ${
        isBlurred ? styles.focusBlurActive : ""
      }`}
      data-layer="focus-blur"
      aria-hidden="true"
    />
  );
};

export default FocusBlurLayer;
