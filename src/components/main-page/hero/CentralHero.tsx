import React, { useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./CentralHero.module.css";

export interface CentralHeroProps {
  isHomeVisible: boolean;
  className?: string;
}

const LETTERS = ["A", "N", "S", "H", "A", "D"] as const;

interface CharBound {
  cx: number;
  cy: number;
  width: number;
  height: number;
}

/**
 * CentralHero — Phase 07.7
 * The central Home visual containing:
 * Level 1: ANSHAD in Akira Expanded Demo font with localized cursor compression
 *          and subtle bottom fade/dissolve (Phase 07.6).
 * Level 2: "Currently an Information Technology Student" editorial subtitle
 *
 * Restrained cinematic entrance: opacity 0 -> 1, blur -> 0, translateY 8px -> 0.
 * Local cursor interaction: subtle vertical compression (max 5-7%) following cursor proximity.
 */
export const CentralHero: React.FC<CentralHeroProps> = ({
  isHomeVisible,
  className = "",
}) => {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const boundsRef = useRef<CharBound[]>([]);
  const targetsRef = useRef<number[]>([1, 1, 1, 1, 1, 1]);
  const currentsRef = useRef<number[]>([1, 1, 1, 1, 1, 1]);
  const isHoveredRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  const measureBounds = useCallback(() => {
    if (!headingRef.current) return;
    boundsRef.current = letterRefs.current.map((el) => {
      if (!el) return { cx: 0, cy: 0, width: 0, height: 0 };
      const r = el.getBoundingClientRect();
      return {
        cx: r.left + r.width / 2,
        cy: r.top + r.height / 2,
        width: r.width,
        height: r.height,
      };
    });
  }, []);

  const startAnimationLoop = useCallback(() => {
    if (rafIdRef.current !== null) return;

    const tick = () => {
      let activeDiff = false;
      const targets = targetsRef.current;
      const currents = currentsRef.current;

      for (let i = 0; i < LETTERS.length; i++) {
        const diff = targets[i] - currents[i];
        if (Math.abs(diff) > 0.0005) {
          // Smooth 0.20 interpolation (within recommended 0.12–0.22 smoothing range)
          currents[i] += diff * 0.20;
          activeDiff = true;
        } else {
          currents[i] = targets[i];
        }

        const span = letterRefs.current[i];
        if (span) {
          if (currents[i] >= 0.999 && !isHoveredRef.current) {
            span.style.transform = "";
          } else {
            span.style.transform = `scaleY(${currents[i].toFixed(4)})`;
          }
        }
      }

      if (activeDiff || isHoveredRef.current) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLHeadingElement>) => {
      if (shouldReduceMotion) return;
      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) {
        return;
      }

      if (boundsRef.current.length === 0 || boundsRef.current[0].width === 0) {
        measureBounds();
      }

      const bounds = boundsRef.current;
      if (bounds.length === 0) return;

      const cursorX = e.clientX;
      const cursorY = e.clientY;

      for (let i = 0; i < LETTERS.length; i++) {
        const char = bounds[i];
        if (!char || char.width === 0) continue;

        const dx = Math.abs(cursorX - char.cx);
        const dy = Math.abs(cursorY - char.cy);

        // Effective distance with gentle vertical weighting
        const dist = Math.hypot(dx, dy * 1.35);

        // Radius proportional to character width (~1.55x character width, min 85px)
        const radius = Math.max(85, char.width * 1.55);

        if (dist >= radius) {
          targetsRef.current[i] = 1;
        } else {
          const t = dist / radius;
          // Smooth bell curve with zero boundary derivative: (1 - t^2)^2
          const influence = Math.pow(1 - t * t, 2);
          // Max compression: 11% (scaleY = 0.89)
          targetsRef.current[i] = 1 - 0.11 * influence;
        }
      }

      startAnimationLoop();
    },
    [measureBounds, shouldReduceMotion, startAnimationLoop]
  );

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLHeadingElement>) => {
      if (shouldReduceMotion) return;
      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(hover: hover) and (pointer: fine)").matches
      ) {
        return;
      }
      isHoveredRef.current = true;
      measureBounds();
      handlePointerMove(e);
    },
    [handlePointerMove, measureBounds, shouldReduceMotion]
  );

  const handlePointerLeave = useCallback(() => {
    isHoveredRef.current = false;
    for (let i = 0; i < LETTERS.length; i++) {
      targetsRef.current[i] = 1;
    }
    startAnimationLoop();
  }, [startAnimationLoop]);

  useEffect(() => {
    const handleResize = () => {
      measureBounds();
    };
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [measureBounds]);

  return (
    <div
      className={`${styles.heroContainer} ${className}`.trim()}
      aria-label="Anshad — Identity"
    >
      <div className={styles.headingAnchor}>
        <h1
          ref={headingRef}
          className={`${styles.nameHeading} ${
            isHomeVisible ? styles.nameVisible : styles.nameHidden
          }`}
          aria-label="ANSHAD"
          onPointerEnter={handlePointerEnter}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <span className={styles.characterContainer} aria-hidden="true">
            {LETTERS.map((char, index) => (
              <span
                key={index}
                ref={(el) => {
                  letterRefs.current[index] = el;
                }}
                className={styles.charSpan}
              >
                {char}
              </span>
            ))}
          </span>
          <span className={styles.srOnly}>ANSHAD</span>
        </h1>
        <p
          className={`${styles.subtitle} ${
            isHomeVisible ? styles.subtitleVisible : styles.subtitleHidden
          }`}
        >
          Currently an Information Technology Student
        </p>
      </div>
    </div>
  );
};

export default CentralHero;
