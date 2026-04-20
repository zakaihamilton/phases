import React, { useState } from 'react';
import styles from './Summary.module.css';

const Summary = ({ activeSubData }) => {
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(true);

  if (!activeSubData || !activeSubData.summary) {
    return null;
  }

  // Expecting exactly two paragraphs per the data structure.
  const paragraphs = activeSubData.summary;

  const CollapseIcon = ({ isCollapsed }) => (
    <svg
      className={`${styles.collapseIcon} ${isCollapsed ? styles.rotated : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <>
      {paragraphs[0] && (
        <div className={`${styles.leftPanel} ${isLeftCollapsed ? styles.collapsedContainer : ''}`}>
          <div className={`${styles.summaryGlass} ${isLeftCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.summaryHeader} onClick={() => setIsLeftCollapsed(!isLeftCollapsed)}>
              {!isLeftCollapsed && (
                <h2 className={styles.summaryTitle} style={{ color: activeSubData.color }}>
                  Overview
                </h2>
              )}
              <button className={styles.collapseBtn}>
                <CollapseIcon isCollapsed={isLeftCollapsed} />
              </button>
            </div>
            {!isLeftCollapsed && (
              <div className={styles.summaryContent}>
                <p className={styles.paragraph}>
                  {paragraphs[0]}
                </p>
                <p className={styles.paragraph}>
                  {paragraphs[1]}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(Summary);
