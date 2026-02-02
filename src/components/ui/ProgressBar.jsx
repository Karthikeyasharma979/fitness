import React from 'react';
import styles from './ProgressBar.module.css';

const ProgressBar = ({ value, max, label, color = 'blue' }) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div className={styles.wrapper}>
            {(label || value) && (
                <div className={styles.labelContainer}>
                    <span>{label}</span>
                    <span className={styles.value}>{value} / {max}</span>
                </div>
            )}
            <div className={styles.container}>
                <div
                    className={styles.fill}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
