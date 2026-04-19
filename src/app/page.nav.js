import { useState, useEffect, useRef } from 'react';
import { MAPPED_DATA, FLAT_DATA } from './data.js';

export function useNavigation() {
    const [activePath, setActivePath] = useState({ p: 0, s: 0 });
    const lastNavTime = useRef(0);
    const navThrottleMs = 150; // Minimum time between navigation steps

    // Initial load from hash
    useEffect(() => {
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            const index = FLAT_DATA.findIndex(d => d.id === hash);
            if (index !== -1) {
                const data = FLAT_DATA[index];
                setActivePath({ p: data.pIdx, s: data.sIdx });
            }
        }
    }, []);

    // Update hash on path change
    useEffect(() => {
        const activeItem = FLAT_DATA.find(d => d.pIdx === activePath.p && d.sIdx === activePath.s);
        if (activeItem) {
            // Use replaceState to avoid cluttering history when moving fast
            const newHash = `#${activeItem.id}`;
            if (window.location.hash !== newHash) {
                window.history.replaceState(null, '', newHash);
            }
        }
    }, [activePath]);

    const performNav = (direction) => {
        const now = Date.now();
        if (now - lastNavTime.current < navThrottleMs) return;
        lastNavTime.current = now;

        setActivePath(prev => {
            let { p, s } = prev;
            if (direction === "up") { 
                p = Math.max(0, p - 1); s = 0; 
            } else if (direction === "down") { 
                p = Math.min(MAPPED_DATA.length - 1, p + 1); s = 0; 
            } else if (direction === "left") {
                if (s > 0) s--;
                else if (p > 0) { p--; s = MAPPED_DATA[p].sub.length - 1; }
            } else if (direction === "right") {
                if (s < MAPPED_DATA[p].sub.length - 1) s++;
                else if (p < MAPPED_DATA.length - 1) { p++; s = 0; }
            }
            return { p, s };
        });
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowUp") performNav("up");
            else if (e.key === "ArrowDown") performNav("down");
            else if (e.key === "ArrowLeft") performNav("left");
            else if (e.key === "ArrowRight") performNav("right");
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const navTo = (direction) => {
        performNav(direction);
    };

    const targetFlatIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);
    const activeSubData = FLAT_DATA[targetFlatIndex];

    const visibleList = [];
    const radiusLevels = new Array(FLAT_DATA.length).fill(0);
    
    const completedPhasesCount = activePath.p;
    const currentPhaseSubCount = activePath.s + 1;
    let level = (completedPhasesCount * 1.5) + currentPhaseSubCount;
    
    // Completed phases
    for (let p = 0; p < activePath.p; p++) {
        FLAT_DATA.forEach((d, i) => {
            if (d.pIdx === p) {
                radiusLevels[i] = level;
                visibleList.push(i);
            }
        });
        level -= 1.5; // Gap between condensed phases
    }
    
    // Current phase
    for (let s = 0; s <= activePath.s; s++) {
        const i = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === s);
        if (i !== -1) {
            radiusLevels[i] = level;
            visibleList.push(i);
            level -= 1.0; // Space between active sub phases
        }
    }

    return {
        activePath,
        activeSubData,
        visibleList,
        radiusLevels,
        navTo,
        targetFlatIndex
    };
}