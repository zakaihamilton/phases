import React from 'react';
import { Sparkles, Footprints, ArrowLeft } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            <button onClick={() => window.location.hash = 'launcher'} className={styles.backButton}>
                <ArrowLeft size={20} />
                <span>Back to Hub</span>
            </button>
            <div className={styles.headerContent}>
                <div className={styles.headerTagline}>
                    <Sparkles color="#fbbf24" size={28} />
                    <span className={styles.headerTaglineText}>Talmud Eser Sefirot</span>
                </div>
                <h1 className={styles.headerTitle}>The Four Phases of Desire</h1>
                <p className={styles.headerSubtitle}>
                    <Footprints size={24} color="#64748b" />
                    Visualizing "Choice & Intent" through an everyday journey.
                </p>
            </div>
        </header>
    );
};

export default Header;
