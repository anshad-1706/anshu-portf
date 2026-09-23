import React from "react";
import styles from "./layers.module.css";
import { AnimatedEditorialBackground } from "../background";

export interface BackgroundLayerProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * BackgroundLayer — Phase 07 Animated Editorial Background
 * Holds the background atmosphere layer (z-index: 1) behind all foreground layers.
 * Houses the AnimatedEditorialBackground with subtle orbital paths, soft atmospheric fields,
 * floating geometric rings, and fine monochrome grain.
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  children,
  className = "",
}) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.backgroundLayer} ${className}`.trim()}
      data-layer="background"
      aria-hidden="true"
    >
      {children || <AnimatedEditorialBackground />}
    </div>
  );
};

export default BackgroundLayer;
