import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import RuleToggle from './RuleToggle';
import { Power, Settings } from 'lucide-react';

const Sidebar = ({ Rules, activeRules, toggleRule, clearRules }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                setSelectedIndex((prev) => (prev + 1) % Rules.length);
            } else if (e.key === 'ArrowUp') {
                setSelectedIndex((prev) => (prev - 1 + Rules.length) % Rules.length);
            } else if (e.key === 'Enter') {
                const rule = Rules[selectedIndex];
                if (rule) {
                    toggleRule(rule.id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [Rules, selectedIndex, toggleRule]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div className={styles.headerTop}>
                    <Settings size={14} className={styles.headerIcon} />
                    <h1 className={styles.title}>
                        System Rules
                    </h1>
                </div>
                <div className={styles.subtitle}>
                    {activeRules.size} {activeRules.size === 1 ? 'Rule' : 'Rules'} currently active
                </div>
            </div>

            <div className={styles.rulesList}>
                {Rules.map((rule, index) => {
                    const isActive = activeRules.has(rule.id);
                    const isFocused = index === selectedIndex;
                    return (
                        <RuleToggle
                            key={rule.id}
                            rule={rule}
                            isActive={isActive}
                            isFocused={isFocused}
                            onToggle={() => {
                                setSelectedIndex(index);
                                toggleRule(rule.id);
                            }}
                        />
                    );
                })}
            </div>

            <div className={styles.footer}>
                <button
                    onClick={clearRules}
                    disabled={activeRules.size === 0}
                    className={styles.haltButton}
                >
                    <Power size={12} className={styles.btnIcon} />
                    <span>Halt All Rules</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
