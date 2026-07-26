/**
 * Layout properties that are allowed to use feature-state expressions.
 * These properties require main-thread re-evaluation when feature state changes.
 * 
 * This list should match LAYOUT_PROPERTIES_ALLOWING_FEATURE_STATE in maplibre-style-spec.
 */
export const LAYOUT_PROPERTIES_ALLOWING_FEATURE_STATE = [
    'circle-sort-key',
    'fill-sort-key',
    'line-sort-key'
] as const;

export type LayoutPropertyAllowingFeatureState = typeof LAYOUT_PROPERTIES_ALLOWING_FEATURE_STATE[number];
