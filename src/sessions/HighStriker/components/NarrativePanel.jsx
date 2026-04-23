import React from 'react';
import { PlayCircle } from 'lucide-react';
import styles from '../HighStriker.module.css';

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
            key={sceneData.title}
            className={`
                ${styles['narrative-panel']} 
                ${currentScene === 0 ? styles['center-panel'] : styles['side-panel']} 
                ${!hudVisible ? styles['hud-hidden'] : ''}
                ${styles['fade-in']}
            `}
        >
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
            </div>
        </div>
    );
}
