import React, { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import styles from "./MainPage.module.css";
import { BackgroundLayer } from "./layers/BackgroundLayer";
import { AmbientLayer } from "./layers/AmbientLayer";
import { HeroLayer } from "./layers/HeroLayer";
import { NavigationLayer } from "./layers/NavigationLayer";
import { ProjectLayer } from "./layers/ProjectLayer";
import { FocusBlurLayer } from "./layers/FocusBlurLayer";
import { CursorLayer } from "./layers/CursorLayer";
import { AboutDiscoveryLayer } from "./layers/AboutDiscoveryLayer";
import { HomeStatusIndicator } from "./status";
import { HomeScrollIndicator } from "./scroll";
import {
  FORMATION_END_FRAME,
  EXIT_START_FRAME,
  EXIT_END_FRAME,
  portraitPreloader,
} from "./portrait";

export interface MainPageProps {
  className?: string;
  isNavActive?: boolean;
  isIntroCompleted?: boolean;
  onHomeActiveChange?: (isActive: boolean) => void;
}

type SequenceState =
  | "intro"
  | "waiting_for_home"
  | "home_entering"
  | "home"
  | "forming_about"
  | "about_held"
  | "about_exiting"
  | "about_complete";

/**
 * MainPage — Phase 07.5 Architectural Correction: Unified First-Scroll Home Reveal
 *
 * Sequence:
 * 1. Intro completes -> waiting_for_home (Clean canvas, waiting for first interaction)
 * 2. First downward scroll -> HOME_ENTERING (triggers one coordinated cinematic timeline)
 *    T+0ms: Background, FloatingNav, FloatingContactNav enter
 *    T+120ms: ANSHAD enters
 *    T+280ms: Subtitle enters
 *    T+380ms: ProjectFileHub enters
 *    T+520ms: EXPLORE PROJECTS settles
 *    T+580ms: CURRENTLY BUILDING enters
 *    T+680ms: Home SCROLL indicator enters
 *    T+950ms: Complete Home state is settled -> HOME_STABLE (home)
 * 3. Subsequent downward scroll -> transitions toward ABOUT
 */
export const MainPage: React.FC<MainPageProps> = ({
  className = "",
  isNavActive,
  isIntroCompleted = false,
  onHomeActiveChange,
}) => {
  // Visual states
  const [isHomeVisible, setIsHomeVisible] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.has("skipIntro") || window.location.hash === "#home";
    }
    return false;
  });
  const [isAboutActive, setIsAboutActive] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [exitProgress, setExitProgress] = useState<number>(0);
  const [activeNavId, setActiveNavId] = useState<string>("home");
  const [isProjectHubOpen, setIsProjectHubOpen] = useState<boolean>(false);
  const [isHomeStable, setIsHomeStable] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.has("skipIntro") || window.location.hash === "#home";
    }
    return false;
  });
  const [forceIdCardTeaser, setForceIdCardTeaser] = useState<boolean>(false);

  // State refs to ensure atomic gesture handling without stale closures
  const stateRef = useRef<SequenceState>(
    (() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.has("skipIntro") || window.location.hash === "#home") return "home";
      }
      return isIntroCompleted ? "waiting_for_home" : "intro";
    })()
  );
  const frameRef = useRef<number>(1);
  const targetProgressRef = useRef<number>(0);
  const currentProgressRef = useRef<number>(0);
  const formationRafRef = useRef<number | null>(null);
  const exitRafRef = useRef<number | null>(null);
  const homeEnteringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  // Sync introCompleted state changes from App.tsx
  useEffect(() => {
    if (isIntroCompleted && stateRef.current === "intro") {
      stateRef.current = "waiting_for_home";
    }
  }, [isIntroCompleted]);

  // Preload initial portrait frames in background
  useEffect(() => {
    portraitPreloader.loadInitialBatch();
  }, []);

  // 1. Transition into HOME (First scroll after Intro triggers unified cinematic entrance)
  const transitionToHome = useCallback(() => {
    if (stateRef.current !== "waiting_for_home") return;
    stateRef.current = "home_entering";
    setIsHomeVisible(true);
    setIsAboutActive(false);
    setActiveNavId("home");
    onHomeActiveChange?.(true);

    if (shouldReduceMotion) {
      stateRef.current = "home";
      setIsHomeStable(true);
      return;
    }

    if (homeEnteringTimerRef.current) {
      clearTimeout(homeEnteringTimerRef.current);
    }

    // Coordinated cinematic entrance settles in ~950ms (transition to HOME_STABLE)
    homeEnteringTimerRef.current = setTimeout(() => {
      if (stateRef.current === "home_entering") {
        stateRef.current = "home";
        setIsHomeStable(true);
      }
      homeEnteringTimerRef.current = null;
    }, 950);
  }, [onHomeActiveChange, shouldReduceMotion]);

  // 2. Start About portrait formation animation (frames 01 -> 76)
  // Preserved for Phase 02/03 when ID card fully reveals About
  const startAboutFormation = useCallback(() => {
    if (stateRef.current !== "home") return;
    stateRef.current = "forming_about";

    // ANSHAD fades out, portrait sequence appears
    setIsHomeVisible(false);
    setIsAboutActive(true);
    setIsHomeStable(false);
    setActiveNavId("about");

    // Start preloading formation batch
    portraitPreloader.loadFormationBatch();

    if (shouldReduceMotion) {
      frameRef.current = FORMATION_END_FRAME;
      setCurrentFrame(FORMATION_END_FRAME);
      stateRef.current = "about_held";
      portraitPreloader.loadExitBatch();
      return;
    }

    const startTime = performance.now();
    const DURATION_MS = 2600; // ~2.6 seconds cinematic particle formation

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const nextFrame = Math.min(
        FORMATION_END_FRAME,
        Math.max(1, Math.round(1 + progress * (FORMATION_END_FRAME - 1)))
      );

      frameRef.current = nextFrame;
      setCurrentFrame(nextFrame);

      if (progress < 1) {
        formationRafRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = FORMATION_END_FRAME;
        setCurrentFrame(FORMATION_END_FRAME);
        stateRef.current = "about_held";
        formationRafRef.current = null;
        portraitPreloader.loadExitBatch();
      }
    };

    formationRafRef.current = requestAnimationFrame(tick);
  }, [shouldReduceMotion]);

  // 3. Return from About back to Home
  const returnToHome = useCallback(() => {
    if (formationRafRef.current) {
      cancelAnimationFrame(formationRafRef.current);
      formationRafRef.current = null;
    }
    if (exitRafRef.current) {
      cancelAnimationFrame(exitRafRef.current);
      exitRafRef.current = null;
    }
    if (homeEnteringTimerRef.current) {
      clearTimeout(homeEnteringTimerRef.current);
      homeEnteringTimerRef.current = null;
    }

    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
    setExitProgress(0);
    frameRef.current = 1;
    setCurrentFrame(1);

    setIsAboutActive(false);
    setIsHomeVisible(true);
    setIsHomeStable(true);
    setActiveNavId("home");
    onHomeActiveChange?.(true);
    stateRef.current = "home";
  }, [onHomeActiveChange]);

  // 4. Smooth exit progress interpolation loop for frames 77 -> 130
  const startExitLoop = useCallback(() => {
    if (exitRafRef.current) return;

    const tick = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;

      if (Math.abs(diff) > 0.001) {
        currentProgressRef.current += diff * 0.14;
        const p = Math.max(0, Math.min(1, currentProgressRef.current));
        setExitProgress(p);

        // Map normalized progress to frames 77 -> 130
        const nextFrame = Math.max(
          EXIT_START_FRAME,
          Math.min(
            EXIT_END_FRAME,
            Math.round(EXIT_START_FRAME + p * (EXIT_END_FRAME - EXIT_START_FRAME))
          )
        );
        frameRef.current = nextFrame;
        setCurrentFrame(nextFrame);

        if (p <= 0.002 && targetProgressRef.current === 0) {
          currentProgressRef.current = 0;
          setExitProgress(0);
          frameRef.current = FORMATION_END_FRAME;
          setCurrentFrame(FORMATION_END_FRAME);
          stateRef.current = "about_held";
          exitRafRef.current = null;
          return;
        }

        if (p >= 0.998 && targetProgressRef.current === 1) {
          currentProgressRef.current = 1;
          setExitProgress(1);
          frameRef.current = EXIT_END_FRAME;
          setCurrentFrame(EXIT_END_FRAME);
          stateRef.current = "about_complete";
          exitRafRef.current = null;
          return;
        }

        stateRef.current = "about_exiting";
        exitRafRef.current = requestAnimationFrame(tick);
      } else {
        currentProgressRef.current = targetProgressRef.current;
        const p = currentProgressRef.current;
        setExitProgress(p);

        if (p === 0) {
          frameRef.current = FORMATION_END_FRAME;
          setCurrentFrame(FORMATION_END_FRAME);
          stateRef.current = "about_held";
        } else if (p === 1) {
          frameRef.current = EXIT_END_FRAME;
          setCurrentFrame(EXIT_END_FRAME);
          stateRef.current = "about_complete";
        } else {
          const nextFrame = Math.max(
            EXIT_START_FRAME,
            Math.min(
              EXIT_END_FRAME,
              Math.round(
                EXIT_START_FRAME + p * (EXIT_END_FRAME - EXIT_START_FRAME)
              )
            )
          );
          frameRef.current = nextFrame;
          setCurrentFrame(nextFrame);
          stateRef.current = "about_exiting";
        }
        exitRafRef.current = null;
      }
    };

    exitRafRef.current = requestAnimationFrame(tick);
  }, []);

  // Event Listeners: ONLY active once Intro is completed
  useEffect(() => {
    if (!isIntroCompleted) return;

    let touchStartY = 0;

    const handleWheel = (e: WheelEvent) => {
      const currentState = stateRef.current;

      // 1. In WAITING_FOR_HOME: first downward scroll enters HOME
      if (currentState === "waiting_for_home") {
        if (e.deltaY > 5) {
          e.preventDefault();
          transitionToHome();
        }
        return;
      }

      // 2. In HOME_ENTERING: absorb input during cinematic entrance (~950ms)
      if (currentState === "home_entering") {
        e.preventDefault();
        return;
      }

      // 3. In HOME (HOME_STABLE):
      if (currentState === "home") {
        if (e.deltaY < 0) {
          // At top of Home, prevent scrolling above/replaying intro
          e.preventDefault();
          return;
        }
        // Phase 01: Normal downward scroll on Home does not trigger About transition directly.
        // Preserves the ID card discovery requirement.
        return;
      }

      // 4. In FORMING_ABOUT: input locked during automatic 01 -> 76 formation
      if (currentState === "forming_about") {
        e.preventDefault();
        return;
      }

      // 5. In ABOUT_HELD:
      if (currentState === "about_held") {
        if (e.deltaY < -15) {
          // Scrolling up from frame 76 returns cleanly to HOME
          e.preventDefault();
          returnToHome();
          return;
        }
        if (e.deltaY > 0) {
          // Scrolling down begins exit progress 77 -> 130
          e.preventDefault();
          targetProgressRef.current = Math.min(
            1,
            targetProgressRef.current + e.deltaY / 750
          );
          startExitLoop();
        }
        return;
      }

      // 6. In ABOUT_EXITING or ABOUT_COMPLETE:
      if (currentState === "about_exiting" || currentState === "about_complete") {
        e.preventDefault();
        const deltaNormalized = e.deltaY / 750;
        const newTarget = Math.max(
          0,
          Math.min(1, targetProgressRef.current + deltaNormalized)
        );

        // If reversing up reaches 0, return to about_held or home
        if (newTarget === 0 && targetProgressRef.current === 0 && e.deltaY < -15) {
          returnToHome();
          return;
        }

        targetProgressRef.current = newTarget;
        startExitLoop();
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const currentY = e.touches[0].clientY;
      const deltaY = touchStartY - currentY; // positive = swipe up = scroll down
      const currentState = stateRef.current;

      if (currentState === "waiting_for_home") {
        if (deltaY > 10) {
          if (e.cancelable) e.preventDefault();
          touchStartY = currentY;
          transitionToHome();
        }
        return;
      }

      if (currentState === "home_entering") {
        if (e.cancelable) e.preventDefault();
        return;
      }

      if (currentState === "home") {
        if (deltaY < -5) {
          if (e.cancelable) e.preventDefault();
          return;
        }
        // Phase 01: Normal touch scroll on Home does not trigger About transition directly
        return;
      }

      if (currentState === "forming_about") {
        if (e.cancelable) e.preventDefault();
        return;
      }

      if (currentState === "about_held") {
        if (deltaY < -20) {
          if (e.cancelable) e.preventDefault();
          returnToHome();
          return;
        }
        if (deltaY > 2) {
          if (e.cancelable) e.preventDefault();
          targetProgressRef.current = Math.min(
            1,
            targetProgressRef.current + deltaY / 550
          );
          touchStartY = currentY;
          startExitLoop();
        }
        return;
      }

      if (currentState === "about_exiting" || currentState === "about_complete") {
        if (Math.abs(deltaY) > 2) {
          if (e.cancelable) e.preventDefault();
          const newTarget = Math.max(
            0,
            Math.min(1, targetProgressRef.current + deltaY / 550)
          );

          if (newTarget === 0 && targetProgressRef.current === 0 && deltaY < -20) {
            returnToHome();
            return;
          }

          targetProgressRef.current = newTarget;
          touchStartY = currentY;
          startExitLoop();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current === "waiting_for_home") {
        if (["ArrowDown", "PageDown", " ", "Spacebar"].includes(e.key)) {
          e.preventDefault();
          transitionToHome();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
      if (formationRafRef.current) cancelAnimationFrame(formationRafRef.current);
      if (exitRafRef.current) cancelAnimationFrame(exitRafRef.current);
      if (homeEnteringTimerRef.current) clearTimeout(homeEnteringTimerRef.current);
    };
  }, [
    isIntroCompleted,
    transitionToHome,
    startAboutFormation,
    returnToHome,
    startExitLoop,
  ]);

  // Triggered when user clicks "KNOW MORE ABOUT ME" on the centered ID card
  const handleAboutRequested = useCallback(() => {
    startAboutFormation();
  }, [startAboutFormation]);

  // Handle direct navigation selection (clicking Home, Work, About in navbar)
  const handleNavSelect = useCallback(
    (id: string) => {
      if (id === "home" || id === "work") {
        returnToHome();
      } else if (id === "about") {
        // ABOUT in FloatingNav routes to the ID card discovery teaser / centering
        setForceIdCardTeaser(true);
      }
    },
    [returnToHome]
  );

  return (
    <section
      className={`${styles.mainPageContainer} ${className}`.trim()}
      aria-label="Main Portfolio Experience"
    >
      {/* 1. Background Canvas Layer (z-index: 1) */}
      <BackgroundLayer isHomeVisible={isHomeVisible || isAboutActive} />

      {/* 2. Ambient Atmosphere Layer (z-index: 2) */}
      <AmbientLayer />

      {/* 3. Central Hero Layer: Central ANSHAD, About Portrait, and AboutSection (z-index: 10) */}
      <HeroLayer
        isHomeVisible={isHomeVisible}
        isAboutActive={isAboutActive}
        currentFrame={currentFrame}
        exitProgress={exitProgress}
      />

      {/* 4. Supporting Micro-Information: Status (bottom-left) & Scroll Hint (bottom-center) (z-index: 25) */}
      <HomeStatusIndicator isVisible={isHomeVisible && !isAboutActive} />
      <HomeScrollIndicator isVisible={isHomeVisible && !isAboutActive} />

      {/* 5. Navigation Layer — Top-Left Brand & Top-Center Nav (z-index: 40) */}
      <NavigationLayer
        isNavActive={isNavActive}
        activeNavId={activeNavId}
        onNavSelect={handleNavSelect}
      />

      {/* 6. Focus Blur Layer — Background blur behind centered ProjectFileHub (z-index: 45) */}
      <FocusBlurLayer isBlurred={isProjectHubOpen} />

      {/* 7. Project Layer — Optical Center Project File Hub (z-index: 60) */}
      <ProjectLayer
        isHomeVisible={isHomeVisible}
        onOpenChange={setIsProjectHubOpen}
      />

      {/* 8. About Discovery Layer — Hanging ID Card Pull-Down Entry (z-index: 70) */}
      <AboutDiscoveryLayer
        isHomeStable={isHomeStable}
        isAboutActive={isAboutActive}
        forceTrigger={forceIdCardTeaser}
        onAboutRequested={handleAboutRequested}
      />

      {/* 9. Cursor Layer (z-index: 100) */}
      <CursorLayer />
    </section>
  );
};

export default MainPage;
