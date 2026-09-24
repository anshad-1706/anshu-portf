import React, { useCallback, useEffect, useState } from "react";
import { HeroIntro } from "./components/HeroIntro";
import { FloatingContactNav } from "./components/FloatingContactNav";
import { MainPage } from "./components/main-page";

export const App: React.FC = () => {
  const [isScene04Active, setIsScene04Active] = useState(false);
  const [introCompleted, setIntroCompleted] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.has("skipIntro") || window.location.hash === "#home";
    }
    return false;
  });
  const [isHomeActive, setIsHomeActive] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.has("skipIntro") || window.location.hash === "#home";
    }
    return false;
  });

  const handleScene04Change = useCallback((active: boolean) => {
    if (active) {
      setIsScene04Active(true);
    }
  }, []);

  // One-way cinematic handoff:
  // Once Scene 04 interface handoff is triggered (P3 exit >= 0.98),
  // allow the 320ms intentional pause to cleanly settle.
  // Then permanently lock introCompleted = true for the remainder of this page session,
  // hand off scroll context to MainPage, and ensure reverse scrolling cannot replay HeroIntro.
  useEffect(() => {
    if (!isScene04Active || introCompleted) return;

    const timer = setTimeout(() => {
      setIntroCompleted(true);
      window.scrollTo(0, 0);
    }, 320);

    return () => clearTimeout(timer);
  }, [isScene04Active, introCompleted]);

  const handleHomeActiveChange = useCallback((active: boolean) => {
    if (active) {
      setIsHomeActive(true);
    }
  }, []);

  return (
    <main>
      {!introCompleted && (
        <HeroIntro
          onScene04Change={handleScene04Change}
          isLocked={isScene04Active}
        />
      )}
      <FloatingContactNav isActive={isHomeActive} />
      <MainPage
        isNavActive={isHomeActive}
        isIntroCompleted={introCompleted}
        onHomeActiveChange={handleHomeActiveChange}
      />
    </main>
  );
};

export default App;
