package com.photography.portfolio.entity;

/**
 * Classifies a photo's layout shape based on its pixel dimensions.
 * Used to drive masonry gallery sizing on the frontend without
 * needing to load the image first.
 */
public enum Orientation {
    PORTRAIT,
    LANDSCAPE,
    SQUARE;

    /**
     * Detects orientation from raw pixel dimensions.
     * A small tolerance treats near-equal dimensions as SQUARE.
     */
    public static Orientation detect(long width, long height) {
        if (width <= 0 || height <= 0) {
            return LANDSCAPE; // safe fallback
        }
        double ratio = (double) width / (double) height;
        if (Math.abs(ratio - 1.0) <= 0.05) {
            return SQUARE;
        }
        return ratio > 1.0 ? LANDSCAPE : PORTRAIT;
    }
}
