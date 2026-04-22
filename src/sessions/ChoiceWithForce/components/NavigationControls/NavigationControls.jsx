import React from 'react';
import styles from './NavigationControls.module.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * NavigationControls component – cinematic buttons replacing the slider.
 * 
 * @param {Object} props - Component properties
 * @param {number} props.currentIndex - Current state index
 * @param {number} props.total - Total number of states
 * @param {Function} props.onNext - Next button handler
 * @param {Function} props.onPrev - Previous button handler
 */
const NavigationControls = ({ currentIndex, total, onNext, onPrev }) => {
    return (
        <div className={styles.container}>
            <div className={styles.controlsGroup}>
                <button 
                    onClick={onPrev} 
                    disabled={currentIndex === 0}
                    className={styles.navButton}
                    aria-label="Previous State"
                >
                    <ChevronLeft className={styles.icon} />
                    <span className={styles.buttonText}>PREVIOUS</span>
                </button>

                <div className={styles.centerInfo}>
                    <span className={styles.hintText}>USE ARROWS OR BUTTONS</span>
                </div>

                <button 
                    onClick={onNext} 
                    disabled={currentIndex === total - 1}
                    className={styles.navButton}
                    aria-label="Next State"
                >
                    <span className={styles.buttonText}>NEXT</span>
                    <ChevronRight className={styles.icon} />
                </button>
            </div>
            
            {/* Minimal Background Progress Bar */}
            <div className={styles.progressBar}>
                <div 
                    className={styles.progressFill} 
                    style={{ width: `${(currentIndex / (total - 1)) * 100}%` }} 
                />
            </div>
        </div>
    );
};

export default NavigationControls;
