import React from 'react';
import { PlayCircle } from 'lucide-react';
import styles from '../HighStriker.module.css';

export default function NarrativePanel({ 
    currentScene, 
    sceneData, 
    purificationStep, 
    hudVisible 
}) {
    return (
        <div className={`
            ${styles['narrative-panel']} 
            ${currentScene === 0 ? styles['center-panel'] : styles['side-panel']} 
            ${!hudVisible ? styles['hud-hidden'] : ''}
        `}>
            <div className={styles['panel-content']}>
                <h2 className={styles.subtitle}>{sceneData.subtitle}</h2>
                <h1 className={styles.title}>{sceneData.title}</h1>
                <p className={styles.description}>{sceneData.text}</p>

                {currentScene === 4 && (
                    <div className={styles['power-meter-container']}>
                        <p className={styles['meter-label']}>Coarseness (Hit Strength):</p>
                        <div className={styles['power-meter']}>
                            {[0, 1, 2, 3, 4].map(step => (
                                <div
                                    key={step}
                                    className={`${styles['power-chunk']} ${4 - purificationStep >= step ? styles.filled : styles.empty}`}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {currentScene === 0 && (
                    <div className={styles['start-prompt']}>
                        <PlayCircle size={20} />
                        <span>Press Space/Arrows | Press Enter to Toggle HUD</span>
                    </div>
                )}
            </div>
        </div>
    );
}
