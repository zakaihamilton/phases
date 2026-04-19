import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Controls.module.css';

export default function Controls({ navTo }) {
  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlsWrapper}>
        <button onClick={() => navTo('up')} className={`${styles.btn} ${styles.btnUp}`} title="Previous Phase (Up)">
          <ChevronUp size={24} />
        </button>
        <button onClick={() => navTo('left')} className={`${styles.btn} ${styles.btnLeft}`} title="Previous Sub-Phase (Left)">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => navTo('down')} className={`${styles.btn} ${styles.btnDown}`} title="Next Phase (Down)">
          <ChevronDown size={24} />
        </button>
        <button onClick={() => navTo('right')} className={`${styles.btn} ${styles.btnRight}`} title="Next Sub-Phase (Right)">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
