import React, { useState } from "react";
import { HeroIntro } from "./components/HeroIntro";
import { FloatingContactNav } from "./components/FloatingContactNav";
import { MainPage } from "./components/main-page";

export const App: React.FC = () => {
  const [isScene04Active, setIsScene04Active] = useState(false);

  return (
    <main>
      <HeroIntro onScene04Change={setIsScene04Active} />
      <FloatingContactNav isActive={isScene04Active} />
      <MainPage />
    </main>
  );
};

export default App;
