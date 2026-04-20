import React, { useState, useEffect, useRef } from 'react';
import styles from './Launcher.module.css';

import sessions from '../sessions';
import Hub from './Hub';

export default function Launcher() {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const cardRefs = useRef([]);
    const transitionTimeout = useRef(null);

    useEffect(() => {
        return () => {
            if (transitionTimeout.current) clearTimeout(transitionTimeout.current);
        };
    }, []);

    useEffect(() => {
        if (!isTransitioning) {
            const timer = setTimeout(() => {
                cardRefs.current[0]?.focus();
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    useEffect(() => {
        if (isTransitioning) return;
        const handleGlobalKeyDown = (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                if (!cardRefs.current.includes(document.activeElement)) {
                    e.preventDefault();
                    cardRefs.current[0]?.focus();
                }
            }
        };
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [isTransitioning]);

    const handleKeyDown = (e, index) => {
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = (index + 1) % sessions.length;
            cardRefs.current[nextIndex]?.focus();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const nextIndex = (index - 1 + sessions.length) % sessions.length;
            cardRefs.current[nextIndex]?.focus();
        }
    };

    const launchView = (id) => {
        setIsTransitioning(true);
        transitionTimeout.current = setTimeout(() => {
            location.hash = id;
        }, 300);
    };

    return (
        <div className={styles.appContainer}>
            <div className={styles.bgElements}>
                <div className={styles.bgGlow}></div>
                <div className={styles.bgPattern}></div>
            </div>

            <Hub
                cardRefs={cardRefs}
                launchView={launchView}
                handleKeyDown={handleKeyDown}
                isTransitioning={isTransitioning}
            />
        </div>
    );
}