import React from 'react';
import styles from './ChoiceWithForce.module.css';
import EngineController from "./EngineController";

export default function ChoiceWithForce() {

    return (
        <div className={styles.root}>
            <EngineController />
        </div>
    );
}