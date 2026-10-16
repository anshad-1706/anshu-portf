import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import styles from "./layers.module.css";
import { CustomCursor } from "../../cursor";

interface CursorLayerProps {
  children?: React.ReactNode;
}

const emptySubscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * CursorLayer — Structural overlay containing the custom 2D/3D graphite cursor.
 * Portaled directly to document.body at z-index 100000 so it sits above all
 * modal portals, backdrops, blurs, and animations across every journey detail view.
 * Strictly pointer-events: none to guarantee zero interference with interactive elements.
 */
export const CursorLayer: React.FC<CursorLayerProps> = ({ children }) => {
  const isClient = useSyncExternalStore(emptySubscribe, getSnapshot, getServerSnapshot);

  if (!isClient || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={`${styles.layerBase} ${styles.cursorLayer}`}
      data-layer="cursor"
      aria-hidden="true"
    >
      <CustomCursor />
      {children}
    </div>,
    document.body
  );
};

export default CursorLayer;
