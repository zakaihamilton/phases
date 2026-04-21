// EngineController.jsx
import React, { useState, useEffect } from 'react';
import SimulationCanvas from './SimulationCanvas/SimulationCanvas';
import { SpiritualStates } from './Timeline';

const EngineController = () => {
    const [currentStateIndex, setCurrentStateIndex] = useState(0);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setCurrentStateIndex((prev) => Math.min(prev + 1, SpiritualStates.length - 1));
            } else if (e.key === 'ArrowLeft') {
                setCurrentStateIndex((prev) => Math.max(prev - 1, 0));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Button Handlers
    const handleNext = () => setCurrentStateIndex(prev => Math.min(prev + 1, SpiritualStates.length - 1));
    const handlePrev = () => setCurrentStateIndex(prev => Math.max(prev - 1, 0));

    // Slider Handler
    const handleSliderChange = (e) => setCurrentStateIndex(parseInt(e.target.value, 10));

    const currentState = SpiritualStates[currentStateIndex];

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden', fontFamily: 'sans-serif' }}>
            {/* The WebGL/Canvas Renderer */}
            <SimulationCanvas activeSequence={currentState.activeSequence} />

            {/* Top Info Panel */}
            <div style={{
                position: 'absolute',
                top: 40,
                left: 40,
                color: 'white',
                pointerEvents: 'none',
                maxWidth: '450px',
                background: 'rgba(0, 0, 0, 0.4)',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(4px)'
            }}>
                <h3 style={{ textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0', opacity: 0.6, fontSize: '0.85rem' }}>
                    State {currentStateIndex} / {SpiritualStates.length - 1}
                </h3>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem', fontWeight: '300' }}>{currentState.name}</h1>
                <p style={{ lineHeight: '1.6', opacity: 0.85, margin: 0 }}>{currentState.description}</p>
            </div>

            {/* Bottom Interactive Control Bar */}
            <div style={{
                position: 'absolute',
                bottom: 40,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '80%',
                maxWidth: '800px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                background: 'rgba(0, 0, 0, 0.6)',
                padding: '20px 30px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                color: 'white'
            }}>
                {/* Timeline Slider */}
                <input
                    type="range"
                    min="0"
                    max={SpiritualStates.length - 1}
                    value={currentStateIndex}
                    onChange={handleSliderChange}
                    style={{ width: '100%', cursor: 'pointer', accentColor: '#aaa' }}
                />

                {/* Controls & Legend */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={handlePrev}
                        disabled={currentStateIndex === 0}
                        style={{
                            padding: '10px 20px',
                            background: currentStateIndex === 0 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                            color: currentStateIndex === 0 ? 'rgba(255,255,255,0.3)' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentStateIndex === 0 ? 'default' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        &larr; Previous
                    </button>

                    <div style={{ fontSize: '0.85rem', opacity: 0.5, letterSpacing: '1px' }}>
                        USE SLIDER, BUTTONS, OR ARROW KEYS
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={currentStateIndex === SpiritualStates.length - 1}
                        style={{
                            padding: '10px 20px',
                            background: currentStateIndex === SpiritualStates.length - 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                            color: currentStateIndex === SpiritualStates.length - 1 ? 'rgba(255,255,255,0.3)' : 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: currentStateIndex === SpiritualStates.length - 1 ? 'default' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        Next &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EngineController;