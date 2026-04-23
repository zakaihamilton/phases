import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from './NavigationControls.module.css';

export default function NavigationControls({ 
    prevStepFn, 
    nextStepFn, 
    currentScene, 
    isAnimating, 
    hudVisible, 
    scenesCount, 
    purificationStep 
}) {
    return (
        <div className={`${styles['nav-controls']} ${!hudVisible ? styles['hud-hidden'] : ''}`}>
            <button
                className={styles['nav-btn']}
                onClick={prevStepFn}
                disabled={currentScene === 0}
            >
                <ChevronLeft size={36} />
            </button>
            <button
                className={styles['nav-btn']}
                onClick={nextStepFn}
                disabled={(currentScene === 5)}
            >
                <ChevronRight size={36} />
            </button>
        </div>
    );
}
