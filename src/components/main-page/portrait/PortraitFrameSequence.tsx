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
 * Extracts a soft luminance-based alpha channel from a JPG frame.
 * Removes white / near-white background pixels while preserving
 * subject details, skin highlights, hair textures, and anti-aliased edge falloff.
 */
function createTransparentPortraitCanvas(img: HTMLImageElement): HTMLCanvasElement {
  const offscreen = document.createElement("canvas");
  offscreen.width = 1920;
  offscreen.height = 1080;
  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) return offscreen;

  ctx.drawImage(img, 0, 0, 1920, 1080);
  const imgData = ctx.getImageData(0, 0, 1920, 1080);
  const data = imgData.data;
  const len = data.length;

  // Soft luminance extraction thresholds
  // Background white > 244. Smooth transition between 172 and 244.
  const LOW_THRESH = 172;
  const HIGH_THRESH = 244;
  const RANGE = HIGH_THRESH - LOW_THRESH;

  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Standard perceived luminance
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    if (lum >= HIGH_THRESH) {
      // Pure / near-white background -> completely transparent
      data[i + 3] = 0;
    } else if (lum <= LOW_THRESH) {
      // Core subject / dark tones -> full opacity
      // data[i + 3] remains 255
    } else {
      // Soft transition: smoothstep curve to avoid jagged edges or harsh clipping
      const t = (lum - LOW_THRESH) / RANGE;
      const smooth = t * t * (3 - 2 * t);
      const alpha = Math.round(255 * (1 - smooth));
      data[i + 3] = alpha;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return offscreen;
}

/**
 * PortraitFrameSequence — Phase 06 & Phase 03.1
 * Renders the cinematic portrait sequence as a transparent cutout directly on canvas.
 * Seamlessly integrates into dark atmospheric environments with zero white box artifact.
 */
export const PortraitFrameSequence: React.FC<PortraitFrameSequenceProps> = ({
  currentFrame,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastDrawnFrameRef = useRef<number>(-1);
  const processedCacheRef = useRef<Map<number, HTMLCanvasElement>>(new Map());

  // Synchronous draw function using cached transparent canvas
  const renderFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Check processed transparent cache first
    let processed = processedCacheRef.current.get(frameIdx);

    if (!processed) {
      const rawImg = portraitPreloader.getClosestLoadedFrame(frameIdx);
      if (!rawImg) return;

      // Process transparent cutout on offscreen canvas
      processed = createTransparentPortraitCanvas(rawImg);
      // Cache if it's the exact target frame
      if (portraitPreloader.isFrameLoaded(frameIdx)) {
        processedCacheRef.current.set(frameIdx, processed);
      }
    }

    // Direct 1920x1080 native transparent drawing
    ctx.clearRect(0, 0, 1920, 1080);
    ctx.drawImage(processed, 0, 0, 1920, 1080);
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

