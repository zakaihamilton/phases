import React from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './BackButton.module.css';

const BackButton = () => {
    return (
        <button onClick={() => window.location.hash = 'launcher'} className={styles.root}>
            <ArrowLeft size={20} />
        </button>
    );
};

export default BackButton;
