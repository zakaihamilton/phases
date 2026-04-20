import { useState, useEffect, useRef, useMemo } from 'react';
import { MAPPED_DATA, FLAT_DATA } from './Data.js';

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
            const newHash = `#concentric-circles/${activeItem.id}`;
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
            else if (e.key === "Escape") window.location.hash = 'launcher';
        };

        let touchStartX = 0;
        let touchStartY = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        };

        const handleTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const dx = touchEndX - touchStartX;
            const dy = touchEndY - touchStartY;
            const absX = Math.abs(dx);
            const absY = Math.abs(dy);

            if (Math.max(absX, absY) < 40) return; // threshold

            if (absX > absY) {
                // Horizontal swipe (Inverted: direction matches swipe)
                if (dx > 0) performNav("right");
                else performNav("left");
            } else {
                // Vertical swipe (Inverted: direction matches swipe)
                if (dy > 0) performNav("down");
                else performNav("up");
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("touchstart", handleTouchStart, { passive: true });
        window.addEventListener("touchend", handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, []);

    const navTo = (direction) => {
        performNav(direction);
    };

    const targetFlatIndex = useMemo(() =>
        FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s),
        [activePath]
    );

    const activeSubData = useMemo(() => FLAT_DATA[targetFlatIndex], [targetFlatIndex]);

    const navigationState = useMemo(() => {
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

        return { visibleList, radiusLevels };
    }, [activePath]);

    return {
        activePath,
        activeSubData,
        visibleList: navigationState.visibleList,
        radiusLevels: navigationState.radiusLevels,
        navTo,
        targetFlatIndex
    };
}