import React, { useRef, useEffect } from 'react';
import styles from './RuleToggle.module.css';

const RuleToggle = ({ rule, isActive, isFocused, onToggle }) => {
    const buttonRef = useRef(null);

    useEffect(() => {
        if (isFocused && buttonRef.current) {
            buttonRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [isFocused]);

    return (
        <button
            ref={buttonRef}
            onClick={() => onToggle(rule.id)}
            className={`${styles.root} ${isActive ? styles.ruleButtonActive : styles.ruleButtonInactive} ${isFocused ? styles.focused : ''}`}
        >
            {isActive && <div className={styles.statusIndicator} />}
            {isFocused && <div className={styles.focusIndicator} />}
            <div className={styles.ruleHeader}>
                <span className={`${styles.ruleName} ${isActive ? styles.ruleNameActive : styles.ruleNameInactive}`}>
                    {rule.name}
                </span>

                <div className={`${styles.toggleTrack} ${isActive ? styles.toggleTrackActive : styles.toggleTrackInactive}`}>
                    <div className={`${styles.toggleThumb} ${isActive ? styles.toggleThumbActive : styles.toggleThumbInactive}`} />
                </div>
            </div>

            <p className={`${styles.ruleDesc} ${isActive ? styles.ruleDescActive : styles.ruleDescInactive}`}>
                {rule.desc}
            </p>
        </button>
    );
};

export default RuleToggle;
