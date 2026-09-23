/**
 * Portrait Frame Sequence Utilities & Chunked Progressive Preloader
 * Total Frames: 130 (1920x1080 JPG)
 * Frames 01–76: Automatic formation sequence
 * Frames 77–130: Scroll-controlled exit sequence
 */

export const TOTAL_FRAMES = 130;
export const FORMATION_END_FRAME = 76;
export const EXIT_START_FRAME = 77;
export const EXIT_END_FRAME = 130;

export const ABOUT_NAV_THRESHOLD = 0.55;

export function getFrameUrl(frameIndex: number): string {
  const clamped = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
  const padded = String(clamped).padStart(3, "0");
  return `/portrait-sequence/ezgif-frame-${padded}.jpg`;
}

export class PortraitPreloader {
  private cache: Map<number, HTMLImageElement> = new Map();
  private pending: Map<number, Promise<HTMLImageElement>> = new Map();
  private isFormationPreloading = false;
  private isExitPreloading = false;

  /**
   * Loads a single frame and stores in memory cache
   */
  public async loadFrame(frameIndex: number): Promise<HTMLImageElement> {
    const clamped = Math.max(1, Math.min(TOTAL_FRAMES, frameIndex));
    if (this.cache.has(clamped)) {
      return this.cache.get(clamped)!;
    }
    if (this.pending.has(clamped)) {
      return this.pending.get(clamped)!;
    }

    const promise = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.src = getFrameUrl(clamped);
      img.onload = () => {
        this.cache.set(clamped, img);
        this.pending.delete(clamped);
        resolve(img);
      };
      img.onerror = (err) => {
        this.pending.delete(clamped);
        reject(err);
      };
    });

    this.pending.set(clamped, promise);
    return promise;
  }

  /**
   * Preload a specific range of frames with controlled chunking / concurrency
   */
  public async preloadRange(
    start: number,
    end: number,
    concurrency = 4
  ): Promise<void> {
    const queue: number[] = [];
    for (let i = start; i <= end; i++) {
      if (!this.cache.has(i) && !this.pending.has(i)) {
        queue.push(i);
      }
    }

    const workers = Array.from({ length: concurrency }, async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (next !== undefined) {
          try {
            await this.loadFrame(next);
          } catch {
            // Ignore failure on single frame, will fallback to nearest
          }
        }
      }
    });

    await Promise.all(workers);
  }

  /**
   * Priority 1: Initial load
   * Preloads frames 01–10 and frame 76 immediately.
   */
  public async loadInitialBatch(): Promise<void> {
    await Promise.all([
      this.preloadRange(1, 10, 4),
      this.loadFrame(FORMATION_END_FRAME),
    ]);
  }

  /**
   * Priority 2: Progressive formation preload (frames 11–76)
   * Triggered in chunks during initial wait / auto-formation
   */
  public async loadFormationBatch(): Promise<void> {
    if (this.isFormationPreloading) return;
    this.isFormationPreloading = true;

    // Load in chunks of 15
    for (let start = 11; start <= FORMATION_END_FRAME; start += 15) {
      const end = Math.min(FORMATION_END_FRAME, start + 14);
      await this.preloadRange(start, end, 5);
    }
  }

  /**
   * Priority 3: Progressive exit preload (frames 77–130)
   * Triggered when frame 76 is reached
   */
  public async loadExitBatch(): Promise<void> {
    if (this.isExitPreloading) return;
    this.isExitPreloading = true;

    // Load in chunks of 15
    for (let start = EXIT_START_FRAME; start <= EXIT_END_FRAME; start += 15) {
      const end = Math.min(EXIT_END_FRAME, start + 14);
      await this.preloadRange(start, end, 5);
    }
  }

  /**
   * Retrieves a loaded frame or the closest available loaded frame to guarantee zero blank frames.
   */
  public getClosestLoadedFrame(frameIndex: number): HTMLImageElement | null {
    const target = Math.max(1, Math.min(TOTAL_FRAMES, Math.round(frameIndex)));
    if (this.cache.has(target)) {
      return this.cache.get(target)!;
    }

    // Search downward first for the nearest already-rendered frame
    for (let i = target - 1; i >= 1; i--) {
      if (this.cache.has(i)) {
        return this.cache.get(i)!;
      }
    }

    // Search upward if no earlier frame is available
    for (let i = target + 1; i <= TOTAL_FRAMES; i++) {
      if (this.cache.has(i)) {
        return this.cache.get(i)!;
      }
    }

    return null;
  }

  public isFrameLoaded(frameIndex: number): boolean {
    return this.cache.has(frameIndex);
  }
}

// Global preloader instance for session persistence
export const portraitPreloader = new PortraitPreloader();
