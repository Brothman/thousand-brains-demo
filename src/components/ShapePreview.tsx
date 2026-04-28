/**
 * ShapePreview.tsx
 *
 * This component renders a visual preview of a shape on a grid.
 *
 * It is used in the TutorialArticle class to show what each possible object
 * looks like before the game begins.
 *
 * The preview is NOT interactive — it simply displays which cells are
 * filled for a given shape.
 */

import { GRID_SIZE, pointKey, ShapeDefinition } from '../game/shapes';

/**
 * Props for the ShapePreview component.
 *
 * - shape: the shape definition (points + metadata)
 * - compact: whether to render a smaller version of the grid
 */
type Props = {
  shape: ShapeDefinition;
  compact?: boolean;
};

export function ShapePreview({ shape, compact = false }: Props) {
  /**
   * Convert the shape's points into a Set for fast lookup.
   *
   * Why?
   * We need to quickly check:
   *   "Is this grid cell part of the shape?"
   *
   * Using a Set makes this O(1) instead of scanning an array each time.
   */
  const filled = new Set(shape.points.map(pointKey));

  /**
   * Generate every cell in the grid.
   *
   * We flatten the grid into a 1D array, then convert each index into:
   *   { row, col }
   *
   * Example:
   * index 0 → { row: 0, col: 0 }
   * index 10 → { row: 1, col: 1 }
   */
  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
    row: Math.floor(index / GRID_SIZE),
    col: index % GRID_SIZE
  }));

  return (
    <div className={compact ? 'mini-grid' : 'shape-grid'} aria-label={`${shape.name} diagram`}>
     {/**
       * Render each cell in the grid.
       *
       * For each cell:
       * - Check if it's part of the shape (using the Set)
       * - If yes → apply "filled" styling
       * - If no → render as empty
       */}
      {cells.map((cell) => (
        <span
          key={pointKey(cell)}
          className={filled.has(pointKey(cell)) ? 'shape-cell filled' : 'shape-cell'}
        />
      ))}
    </div>
  );
}
