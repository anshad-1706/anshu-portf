import React from "react";
import styles from "./layers.module.css";

export interface FocusBlurLayerProps {
  isBlurred?: boolean;
}

/**
 * FocusBlurLayer — Phase 06.1
 * Separate background focus blur layer sitting immediately behind ProjectLayer (z-index: 45).
 * When ProjectFileHub begins opening: 0px -> 8px blur progressive reveal with cubic-bezier(0.16, 1, 0.3, 1).
 * When closing: 8px -> 0px blur return.
 * The ProjectFileHub and all 3 ProjectCards remain sharp at z-index: 60.
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
