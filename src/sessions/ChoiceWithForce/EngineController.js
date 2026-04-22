// EngineController.jsx
import React, { useState } from 'react';
import SimulationCanvas from './SimulationCanvas/SimulationCanvas';
import { SpiritualStates } from './Timeline';
import { useNavigation, getInitialStateIndex } from './hooks/useNavigation';
import InfoPanel from './components/InfoPanel/InfoPanel';
import NavigationControls from './components/NavigationControls/NavigationControls';

const EngineController = () => {
    const [currentStateIndex, setCurrentStateIndex] = useState(getInitialStateIndex());


    // Use custom hook for keyboard navigation and hash state
    useNavigation({
        currentStateIndex,
        setCurrentStateIndex
    });

    // Handlers
    const handleNext = () => setCurrentStateIndex(prev => Math.min(prev + 1, SpiritualStates.length - 1));
    const handlePrev = () => setCurrentStateIndex(prev => Math.max(prev - 1, 0));

    const currentState = SpiritualStates[currentStateIndex];

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden' }}>
            {/* The WebGL/Canvas Renderer */}
            <SimulationCanvas activeSequence={currentState.activeSequence} />

            {/* Top Info Panel */}
            <InfoPanel 
                name={currentState.name}
                description={currentState.description}
                currentIndex={currentStateIndex}
                total={SpiritualStates.length}
            />

            {/* Bottom Navigation Controls */}
            <NavigationControls 
                currentIndex={currentStateIndex}
                total={SpiritualStates.length}
                onNext={handleNext}
                onPrev={handlePrev}
            />
        </div>
    );
};

export default EngineController;