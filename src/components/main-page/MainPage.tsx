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
  | "about_complete"
  | "transitioning_to_projects"
  | "projects_active"
  | "transitioning_from_projects";

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
  const [isProjectsActive, setIsProjectsActive] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        window.location.hash === "#work" || window.location.hash === "#projects"
      );
    }
    return false;
  });
  const [isTransitioningToAbout, setIsTransitioningToAbout] = useState<boolean>(false);
  const [isTransitioningToHome, setIsTransitioningToHome] = useState<boolean>(false);
  const [isTransitioningToProjects, setIsTransitioningToProjects] = useState<boolean>(false);
  const [isTransitioningFromProjects, setIsTransitioningFromProjects] = useState<boolean>(false);
  const [currentFrame, setCurrentFrame] = useState<number>(1);
  const [exitProgress, setExitProgress] = useState<number>(0);
  const [activeNavId, setActiveNavId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      if (
        window.location.hash === "#work" ||
        window.location.hash === "#projects"
      ) {
        return "work";
      }
      if (window.location.hash === "#about") return "about";
    }
    return "home";
  });
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
  const hasCompletedDiscoveryRef = useRef<boolean>(
    (() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        return params.has("skipIntro") || window.location.hash === "#about";
      }
      return false;
    })()
  );
  const stateRef = useRef<SequenceState>(
    (() => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (
          window.location.hash === "#work" ||
          window.location.hash === "#projects"
        ) {
          return "projects_active";
        }
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
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // 2. Coordinated Home-to-About Transition (FIX 03 & FIX 04)
  const startAboutFormation = useCallback(() => {
    // Prevent repeated activation while transition is running
    if (
      stateRef.current === "forming_about" ||
      stateRef.current === "about_held" ||
      stateRef.current === "about_exiting"
    ) {
      return;
    }

    stateRef.current = "forming_about";
    setIsTransitioningToAbout(true);
    setIsHomeStable(false);
    hasCompletedDiscoveryRef.current = true;
    setActiveNavId("about");

    // Start preloading formation batch
    portraitPreloader.loadFormationBatch();

    if (shouldReduceMotion) {
      frameRef.current = FORMATION_END_FRAME;
      setCurrentFrame(FORMATION_END_FRAME);
      setIsAboutActive(true);
      setIsHomeVisible(false);
      setIsTransitioningToAbout(false);
      stateRef.current = "about_held";
      portraitPreloader.loadExitBatch();
      return;
    }

    // Coordinated sequence: Outgoing Home scene begins fading immediately.
    // Mount AboutPage at 350ms so it smoothly crossfades in while the portrait forms.
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsAboutActive(true);
    }, 350);

    const startTime = performance.now();
    const DURATION_MS = 2400; // ~2.4 seconds smooth particle formation

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
        setIsHomeVisible(false);
        setIsTransitioningToAbout(false);
        formationRafRef.current = null;
        portraitPreloader.loadExitBatch();
      }
    };

    formationRafRef.current = requestAnimationFrame(tick);
  }, [shouldReduceMotion]);
  // 3. Return from About back to Home (instant reset)
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
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    targetProgressRef.current = 0;
    currentProgressRef.current = 0;
    setExitProgress(0);
    frameRef.current = 1;
    setCurrentFrame(1);

    setIsTransitioningToAbout(false);
    setIsTransitioningToHome(false);
    setIsAboutActive(false);
    setIsHomeVisible(true);
    setIsHomeStable(true);
    setActiveNavId("home");
    onHomeActiveChange?.(true);
    stateRef.current = "home";
  }, [onHomeActiveChange]);

  // 4. Return from About back to Home with cinematic portrait dissolution (frames 77 -> 130) (FIX 03 & FIX 04)
  const handleReturnHomeFromAbout = useCallback(() => {
    // Prevent double triggering
    if (
      stateRef.current === "about_exiting" ||
      stateRef.current === "home_entering" ||
      stateRef.current === "home"
    ) {
      return;
    }

    stateRef.current = "about_exiting";
    setIsTransitioningToHome(true);
    setActiveNavId("home");

    if (formationRafRef.current) {
      cancelAnimationFrame(formationRafRef.current);
      formationRafRef.current = null;
    }
    if (exitRafRef.current) {
      cancelAnimationFrame(exitRafRef.current);
      exitRafRef.current = null;
    }

    if (shouldReduceMotion) {
      frameRef.current = 1;
      setCurrentFrame(1);
      setExitProgress(0);
      setIsAboutActive(false);
      setIsHomeVisible(true);
      setIsHomeStable(true);
      setIsTransitioningToHome(false);
      onHomeActiveChange?.(true);
      stateRef.current = "home";
      return;
    }

    // Preload exit batch 77 -> 130
    portraitPreloader.loadExitBatch();

    // At 400ms, start fading Home back in so it seamlessly materializes under dissolution
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsHomeVisible(true);
    }, 400);

    const startTime = performance.now();
    const DURATION_MS = 1800; // ~1.8 seconds smooth particle dissolution

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / DURATION_MS);
      const nextFrame = Math.min(
        EXIT_END_FRAME,
        Math.max(
          EXIT_START_FRAME,
          Math.round(EXIT_START_FRAME + progress * (EXIT_END_FRAME - EXIT_START_FRAME))
        )
      );

      frameRef.current = nextFrame;
      setCurrentFrame(nextFrame);
      setExitProgress(progress);

      if (progress < 1) {
        exitRafRef.current = requestAnimationFrame(tick);
      } else {
        exitRafRef.current = null;
        // Dissolution completed: seamlessly hand off to Home
        frameRef.current = 1;
        setCurrentFrame(1);
        setExitProgress(0);
        setIsAboutActive(false);
        setIsHomeVisible(true);
        setIsHomeStable(true);
        setIsTransitioningToHome(false);
        onHomeActiveChange?.(true);
        stateRef.current = "home";
      }
    };

    exitRafRef.current = requestAnimationFrame(tick);
  }, [onHomeActiveChange, shouldReduceMotion]);

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

  // 5. Open Projects page via smooth cinematic fade transition
  const handleProjectsRequested = useCallback(() => {
    // Prevent double activation
    if (
      stateRef.current === "transitioning_to_projects" ||
      stateRef.current === "projects_active" ||
      stateRef.current === "forming_about" ||
      stateRef.current === "about_held" ||
      stateRef.current === "about_exiting" ||
      stateRef.current === "transitioning_from_projects"
    ) {
      return;
    }

    stateRef.current = "transitioning_to_projects";
    setIsTransitioningToProjects(true);
    setActiveNavId("work");

    if (shouldReduceMotion) {
      setIsHomeVisible(false);
      setIsProjectsActive(true);
      setIsTransitioningToProjects(false);
      stateRef.current = "projects_active";
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#work");
      }
      return;
    }

    // Coordinated sequence:
    // Outgoing Home scene begins smooth fade out.
    // Mount ProjectsPage at 240ms so it smoothly crossfades in.
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsProjectsActive(true);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#work");
      }
    }, 240);

    setTimeout(() => {
      setIsHomeVisible(false);
      setIsTransitioningToProjects(false);
      stateRef.current = "projects_active";
    }, 550);
  }, [shouldReduceMotion]);

  // 6. Return from Projects back to Home with smooth crossfade
  const handleReturnHomeFromProjects = useCallback(() => {
    if (
      stateRef.current === "transitioning_from_projects" ||
      stateRef.current === "home_entering" ||
      stateRef.current === "home"
    ) {
      return;
    }

    stateRef.current = "transitioning_from_projects";
    setIsTransitioningFromProjects(true);
    setActiveNavId("home");

    if (shouldReduceMotion) {
      setIsProjectsActive(false);
      setIsHomeVisible(true);
      setIsHomeStable(true);
      setIsTransitioningFromProjects(false);
      onHomeActiveChange?.(true);
      stateRef.current = "home";
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#home");
      }
      return;
    }

    // Fade Home back in at 150ms while Projects page fades out
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsHomeVisible(true);
    }, 150);

    setTimeout(() => {
      setIsProjectsActive(false);
      setIsHomeStable(true);
      setIsTransitioningFromProjects(false);
      onHomeActiveChange?.(true);
      stateRef.current = "home";
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", "#home");
      }
    }, 450);
  }, [onHomeActiveChange, shouldReduceMotion]);

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

      // 3. In PROJECTS_ACTIVE: normal scroll permitted
      if (currentState === "projects_active") {
        return;
      }

      // 4. In transition to/from projects: lock input
      if (
        currentState === "transitioning_to_projects" ||
        currentState === "transitioning_from_projects"
      ) {
        e.preventDefault();
        return;
      }

      // 5. In HOME (HOME_STABLE):
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

      // 6. In FORMING_ABOUT: input locked during automatic 01 -> 76 formation
      if (currentState === "forming_about") {
        e.preventDefault();
        return;
      }

      // 7. In ABOUT_HELD / JOURNEY_ACTIVE: Portrait frame 76 is held; journey road handles scroll
      if (currentState === "about_held" || currentState === "about_complete") {
        // Handled directly inside AboutPage JourneyRoad scroll listener
        return;
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

      if (currentState === "projects_active") {
        return;
      }

      if (
        currentState === "transitioning_to_projects" ||
        currentState === "transitioning_from_projects"
      ) {
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

      if (currentState === "about_held" || currentState === "about_complete") {
        // Handled directly inside AboutPage JourneyRoad touch listener
        return;
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
      // Intro running: no navigation
      if (stateRef.current === "intro" || stateRef.current === "waiting_for_home") {
        return;
      }

      // Active transition running: ignore duplicate activation
      if (
        stateRef.current === "forming_about" ||
        stateRef.current === "about_exiting" ||
        stateRef.current === "home_entering" ||
        stateRef.current === "transitioning_to_projects" ||
        stateRef.current === "transitioning_from_projects"
      ) {
        return;
      }

      if (id === "home") {
        if (stateRef.current === "about_held" || isAboutActive) {
          handleReturnHomeFromAbout();
        } else if (stateRef.current === "projects_active" || isProjectsActive) {
          handleReturnHomeFromProjects();
        } else {
          setActiveNavId("home");
        }
      } else if (id === "work") {
        if (stateRef.current === "projects_active" || isProjectsActive) {
          return;
        }
        if (stateRef.current === "about_held" || isAboutActive) {
          handleReturnHomeFromAbout();
          setTimeout(() => {
            handleProjectsRequested();
          }, 300);
        } else {
          handleProjectsRequested();
        }
      } else if (id === "about") {
        if (isAboutActive || stateRef.current === "about_held") {
          return;
        }

        if (stateRef.current === "projects_active" || isProjectsActive) {
          handleReturnHomeFromProjects();
          setTimeout(() => {
            startAboutFormation();
          }, 450);
          return;
        }

        // Initial Home discovery: click About in navbar does NOT bypass discovery
        if (!hasCompletedDiscoveryRef.current) {
          setForceIdCardTeaser(true);
          return;
        }

        // Home after first discovery: click About in navbar opens About directly via coordinated transition!
        startAboutFormation();
      }
    },
    [
      handleReturnHomeFromAbout,
      handleReturnHomeFromProjects,
      handleProjectsRequested,
      startAboutFormation,
      isAboutActive,
      isProjectsActive,
    ]
  );

  const handleDiscoveryDismissed = useCallback(() => {
    setIsHomeStable(true);
  }, []);

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
        isProjectsActive={isProjectsActive}
        isTransitioningToAbout={isTransitioningToAbout}
        isTransitioningToHome={isTransitioningToHome}
        isTransitioningToProjects={isTransitioningToProjects}
        isTransitioningFromProjects={isTransitioningFromProjects}
        currentFrame={currentFrame}
        exitProgress={exitProgress}
        onReturnHome={handleReturnHomeFromAbout}
        onReturnHomeFromProjects={handleReturnHomeFromProjects}
      />

      {/* 4. Supporting Micro-Information: Status (bottom-left) & Scroll Hint (bottom-center) (z-index: 25) */}
      <HomeStatusIndicator
        isVisible={
          isHomeVisible &&
          !isAboutActive &&
          !isTransitioningToAbout &&
          !isProjectsActive &&
          !isTransitioningToProjects
        }
      />
      <HomeScrollIndicator
        isVisible={
          isHomeVisible &&
          !isAboutActive &&
          !isTransitioningToAbout &&
          !isProjectsActive &&
          !isTransitioningToProjects
        }
      />

      {/* 5. Navigation Layer — Top-Left Brand & Top-Center Nav (z-index: 40) */}
      <NavigationLayer
        isNavActive={isNavActive}
        activeNavId={activeNavId}
        onNavSelect={handleNavSelect}
      />

      {/* 6. Focus Blur Layer — Background blur behind centered ProjectFileHub (z-index: 45) */}
      <FocusBlurLayer
        isBlurred={
          isProjectHubOpen && !isProjectsActive && !isTransitioningToProjects
        }
      />

      {/* 7. Project Layer — Optical Center Project File Hub (z-index: 60) */}
      <ProjectLayer
        isHomeVisible={
          isHomeVisible &&
          !isTransitioningToAbout &&
          !isProjectsActive &&
          !isTransitioningToProjects
        }
        onOpenChange={setIsProjectHubOpen}
        onOpenProjects={handleProjectsRequested}
        isNavigating={isTransitioningToProjects}
      />

      {/* 8. About Discovery Layer — Hanging ID Card Pull-Down Entry (z-index: 70) */}
      <AboutDiscoveryLayer
        isHomeStable={
          isHomeStable && !isProjectsActive && !isTransitioningToProjects
        }
        isAboutActive={
          isAboutActive ||
          isTransitioningToAbout ||
          isTransitioningToHome ||
          isProjectsActive ||
          isTransitioningToProjects
        }
        forceTrigger={forceIdCardTeaser}
        onAboutRequested={handleAboutRequested}
        onDismiss={handleDiscoveryDismissed}
      />

      {/* 9. Cursor Layer (z-index: 100) */}
      <CursorLayer />
    </section>
  );
};

export default MainPage;
