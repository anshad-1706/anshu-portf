import React, { useEffect, useRef, useCallback } from "react";
import styles from "./PortraitFrameSequence.module.css";
import {
  portraitPreloader,
  FORMATION_END_FRAME,
} from "./portraitSequence";

export interface PortraitFrameSequenceProps {
  currentFrame: number;
  className?: string;
}

/**
 * PortraitFrameSequence — Phase 06
 * Renders the 1920x1080 cinematic portrait JPG sequence on a high-performance canvas.
 * Guaranteed zero flicker via closest-frame preloaded caching.
 */
export const PortraitFrameSequence: React.FC<PortraitFrameSequenceProps> = ({
  currentFrame,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawnFrameRef = useRef<number>(-1);

  // Synchronous draw function
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const img = portraitPreloader.getClosestLoadedFrame(frameIdx);
    if (!img) return;

    // Direct 1920x1080 native frame drawing
    ctx.clearRect(0, 0, 1920, 1080);
    ctx.drawImage(img, 0, 0, 1920, 1080);
    lastDrawnFrameRef.current = frameIdx;
  }, []);

  // Preload initial frames on mount and draw initial frame as soon as ready
  useEffect(() => {
    let isCancelled = false;

    const init = async () => {
      await portraitPreloader.loadInitialBatch();
      if (!isCancelled) {
        renderFrame(currentFrame);
        // Start formation batch preloading in background
        portraitPreloader.loadFormationBatch();
      }
    };

    init();

    return () => {
      isCancelled = true;
    };
  }, [renderFrame, currentFrame]);

  // Redraw when currentFrame updates
  useEffect(() => {
    renderFrame(currentFrame);

    // If approaching or reached frame 76, preload exit batch (77–130)
    if (currentFrame >= FORMATION_END_FRAME - 5) {
      portraitPreloader.loadExitBatch();
    }
  }, [currentFrame, renderFrame]);

  return (
    <div className={`${styles.sequenceContainer} ${className}`.trim()} aria-hidden="true">
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className={styles.portraitCanvas}
        />
      </div>
    </div>
  );
};

export default PortraitFrameSequence;
