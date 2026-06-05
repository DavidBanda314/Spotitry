import React from 'react';
import styles from './index.module.css';

const SkeletonBox = ({ className, style }) => (
    <div className={`${styles.shimmer} ${className || ''}`} style={style} />
);

const SkeletonCard = ({ circle = false, lines = 3 }) => (
    <div className={styles.card}>
        <div className={`${styles.shimmer} ${styles.image} ${circle ? styles.imageCircle : ''}`} />
        <div className={styles.body}>
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`${styles.shimmer} ${styles.line}`}
                    style={{ width: i === 0 ? '85%' : i === lines - 1 ? '50%' : '70%' }}
                />
            ))}
        </div>
    </div>
);

const SkeletonGrid = ({ count = 8, className, circle = false, lines = 3 }) => (
    <div className={className || styles.grid}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} circle={circle} lines={lines} />
        ))}
    </div>
);

export { SkeletonBox, SkeletonCard, SkeletonGrid };
