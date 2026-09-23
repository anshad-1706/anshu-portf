import React from "react";
import styles from "./layers.module.css";
import { SocialControls } from "../social";

export interface SocialLayerProps {
  children?: React.ReactNode;
}

/**
 * SocialLayer — Phase 04
 * Secondary personal identity/control layer of the Main Page.
 * Owns SocialControls in the bottom-left spatial region (z-index: 20).
 * Does not modify, relocate, replace, or duplicate the locked Scene 04 FloatingContactNav.
 */
export const SocialLayer: React.FC<SocialLayerProps> = ({ children }) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.socialLayer}`}
      data-layer="social"
    >
      <div className={styles.socialAnchor} data-anchor="social">
        {children || <SocialControls />}
      </div>
    </div>
  );
};

export default SocialLayer;
