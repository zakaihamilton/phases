import React, { useState, useEffect } from 'react';
import styles from './Sidebar.module.css';
import RuleToggle from './RuleToggle';
import { Power, Settings } from 'lucide-react';

const Sidebar = ({ AVAILABLE_RULES, activeRules, toggleRule, clearRules }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowDown') {
                setSelectedIndex((prev) => (prev + 1) % AVAILABLE_RULES.length);
            } else if (e.key === 'ArrowUp') {
                setSelectedIndex((prev) => (prev - 1 + AVAILABLE_RULES.length) % AVAILABLE_RULES.length);
            } else if (e.key === 'Enter') {
                const rule = AVAILABLE_RULES[selectedIndex];
                if (rule) {
                    toggleRule(rule.id);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [AVAILABLE_RULES, selectedIndex, toggleRule]);

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
                {AVAILABLE_RULES.map((rule, index) => {
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
