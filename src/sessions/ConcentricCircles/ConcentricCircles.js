"use client";

import React, { useState, useEffect } from "react";
import styles from "./ConcentricCircles.module.css";
import { useNavigation } from "./Navigation.js";
import Mandala from "./Mandala";
import HUD from "./HUD";
import Controls from "./Controls";
import Summary from "./Summary";

export default function ConcentricCircles() {
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

            <Summary
                activeSubData={activeSubData}
            />

            <Controls
                navTo={navTo}
            />
        </div>
    );
}