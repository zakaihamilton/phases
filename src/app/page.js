"use client";

import React, { useState, useEffect } from "react";
import styles from "./page.module.css";
import { useNavigation } from "./page.nav.js";
import Mandala from "../components/Mandala";
import HUD from "../components/HUD";
import Controls from "../components/Controls";
import SummaryPanel from "../components/SummaryPanel";

export default function Phases() {
  const [cameraScale, setCameraScale] = useState(1);

  const {
    activePath,
    activeSubData,
    visibleList,
    radiusLevels,
    navTo,
  } = useNavigation();

  useEffect(() => {
    const updateScale = () => {
      const requiredSize = 2200;
      const minDim = Math.min(window.innerWidth, window.innerHeight);
      setCameraScale(minDim / requiredSize);
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return (
    <div className={styles.appContainer}>
      <div className={styles.bgSpace} />
      
      <Mandala 
        cameraScale={cameraScale}
        activePath={activePath}
        visibleList={visibleList}
        radiusLevels={radiusLevels}
      />

      <HUD 
        activeSubData={activeSubData}
        activePath={activePath}
      />

      <SummaryPanel 
        activeSubData={activeSubData}
      />

      <Controls 
        navTo={navTo}
      />
    </div>
  );
}