import {SegmentVector} from '../segment';
import {toEvaluationFeature} from '../evaluation_feature';
import type {FeatureStates} from '../../source/source_state';
import type {VectorTileLayerLike, VectorTileFeatureLike} from '@maplibre/vt-pbf';
import type {CircleStyleLayer} from '../../style/style_layer/circle_style_layer';
import type {FillStyleLayer} from '../../style/style_layer/fill_style_layer';
import type {LineStyleLayer} from '../../style/style_layer/line_style_layer';

type StyleLayerWithSortKey = CircleStyleLayer | FillStyleLayer | LineStyleLayer;

/**
 * Updates segment sort keys for state-dependent layout properties (e.g. sort-key).
 * Re-evaluates the layout expression with feature state and updates segment.sortKey,
 * then sorts segments by sortKey.
 * 
 * @param segmentVectors - One or more segment vectors to update
 * @param layer - The style layer containing the layout property
 * @param layoutSortKeyProperty - The layout property name (e.g. 'circle-sort-key')
 * @param states - Feature states keyed by source layer and feature ID
 * @param vtLayer - Vector tile layer for feature lookup
 */
export function updateSegmentSortKeys(
    segmentVectors: SegmentVector | SegmentVector[],
    layer: StyleLayerWithSortKey,
    layoutSortKeyProperty: 'circle-sort-key' | 'fill-sort-key' | 'line-sort-key',
    states: FeatureStates,
    vtLayer: VectorTileLayerLike
): void {
    // layout.get is typed per layer; property name is validated by callers.
    const sortKeyExpression = (layer.layout as {get: (name: typeof layoutSortKeyProperty) => any}).get(layoutSortKeyProperty);
    if (!sortKeyExpression) return;

    const sourceLayerId = layer.sourceLayer || '';
    const sourceLayerStates = states[sourceLayerId] || {};

    // Build a map from featureId to feature for efficient lookup
    const featureMap = new Map<number | string, VectorTileFeatureLike>();
    for (let i = 0; i < vtLayer.length; i++) {
        const feature = vtLayer.feature(i);
        if (feature && feature.id !== undefined) {
            featureMap.set(feature.id, feature);
        }
    }

    const vectors = Array.isArray(segmentVectors) ? segmentVectors : [segmentVectors];

    // Re-evaluate sort keys for segments with featureId
    for (const segments of vectors) {
        for (const segment of segments.segments) {
            if (segment.featureId !== undefined) {
                const featureState = sourceLayerStates[segment.featureId] || {};
                const feature = featureMap.get(segment.featureId);
                if (feature) {
                    const evaluationFeature = toEvaluationFeature(feature, false);
                    const sortKey = sortKeyExpression.evaluate(
                        evaluationFeature,
                        featureState,
                        undefined
                    );
                    segment.sortKey = sortKey;
                }
            }
        }

        // Sort segments by sortKey
        segments.segments.sort((a, b) => {
            const aKey = a.sortKey ?? 0;
            const bKey = b.sortKey ?? 0;
            return aKey - bKey;
        });
    }
}
