import {SegmentVector} from '../data/segment';

/**
 * Returns segments sorted by sortKey if sort-key is data-driven.
 * For constant sort-key, returns the original segments unchanged.
 * 
 * @param segments - The segment vector to potentially sort
 * @param sortKeyIsDataDriven - Whether the sort-key property is data-driven
 * @returns A new SegmentVector with sorted segments, or the original if not data-driven
 */
export function getSegmentsSortedBySortKey(
    segments: SegmentVector,
    sortKeyIsDataDriven: boolean
): SegmentVector {
    if (!sortKeyIsDataDriven) {
        return segments;
    }

    const sortedSegments = segments.get().slice();
    sortedSegments.sort((a, b) => {
        const aKey = a.sortKey ?? 0;
        const bKey = b.sortKey ?? 0;
        return aKey - bKey;
    });
    return new SegmentVector(sortedSegments);
}
