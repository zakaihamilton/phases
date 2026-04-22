import React from 'react';
import styles from './InfoPanel.module.css';

/**
 * InfoPanel component to display current state information
 * 
 * @param {Object} props - Component properties
 * @param {string} props.name - Current state name
 * @param {string} props.description - Current state description
 * @param {number} props.currentIndex - Current state index
 * @param {number} props.total - Total number of states
 */
const InfoPanel = ({ name, description, currentIndex, total }) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.indexLabel}>
                    STATE {currentIndex.toString().padStart(2, '0')} / {(total - 1).toString().padStart(2, '0')}
                </span>
                <div className={styles.indicatorContainer}>
                    {Array.from({ length: total }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`${styles.dot} ${i === currentIndex ? styles.activeDot : ''} ${i < currentIndex ? styles.completedDot : ''}`} 
                        />
                    ))}
                </div>
            </div>
            <h1 className={styles.title}>{name}</h1>
            <div className={styles.divider} />
            <p className={styles.description}>{description}</p>
        </div>
    );
};

export default InfoPanel;
