import React from "react";
import styles from "./layers.module.css";
import { CustomCursor } from "../../cursor";

interface CursorLayerProps {
  children?: React.ReactNode;
}

/**
 * CursorLayer — Structural overlay containing the custom 3D cursor.
 * Strictly pointer-events: none to guarantee zero interference with interactive layers.
 */
export const CursorLayer: React.FC<CursorLayerProps> = ({ children }) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.cursorLayer}`}
      data-layer="cursor"
      aria-hidden="true"
    >
      <CustomCursor />
      {children}
    </div>
  );
};

export default CursorLayer;
