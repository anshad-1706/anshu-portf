import React from "react";
import styles from "./layers.module.css";

interface SocialLayerProps {
  children?: React.ReactNode;
}

/**
 * SocialLayer — Future main-page spatial region anchor only.
 * Does not modify, relocate, replace, or duplicate the locked Scene 04 FloatingContactNav.
 */
export const SocialLayer: React.FC<SocialLayerProps> = ({ children }) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.socialLayer}`}
      data-layer="social"
    >
      <div className={styles.socialAnchor} data-anchor="social">
        {children}
      </div>
    </div>
  );
};

export default SocialLayer;
