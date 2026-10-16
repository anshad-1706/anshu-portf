import React, { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./AboutPage.module.css";
import { AboutIdentity } from "./AboutIdentity";
import { JourneyRoad, BeginningDetailView, type JourneyStopData } from "./journey";

export interface AboutPageProps {
  currentFrame: number;
  onReturnHome?: () => void;
  className?: string;
}

/**
 * AboutPage — Complete Seven-Stop Journey Experience
 * LEFT: Permanent, fixed Identity Panel (Holding Frame 76 portrait)
 * RIGHT: Cinematic, scrollable Journey Road (Moving 7 stops)
 * OVERLAY: Centered macOS Genie-inspired BeginningDetailView (supporting all stops)
 */
export const AboutPage: React.FC<AboutPageProps> = ({
  currentFrame,
  onReturnHome,
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const [smoothedProgress, setSmoothedProgress] = useState<number>(0);
  const [activeDetailStop, setActiveDetailStop] = useState<JourneyStopData | null>(null);
  const [detailOriginRect, setDetailOriginRect] = useState<DOMRect | null>(null);

  // lastRenderedStop is state (not a ref) so it is safe to read during render.
  // It retains the previous stop object while the closing animation plays.
  const [lastRenderedStop, setLastRenderedStop] = useState<JourneyStopData | null>(null);

  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // isDetailOpenRef — mutable flag readable inside event-listener closures without stale state.
  // Updated inside an effect (not during render) to satisfy the react(refs) lint rule.
  const isDetailOpenRef = useRef<boolean>(false);

  // Sync the ref with state in an effect so event listeners always see the latest value.
  useEffect(() => {
    isDetailOpenRef.current = Boolean(activeDetailStop);
  }, [activeDetailStop]);

  // Smooth lerp loop for journey road scroll
  const startSmoothLoop = useCallback(() => {
    if (rafRef.current !== null) return;

    const tick = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;

      if (Math.abs(diff) > 0.0005) {
        currentProgressRef.current += diff * 0.12;
        const clamped = Math.max(0, Math.min(1, currentProgressRef.current));
        setSmoothedProgress(clamped);
        rafRef.current = requestAnimationFrame(tick);
      } else {
        currentProgressRef.current = targetProgressRef.current;
        setSmoothedProgress(targetProgressRef.current);
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // Listen to wheel / touch gestures on the About Page
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      // Lock journey input while detail view is open
      if (isDetailOpenRef.current) {
        e.preventDefault();
        return;
      }

      // Prevent default page bounce and drive journey progress
      e.preventDefault();
      const delta = e.deltaY / 2800;

      if (shouldReduceMotion) {
        const nextP = Math.max(0, Math.min(1, targetProgressRef.current + delta));
        targetProgressRef.current = nextP;
        currentProgressRef.current = nextP;
        setSmoothedProgress(nextP);
        return;
      }

      targetProgressRef.current = Math.max(
        0,
        Math.min(1, targetProgressRef.current + delta)
      );
      startSmoothLoop();
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Lock journey input while detail view is open
      if (isDetailOpenRef.current) {
        e.preventDefault();
        return;
      }

      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // positive = swipe up = scroll down
      touchStartY = currentY;

      const delta = deltaY / 1900;

      if (shouldReduceMotion) {
        const nextP = Math.max(0, Math.min(1, targetProgressRef.current + delta));
        targetProgressRef.current = nextP;
        currentProgressRef.current = nextP;
        setSmoothedProgress(nextP);
        return;
      }

      targetProgressRef.current = Math.max(
        0,
        Math.min(1, targetProgressRef.current + delta)
      );
      startSmoothLoop();
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [shouldReduceMotion, startSmoothLoop]);

  // Open the full detail view — capture the stop and its physical screen bounds
  const handleOpenDetail = useCallback((stop: JourneyStopData, rect: DOMRect) => {
    setDetailOriginRect(rect);
    setActiveDetailStop(stop);
    setLastRenderedStop(stop);
  }, []);

  // Close the full detail view and restore journey input
  const handleCloseDetail = useCallback(() => {
    setActiveDetailStop(null);
    // lastRenderedStop is intentionally kept until next open so the closing
    // animation can reference the content that was displayed.
  }, []);

  const handleReturnHome = useCallback(() => {
    setActiveDetailStop(null);
    onReturnHome?.();
  }, [onReturnHome]);

  return (
    <div
      ref={containerRef}
      className={`${styles.aboutPageContainer} ${className}`.trim()}
      id="about"
    >
      {/* 1. Left Side: Permanent Identity Panel */}
      <div className={styles.leftIdentityWorld}>
        <AboutIdentity currentFrame={currentFrame} />
      </div>

      {/* 2. Right Side: Moving Journey World */}
      <div className={styles.rightJourneyWorld}>
        <JourneyRoad
          progress={smoothedProgress}
          onOpenDetail={handleOpenDetail}
          onReturnHome={handleReturnHome}
        />
      </div>

      {/* 3. Genie Detail View — kept mounted while lastRenderedStop exists so
           AnimatePresence can play the closing Genie animation before unmounting.
           lastRenderedStop is state (safe to read during render). */}
      {lastRenderedStop && (
        <BeginningDetailView
          stop={lastRenderedStop}
          originRect={detailOriginRect}
          isOpen={Boolean(activeDetailStop)}
          onClose={handleCloseDetail}
          onReturnHome={handleReturnHome}
        />
      )}
    </div>
  );
};

export default AboutPage;
