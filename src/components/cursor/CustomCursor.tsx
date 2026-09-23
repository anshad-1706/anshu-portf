import React, { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";
import { CursorBody } from "./CursorBody";

// Calibrated visual pivot offset within the 22x22px geometry
const PIVOT_X = 10;
const PIVOT_Y = 11;

// Starting movement threshold in px to filter micro-jitter while tracking slow deliberate movement
const MOVEMENT_THRESHOLD = 0.8;

/**
 * CustomCursor — Refined 2D Directional Physical Cursor
 * Desktop-only custom graphite cursor with rAF-driven continuous 360°
 * directional orientation, shortest-path angular interpolation, and
 * physical inertia while strictly preserving the last meaningful direction when stationary.
 */
export const CustomCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Position coordinates (raw target vs smooth rendered)
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const prevMovePos = useRef({ x: -100, y: -100 });

  // 2D continuous orientation angles in degrees (-180° to 180°)
  // Base calibration: 0° points horizontally RIGHT (+X)
  const targetAngle = useRef(0);
  const currentAngle = useRef(0);

  // Lifecycle & loop refs
  const rafId = useRef<number | null>(null);
  const isLoopRunning = useRef(false);
  const isPointerInside = useRef(false);
  const isFirstMove = useRef(true);

  useEffect(() => {
    // 1. Desktop verification: only activate for fine pointer with hover capability
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!mediaQuery.matches) {
      return;
    }

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    // Apply global class to hide default cursor
    document.documentElement.classList.add("has-custom-cursor");

    // LERP helper
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor;

    // Shortest-path angular delta calculator (handles -180° / 180° wrap seamlessly)
    const getShortestAngleDelta = (target: number, current: number): number => {
      let delta = (target - current) % 360;
      if (delta < -180) delta += 360;
      if (delta > 180) delta -= 360;
      return delta;
    };

    // Animation loop (runs during movement and through smooth settling)
    const updateMotion = () => {
      const isReduced = reducedMotionQuery.matches;

      if (isReduced) {
        // Direct tracking with instant functional directional orientation (no decorative lag)
        currentPos.current.x = targetPos.current.x;
        currentPos.current.y = targetPos.current.y;
        currentAngle.current = targetAngle.current;
      } else {
        // Weighted, responsive position interpolation
        currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.25);
        currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.25);

        // Shortest-path angular interpolation with subtle physical inertia
        const angleDelta = getShortestAngleDelta(
          targetAngle.current,
          currentAngle.current
        );
        currentAngle.current += angleDelta * 0.20;

        // Keep currentAngle bounded in [-180, 180]
        currentAngle.current =
          (((currentAngle.current + 180) % 360) + 360) % 360 - 180;
      }

      // Apply transforms directly to DOM refs to avoid React re-render overhead
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${(currentPos.current.x - PIVOT_X).toFixed(2)}px, ${(currentPos.current.y - PIVOT_Y).toFixed(2)}px, 0)`;
      }

      if (bodyRef.current) {
        bodyRef.current.style.transform = `rotate(${currentAngle.current.toFixed(2)}deg)`;
      }

      // Settling check: evaluate positional distance and angular delta
      const posDelta = Math.hypot(
        targetPos.current.x - currentPos.current.x,
        targetPos.current.y - currentPos.current.y
      );
      const angleDelta = Math.abs(
        getShortestAngleDelta(targetAngle.current, currentAngle.current)
      );

      // Once position and angle have smoothly settled:
      if (posDelta < 0.1 && angleDelta < 0.1) {
        currentPos.current.x = targetPos.current.x;
        currentPos.current.y = targetPos.current.y;
        currentAngle.current = targetAngle.current;

        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(${(currentPos.current.x - PIVOT_X).toFixed(2)}px, ${(currentPos.current.y - PIVOT_Y).toFixed(2)}px, 0)`;
        }
        if (bodyRef.current) {
          bodyRef.current.style.transform = `rotate(${currentAngle.current.toFixed(2)}deg)`;
        }

        // Suspend rAF loop while strictly preserving targetAngle & currentAngle
        isLoopRunning.current = false;
        rafId.current = null;
        return;
      }

      // Continue motion loop until fully settled
      rafId.current = requestAnimationFrame(updateMotion);
    };

    const startLoopIfNeeded = () => {
      if (!isLoopRunning.current) {
        isLoopRunning.current = true;
        rafId.current = requestAnimationFrame(updateMotion);
      }
    };

    // Pointer move listener: tracks 2D movement vector dx & dy
    const onPointerMove = (e: PointerEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (isFirstMove.current) {
        currentPos.current.x = e.clientX;
        currentPos.current.y = e.clientY;
        prevMovePos.current.x = e.clientX;
        prevMovePos.current.y = e.clientY;
        isFirstMove.current = false;
      }

      // Reveal cursor once active pointer coordinates exist
      if (!isPointerInside.current) {
        isPointerInside.current = true;
        containerRef.current?.classList.add(styles.visible);
        document.documentElement.classList.add("has-custom-cursor");
      }

      // Compute full 2D movement vector
      const dx = e.clientX - prevMovePos.current.x;
      const dy = e.clientY - prevMovePos.current.y;
      const dist = Math.hypot(dx, dy);

      // Check against threshold to prevent jitter on microscopic vibrations,
      // while remaining responsive to slow deliberate movement
      if (dist >= MOVEMENT_THRESHOLD) {
        // Calculate continuous 2D angle (atan2 yields radians in [-PI, PI])
        // With SVG calibrated horizontally pointing right, atan2 maps:
        // 0° = Right, 90° = Down, 180° = Left, -90° = Up
        const angleRad = Math.atan2(dy, dx);
        targetAngle.current = (angleRad * 180) / Math.PI;

        prevMovePos.current.x = e.clientX;
        prevMovePos.current.y = e.clientY;
      }

      // Trigger rAF loop
      startLoopIfNeeded();
    };

    // Viewport boundary handlers
    const onMouseLeave = () => {
      isPointerInside.current = false;
      containerRef.current?.classList.remove(styles.visible);
      document.documentElement.classList.remove("has-custom-cursor");
    };

    const onMouseEnter = () => {
      isPointerInside.current = true;
      containerRef.current?.classList.add(styles.visible);
      document.documentElement.classList.add("has-custom-cursor");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      document.documentElement.classList.remove("has-custom-cursor");
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={styles.cursorContainer}
      aria-hidden="true"
    >
      <div ref={bodyRef} className={styles.cursorBodyWrapper}>
        <CursorBody />
      </div>
    </div>
  );
};

export default CustomCursor;
