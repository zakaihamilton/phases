import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import styles from '../HighStriker.module.css';

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
                disabled={currentScene === 0 || isAnimating}
            >
                <ChevronLeft size={36} />
            </button>
            <button
                className={styles['nav-btn']}
                onClick={nextStepFn}
                disabled={(currentScene === scenesCount - 1 && purificationStep === 4) || isAnimating}
            >
                <ChevronRight size={36} />
            </button>
        </div>
    );
}
