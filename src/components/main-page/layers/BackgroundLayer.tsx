import { useReducedMotion } from "framer-motion";
import styles from "./layers.module.css";
import { AnimatedEditorialBackground } from "../background";

export interface BackgroundLayerProps {
  children?: React.ReactNode;
  className?: string;
  isHomeVisible?: boolean;
}

/**
 * BackgroundLayer — Phase 07 Animated Editorial Background
 * Holds the background atmosphere layer (z-index: 1) behind all foreground layers.
 * Houses the AnimatedEditorialBackground with subtle orbital paths, soft atmospheric fields,
 * floating geometric rings, and fine monochrome grain.
 * Synchronized with the Home entrance timeline at T+0ms.
 */
export const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
  children,
  className = "",
  isHomeVisible = true,
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <div
      className={`${styles.layerBase} ${styles.backgroundLayer} ${className}`.trim()}
      data-layer="background"
      aria-hidden="true"
      style={{
        opacity: isHomeVisible ? 1 : 0,
        visibility: isHomeVisible ? "visible" : "hidden",
        transition: shouldReduceMotion
          ? "none"
          : "opacity 750ms cubic-bezier(0.16, 1, 0.3, 1), visibility 750ms",
      }}
    >
      {children || <AnimatedEditorialBackground />}
    </div>
  );
};

export default BackgroundLayer;
