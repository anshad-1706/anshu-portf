import React from "react";
import styles from "./layers.module.css";
import { HangingIdCard, type HangingIdCardProps } from "../../about-discovery";

export interface AboutDiscoveryLayerProps extends HangingIdCardProps {
  className?: string;
}

export const AboutDiscoveryLayer: React.FC<AboutDiscoveryLayerProps> = ({
  isHomeStable,
  isAboutActive,
  forceTrigger,
  onAboutRequested,
  className = "",
}) => {
  return (
    <div
      className={`${styles.layerBase} ${styles.aboutDiscoveryLayer} ${className}`.trim()}
      data-layer="about-discovery"
    >
      <HangingIdCard
        isHomeStable={isHomeStable}
        isAboutActive={isAboutActive}
        forceTrigger={forceTrigger}
        onAboutRequested={onAboutRequested}
      />
    </div>
  );
};

export default AboutDiscoveryLayer;
