import React from 'react';
import styles from './index.module.css';

const SkeletonCard = ({ width, height, borderRadius }) => (
    <div
        className={styles.skeleton}
        style={{
            width: width || '100%',
            height: height || '200px',
            borderRadius: borderRadius || '12px',
        }}
    />
);

const SkeletonGrid = ({ count, cardHeight, borderRadius }) => (
    <div className={styles.grid}>
        {Array.from({ length: count || 6 }).map((_, i) => (
            <SkeletonCard key={i} height={cardHeight} borderRadius={borderRadius} />
        ))}
    </div>
);

export { SkeletonCard, SkeletonGrid };
