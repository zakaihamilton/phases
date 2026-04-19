import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './Controls.module.css';

export default function Controls({ navTo }) {
  return (
    <div className={styles.controlsContainer}>
      <div className={styles.controlsWrapper}>
        <button onClick={() => navTo('up')} className={`${styles.btn} ${styles.btnUp}`}>
          <ChevronUp size={32} />
        </button>
        <button onClick={() => navTo('down')} className={`${styles.btn} ${styles.btnDown}`}>
          <ChevronDown size={32} />
        </button>
        <button onClick={() => navTo('left')} className={`${styles.btn} ${styles.btnLeft}`}>
          <ChevronLeft size={32} />
        </button>
        <button onClick={() => navTo('right')} className={`${styles.btn} ${styles.btnRight}`}>
          <ChevronRight size={32} />
        </button>
      </div>
    </div>
  );
}
