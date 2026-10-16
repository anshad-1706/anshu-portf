import React, { useMemo } from "react";
import styles from "./JourneyRoad.module.css";
import { JourneyStop } from "./JourneyStop";
import type { JourneyStopData, StopState } from "./journeyTypes";
import { JOURNEY_STOPS, VIEWPORT_TRAVEL } from "./journeyData";

export interface JourneyRoadProps {
  progress: number; // 0 to 1 smoothed progress
  onOpenDetail?: (stop: JourneyStopData, rect: DOMRect) => void;
  onReturnHome?: () => void;
  className?: string;
}

/**
 * JourneyRoad — Complete Six-Stop Cinematic Curved Road System
 * Renders the graphite road path across an extended 3800px track,
 * anchoring all six stops with dynamic focus states and a terminal Return Home action.
 */
export const JourneyRoad: React.FC<JourneyRoadProps> = ({
  progress,
  onOpenDetail,
  onReturnHome,
  className = "",
}) => {
  const currentYOffset = progress * VIEWPORT_TRAVEL;

  // Compute focus state for each stop based on current viewport optical center (~350px)
  const stopsWithState = useMemo(() => {
    const focusCenterY = 350 + currentYOffset;

    return JOURNEY_STOPS.map((stop) => {
      const dist = stop.yPosition - focusCenterY;
      let state: StopState = "active";

      if (dist > 220) {
        state = "approaching";
      } else if (dist < -260) {
        state = "passed";
      } else {
        state = "active";
      }

      return { stop, state };
    });
  }, [currentYOffset]);

  return (
    <div className={`${styles.roadViewport} ${className}`.trim()} aria-label="Journey Timeline">
      {/* 1. Header label */}
      <div className={styles.journeyHeader} aria-hidden="true">
        <span className={styles.journeyHeaderTag}>MY JOURNEY // 07 CHAPTERS</span>
        <div className={styles.journeyHeaderLine} />
      </div>

      {/* 2. Moving Road Track */}
      <div
        className={styles.roadTrack}
        style={{
          transform: `translate3d(0, ${-currentYOffset}px, 0)`,
        }}
      >
        {/* Soft atmospheric glow */}
        <div className={styles.roadAtmosphere} aria-hidden="true" />

        {/* Cinematic SVG Road Path */}
        <svg
          className={styles.svgLayer}
          viewBox="0 0 800 4400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="roadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.03)" />
              <stop offset="25%" stopColor="rgba(255, 255, 255, 0.22)" />
              <stop offset="75%" stopColor="rgba(255, 255, 255, 0.18)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
            </linearGradient>

            <filter id="roadGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Wide dark road bed */}
          <path
            d="M 400 0 C 400 300, 370 600, 420 900 C 470 1200, 380 1500, 430 1800 C 480 2100, 370 2400, 420 2700 C 470 3000, 380 3300, 430 3600 C 480 3900, 390 4200, 400 4400"
            fill="none"
            stroke="#55555B"
            strokeWidth="54"
            strokeLinecap="round"
          />

          {/* Road edge borders */}
          <path
            d="M 400 0 C 400 300, 370 600, 420 900 C 470 1200, 380 1500, 430 1800 C 480 2100, 370 2400, 420 2700 C 470 3000, 380 3300, 430 3600 C 480 3900, 390 4200, 400 4400"
            fill="none"
            stroke="rgba(60, 60, 66, 0.2)"
            strokeWidth="56"
            strokeDasharray="4 8"
            strokeLinecap="round"
          />

          {/* Core luminescent lane */}
          <path
            d="M 400 0 C 400 300, 370 600, 420 900 C 470 1200, 380 1500, 430 1800 C 480 2100, 370 2400, 420 2700 C 470 3000, 380 3300, 430 3600 C 480 3900, 390 4200, 400 4400"
            fill="none"
            stroke="rgba(165, 165, 175, 0.25)"
            strokeWidth="3.5"
          />

          {/* Dashed center guidance track */}
          <path
            d="M 400 0 C 400 300, 370 600, 420 900 C 470 1200, 380 1500, 430 1800 C 480 2100, 370 2400, 420 2700 C 470 3000, 380 3300, 430 3600 C 480 3900, 390 4200, 400 4400"
            fill="none"
            stroke="#B0B0B8"
            strokeWidth="1.5"
            strokeDasharray="12 16"
          />
        </svg>

        {/* 3. Physical Journey Stops */}
        <div className={styles.stopsContainer}>
          {stopsWithState.map(({ stop, state }, index) => (
            <JourneyStop
              key={stop.id}
              stop={stop}
              index={index}
              state={state}
              onOpenDetail={onOpenDetail}
            />
          ))}

          {/* 4. Terminal Return Home Node at end of the journey */}
          <div className={styles.terminalNode}>
            <div className={styles.terminalMarker} aria-hidden="true" />
            <button
              type="button"
              className={styles.terminalButton}
              onClick={onReturnHome}
              aria-label="Return home to main portfolio"
            >
              <span>RETURN HOME</span>
              <svg
                viewBox="0 0 24 24"
                className={styles.terminalIcon}
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indicator prompt beside the road (FIX 05) */}
      <div
        className={styles.scrollHint}
        style={{ opacity: progress > 0.92 ? 0 : 0.88 }}
        aria-hidden="true"
      >
        <span className={styles.scrollHintText}>SCROLL TO EXPLORE</span>
        <svg className={styles.scrollHintArrow} viewBox="0 0 24 24" strokeWidth="2.4">
          <polyline points="7 10 12 15 17 10" />
        </svg>
      </div>
    </div>
  );
};

export default JourneyRoad;
