import React from 'react';
import { PlayCircle } from 'lucide-react';
import { towerLevels } from '../data';
import styles from './NarrativePanel.module.css';

export default function NarrativePanel({ 
    currentScene, 
    sceneData, 
    purificationStep, 
    hudVisible 
}) {
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 100);
        return () => clearTimeout(timer);
    }, []);

    if (!isLoaded) return null;

    return (
        <div 
            className={`
                ${styles['narrative-panel']} 
                ${currentScene === 0 ? styles['center-panel'] : styles['side-panel']} 
                ${!hudVisible ? styles['hud-hidden'] : ''}
            `}
        >
            <div className={styles['panel-content']}>
                <h2 key={sceneData.subtitle + (currentScene === 4 ? purificationStep : '')} className={styles.subtitle}>
                    {sceneData.subtitle}
                    {currentScene === 4 && towerLevels[purificationStep] && (
                        <span 
                            className={styles['phase-badge']}
                            style={{ color: towerLevels[purificationStep].color }}
                        >
                            : {towerLevels[purificationStep].phase}
                        </span>
                    )}
                </h2>
                <h1 key={sceneData.title} className={styles.title}>{sceneData.title}</h1>
                <p key={sceneData.text} className={styles.description}>{sceneData.text}</p>

                {currentScene === 4 && (
                    <div className={styles['power-meter-container']}>
                        <p className={styles['meter-label']}>Coarseness (Hit Strength):</p>
                        <div className={styles['power-meter']}>
                            {[0, 1, 2, 3, 4].map(step => (
                                <div
                                    key={step}
                                    className={`
                                        ${styles['power-chunk']} 
                                        ${4 - purificationStep >= step ? styles.filled : styles.empty}
                                        ${4 - purificationStep >= step ? styles[
                                            purificationStep === 0 ? 'crown' :
                                            purificationStep === 1 ? 'wisdom' :
                                            purificationStep === 2 ? 'understanding' :
                                            purificationStep === 3 ? 'small-face' :
                                            'kingdom'
                                        ] : ''}
                                    `}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {currentScene === 0 && (
                    <div className={styles['start-prompt']}>
                        <PlayCircle size={18} />
                        <span>Navigate with Arrows • Space to Strike • Enter for HUD</span>
                    </div>
                )}

                <div className={styles['progress-container']}>
                    {Array.from({ length: 10 }).map((_, i) => {
                        let isFilled = false;
                        let isCurrent = false;
                        
                        const currentIndex = currentScene < 4 
                            ? currentScene 
                            : (currentScene === 4 ? 4 + purificationStep : 9);

                        if (i < currentIndex) isFilled = true;
                        if (i === currentIndex) isCurrent = true;

                        return (
                            <div 
                                key={i} 
                                className={`
                                    ${styles['progress-pill']} 
                                    ${isFilled ? styles.filled : ''} 
                                    ${isCurrent ? styles.current : ''}
                                `} 
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
