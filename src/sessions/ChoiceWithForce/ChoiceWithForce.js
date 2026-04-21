import React, { useState } from 'react';
import styles from './ChoiceWithForce.module.css';
import Sidebar from './Sidebar/Sidebar';
import SimulationCanvas from './SimulationCanvas';
import Rules from './Rules';

export default function ChoiceWithForce() {
    const [activeRules, setActiveRules] = useState(new Set());

    const toggleRule = (ruleId) => {
        setActiveRules(prev => {
            const next = new Set(prev);
            if (next.has(ruleId)) {
                next.delete(ruleId);
            } else {
                next.add(ruleId);
            }
            return next;
        });
    };

    const clearRules = () => setActiveRules(new Set());

    return (
        <div className={styles.root}>
            <Sidebar
                Rules={Rules}
                activeRules={activeRules}
                toggleRule={toggleRule}
                clearRules={clearRules}
            />
            <SimulationCanvas activeRules={activeRules} />
        </div>
    );
}