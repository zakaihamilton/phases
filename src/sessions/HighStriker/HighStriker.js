import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameEngine from './GameEngine';
import { scenes, towerLevels } from './data';
import NarrativePanel from './components/NarrativePanel';
import NavigationControls from './components/NavigationControls';
import TopRightControls from './components/TopRightControls';
import styles from './HighStriker.module.css';

export default function HighStriker() {
    const canvasRef = useRef(null);
    const engineRef = useRef(null);

    const [currentScene, setCurrentScene] = useState(0);
    const [purificationStep, setPurificationStep] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [hudVisible, setHudVisible] = useState(true);

    const sceneData = scenes[currentScene];

    useEffect(() => {
        if (canvasRef.current) {
            engineRef.current = new GameEngine(canvasRef.current);
            engineRef.current.start();
        }
        return () => {
            if (engineRef.current) {
                engineRef.current.stop();
            }
        };
    }, []);

    const processNavigation = useCallback((forward) => {
        if (isAnimating) return;

        let nextScene = currentScene;
        let nextStep = purificationStep;

        if (forward) {
            if (currentScene === scenes.length - 1) {
                if (purificationStep < scenes[currentScene].steps - 1) {
                    nextStep = purificationStep + 1;
                } else return;
            } else {
                nextScene = currentScene + 1;
                nextStep = 0;
            }
        } else {
            if (currentScene === scenes.length - 1 && purificationStep > 0) {
                nextStep = purificationStep - 1;
            } else if (currentScene > 0) {
                nextScene = currentScene - 1;
                if (nextScene === scenes.length - 1) {
                    nextStep = scenes[scenes.length - 1].steps - 1;
                }
            } else return;
        }

        setCurrentScene(nextScene);
        setPurificationStep(nextStep);

        const engine = engineRef.current;
        if (!engine) return;

        const completeAnim = () => setIsAnimating(false);

        // Keep active target level dynamically attached in scene 4
        if (nextScene >= 3) {
            engine.activeTargetLevel = towerLevels[nextStep].id;
        } else {
            engine.activeTargetLevel = -1;
        }

        if (nextScene === 0) {
            engine.playSequence('RESET_IDLE', 0, null);
        }
        else if (nextScene === 1) {
            setIsAnimating(true);
            engine.playSequence('WINDUP', 0, completeAnim);
        }
        else if (nextScene === 2) {
            if (currentScene === 3) engine.puckY = 0;
            setIsAnimating(true);
            engine.playSequence('SWING_IMPACT', 0, completeAnim);
        }
        else if (nextScene === 3) {
            setIsAnimating(true);
            if (engine.animState === 'IDLE' || engine.animState === 'WINDUP_HOLD') {
                engine.hammerAngle = Math.PI * 0.85;
            }
            engine.playSequence('SHOOT', 1.0, completeAnim);
        }
        else if (nextScene === 4) {
            setIsAnimating(true);
            const ratio = towerLevels[nextStep].ratio;
            engine.playSequence('FULL_HIT', ratio, completeAnim);
        }

    }, [currentScene, purificationStep, isAnimating]);

    const nextStepFn = useCallback(() => processNavigation(true), [processNavigation]);
    const prevStepFn = useCallback(() => processNavigation(false), [processNavigation]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                setHudVisible(v => !v);
                return;
            }
            if (e.key === 'ArrowRight' || e.key === ' ') {
                e.preventDefault();
                nextStepFn();
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevStepFn();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [nextStepFn, prevStepFn]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className={styles['app-container']}>
            <canvas ref={canvasRef} className={styles['game-canvas']} />

            <TopRightControls 
                hudVisible={hudVisible} 
                setHudVisible={setHudVisible} 
                toggleFullscreen={toggleFullscreen} 
            />

            <NarrativePanel 
                currentScene={currentScene} 
                sceneData={sceneData} 
                purificationStep={purificationStep} 
                hudVisible={hudVisible} 
            />

            <NavigationControls 
                prevStepFn={prevStepFn} 
                nextStepFn={nextStepFn} 
                currentScene={currentScene} 
                isAnimating={isAnimating} 
                hudVisible={hudVisible} 
                scenesCount={scenes.length} 
                purificationStep={purificationStep} 
            />
        </div>
    );
}
