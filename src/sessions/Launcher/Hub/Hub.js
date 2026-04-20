import React from 'react';
import styles from './Hub.module.css';
import sessions from '../../sessions';

const Hub = ({ cardRefs, launchView, handleKeyDown, isTransitioning }) => (
    <div className={`${styles.launcher} ${isTransitioning ? styles.transitionOut : styles.transitionIn}`}>
        <div className={styles.launcherHeader}>
            <h1 className={styles.launcherTitle}>
                System Concepts <span>Phases</span>
            </h1>
            <p className={styles.launcherDesc}>
                Session demonstrations
            </p>
        </div>

        <div className={styles.cardsGrid}>
            {[...sessions].reverse().map((item, index) => (
                <button
                    key={item.id}
                    ref={(el) => (cardRefs.current[index] = el)}
                    onClick={() => launchView(item.id)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={`${styles.card} ${styles[item.id] || ''}`}
                >
                    <div className={styles.cardGlow} />
                    <div className={styles.cardContent}>
                        <div className={styles.cardIconWrapper}>
                            <item.icon />
                        </div>
                        <h3 className={styles.cardTitle}>{item.label}</h3>
                        <h3 className={styles.cardDate}>{item.date}</h3>
                        <p className={styles.cardDesc}>{item.description}</p>
                    </div>
                </button>
            ))}
        </div>
    </div>
);

export default Hub;
