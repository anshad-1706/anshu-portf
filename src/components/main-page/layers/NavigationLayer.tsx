import React from "react";
import styles from "./layers.module.css";
import { FloatingNav } from "../navigation";

interface NavigationLayerProps {
  brandNode?: React.ReactNode;
  navNode?: React.ReactNode;
}

/**
 * NavigationLayer — Structural coordinates for top branding (top-left) and navigation (strictly top-center)
 */
export const NavigationLayer: React.FC<NavigationLayerProps> = ({
  brandNode,
  navNode,
}) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.navigationLayer}`}
      data-layer="navigation"
    >
      {/* Branding anchor (ANSHAD) */}
      <div className={styles.brandAnchor} data-anchor="brand">
        {brandNode}
      </div>

      {/* Navigation anchor strictly top-center on desktop */}
      <div className={styles.navAnchor} data-anchor="nav">
        {navNode || <FloatingNav />}
      </div>
    </div>
  );
};

export default NavigationLayer;
