import React, { useEffect, useRef } from "react";
import styles from "./Cursor.module.css";
import { CursorBody } from "./CursorBody";

/**
 * CustomCursor — Phase 01 Implementation
 * Desktop-only custom 3D graphite cursor with rAF-driven inertia,
 * velocity tilt, and non-oscillating settling physics.
 */
export const CustomCursor: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Position coordinates (raw target vs smooth rendered)
  const targetPos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const prevTargetPos = useRef({ x: -100, y: -100 });

  // 3D tilt rotation states (degrees)
  const currentTilt = useRef({ x: 0, y: 0, z: 0 });
  const targetTilt = useRef({ x: 0, y: 0, z: 0 });

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

    // Animation loop (runs during movement and through settling frames)
    const updateMotion = () => {
      const isReduced = reducedMotionQuery.matches;

      if (isReduced) {
        // Direct tracking with zero tilt for reduced motion
        currentPos.current.x = targetPos.current.x;
        currentPos.current.y = targetPos.current.y;
        currentTilt.current = { x: 0, y: 0, z: 0 };
      } else {
        // Organic exponential interpolation for position
        currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.22);
        currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.22);

        // Smooth decay of tilt toward target tilt (approx 160ms settling curve)
        currentTilt.current.x = lerp(currentTilt.current.x, targetTilt.current.x, 0.16);
        currentTilt.current.y = lerp(currentTilt.current.y, targetTilt.current.y, 0.16);
        currentTilt.current.z = lerp(currentTilt.current.z, targetTilt.current.z, 0.16);
      }

      // Apply transforms directly to DOM refs to avoid React re-render overhead
      if (containerRef.current) {
        containerRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0)`;
      }

      if (bodyRef.current) {
        bodyRef.current.style.transform = `perspective(600px) rotateX(${currentTilt.current.x.toFixed(2)}deg) rotateY(${currentTilt.current.y.toFixed(2)}deg) rotateZ(${currentTilt.current.z.toFixed(2)}deg)`;
      }

      // Settling check: distance and angular delta
      const dx = Math.abs(targetPos.current.x - currentPos.current.x);
      const dy = Math.abs(targetPos.current.y - currentPos.current.y);
      const dt =
        Math.abs(currentTilt.current.x) +
        Math.abs(currentTilt.current.y) +
        Math.abs(currentTilt.current.z);

      // Once motion has completed and angles have returned to neutral:
      if (dx < 0.15 && dy < 0.15 && dt < 0.15) {
        // Lock to exact position and zero rotation
        currentPos.current.x = targetPos.current.x;
        currentPos.current.y = targetPos.current.y;
        currentTilt.current = { x: 0, y: 0, z: 0 };

        if (containerRef.current) {
          containerRef.current.style.transform = `translate3d(${currentPos.current.x.toFixed(2)}px, ${currentPos.current.y.toFixed(2)}px, 0)`;
        }
        if (bodyRef.current) {
          bodyRef.current.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)";
        }

        // Suspend rAF loop until next pointermove
        isLoopRunning.current = false;
        rafId.current = null;
        return;
      }

      // Continue settling loop
      rafId.current = requestAnimationFrame(updateMotion);
    };

    const startLoopIfNeeded = () => {
      if (!isLoopRunning.current) {
        isLoopRunning.current = true;
        rafId.current = requestAnimationFrame(updateMotion);
      }
    };

    // Pointer move listener
    const onPointerMove = (e: PointerEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      if (isFirstMove.current) {
        currentPos.current.x = e.clientX;
        currentPos.current.y = e.clientY;
        prevTargetPos.current.x = e.clientX;
        prevTargetPos.current.y = e.clientY;
        isFirstMove.current = false;
      }

      // Make visible when pointer is active
      if (!isPointerInside.current) {
        isPointerInside.current = true;
        containerRef.current?.classList.add(styles.visible);
        document.documentElement.classList.add("has-custom-cursor");
      }

      // Compute velocity vectors
      const vx = e.clientX - prevTargetPos.current.x;
      const vy = e.clientY - prevTargetPos.current.y;
      prevTargetPos.current.x = e.clientX;
      prevTargetPos.current.y = e.clientY;

      // Calculate directional tilt angles based on velocity
      // Horizontal velocity rolls along Y-axis; Vertical pitches along X-axis
      const rollY = Math.min(Math.max(vx * 0.55, -14), 14);
      const pitchX = Math.min(Math.max(-vy * 0.55, -14), 14);
      const bankZ = Math.min(Math.max(vx * 0.22, -8), 8);

      targetTilt.current = { x: pitchX, y: rollY, z: bankZ };

      // Ensure the loop runs
      startLoopIfNeeded();
    };

    // When pointer stops moving in the window:
    // Reset target tilt to neutral so it smoothly decays back within 150–200ms
    let stopTimer: number | null = null;
    const onPointerMoveWithStopDetection = (e: PointerEvent) => {
      onPointerMove(e);

      if (stopTimer !== null) {
        clearTimeout(stopTimer);
      }
      stopTimer = window.setTimeout(() => {
        targetTilt.current = { x: 0, y: 0, z: 0 };
      }, 40);
    };

    // Viewport boundary detection
    const onMouseLeave = () => {
      isPointerInside.current = false;
      containerRef.current?.classList.remove(styles.visible);
      document.documentElement.classList.remove("has-custom-cursor");
      targetTilt.current = { x: 0, y: 0, z: 0 };
    };

    const onMouseEnter = () => {
      isPointerInside.current = true;
      containerRef.current?.classList.add(styles.visible);
      document.documentElement.classList.add("has-custom-cursor");
    };

    window.addEventListener("pointermove", onPointerMoveWithStopDetection, {
      passive: true,
    });
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("pointermove", onPointerMoveWithStopDetection);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      document.documentElement.classList.remove("has-custom-cursor");
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
      if (stopTimer !== null) {
        clearTimeout(stopTimer);
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
