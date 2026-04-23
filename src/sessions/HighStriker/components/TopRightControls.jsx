import React from 'react';
import { Maximize, Eye, EyeOff } from 'lucide-react';
import styles from '../HighStriker.module.css';

export default function TopRightControls({ hudVisible, setHudVisible }) {
    return (
        <div className={styles['top-right-controls']}>
            <button 
                className={styles['icon-btn']} 
                onClick={() => setHudVisible(v => !v)} 
                title="Toggle HUD (Enter)"
            >
                {hudVisible ? <EyeOff size={24} color="#333" /> : <Eye size={24} color="#333" />}
            </button>
        </div>
    );
}
