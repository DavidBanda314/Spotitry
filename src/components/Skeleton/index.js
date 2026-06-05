import React from 'react';
import styles from './index.module.css';

const SkeletonBox = ({ className, style }) => (
    <div className={`${styles.shimmer} ${className || ''}`} style={style} />
);

const SkeletonCard = ({ width, height, borderRadius, circle = false, lines }) => {
    // Legacy "plain box" usage: explicit sizing and no card-specific props.
    if ((width || height || borderRadius) && lines === undefined && !circle) {
        return (
            <div
                className={styles.shimmer}
                style={{
                    width: width || '100%',
                    height: height || '200px',
                    borderRadius: borderRadius || '12px',
                }}
            />
        );
    }
    const lineCount = lines === undefined ? 3 : lines;
    return (
        <div className={styles.card}>
            <div className={`${styles.shimmer} ${styles.image} ${circle ? styles.imageCircle : ''}`} />
            <div className={styles.body}>
                {Array.from({ length: lineCount }).map((_, i) => (
                    <div
                        key={i}
                        className={`${styles.shimmer} ${styles.line}`}
                        style={{ width: i === 0 ? '85%' : i === lineCount - 1 ? '50%' : '70%' }}
                    />
                ))}
            </div>
        </div>
    );
};

const SkeletonGrid = ({ count = 8, className, circle = false, lines, cardHeight, borderRadius }) => (
    <div className={className || styles.grid}>
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard
                key={i}
                circle={circle}
                lines={lines}
                height={cardHeight}
                borderRadius={borderRadius}
            />
        ))}
    </div>
);

export { SkeletonBox, SkeletonCard, SkeletonGrid };
