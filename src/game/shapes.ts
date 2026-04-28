/**
 * shapes.ts
 *
 * This file contains the core "world model" for the Robot Game.
 *
 * It defines:
 * - the possible hidden objects
 * - how the robot senses a cell
 * - how observations are stored
 * - how the game decides which shapes are still possible
 * - how confidence scores are calculated
 */

export type Point = { row: number; col: number };

/**
 * The five possible object identities for the robot to discover.
 */
export type ShapeName =
  | 'Block'
  | 'Diagonal Line'
  | 'Horizontal Line'
  | 'Vertical Line'
  | 'L Shape';

/**
 * The robot only receives one bit of sensory information:
 * either the current cell is empty, or it contains part of the object.
 */
export type Sensation = 'empty' | 'filled';

/**
 * A shape is defined by:
 * - name: the label shown in the UI
 * - tagline: short explanation for tutorial cards
 * - description: longer explanation for tutorial cards
 * - points: the filled cells that make up the object
 */
export type ShapeDefinition = {
  name: ShapeName;
  tagline: string;
  description: string;
  points: Point[];
  origin?: Point;
};

/**
 * The board is a 9 × 9 grid.
 */
export const GRID_SIZE = 9;

/**
 * Default location used for drawing the blog post tutorial example shapes.
 *
 * Important:
 * Prediction does NOT assume the object is fixed here.
 * This is just a convenient display position in the middle
 * of the board.
 */
export const OBJECT_ORIGIN: Point = { row: 3, col: 3 };

/**
 * Move a list of local shape points onto the board.
 *
 * Example:
 * A local point { row: 0, col: 0 } with origin { row: 3, col: 3 }
 * becomes board point { row: 3, col: 3 }.
 */
const translate = (points: Point[], origin = OBJECT_ORIGIN): Point[] =>
  points.map((p) => ({ row: p.row + origin.row, col: p.col + origin.col }));

/**
 * The five shape types shown in the tutorial and used by the game.
 *
 * Each shape is first written in local coordinates, then translated onto
 * the board for display/play.
 */
export const SHAPES: ShapeDefinition[] = [
  {
    name: 'Block',
    tagline: 'A compact 3 × 3 square.',
    description:
      'Most nearby movements touch the same solid object, so the sensory pattern becomes dense and stable.',
    points: translate([
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
      { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }
    ])
  },
  {
    name: 'Diagonal Line',
    tagline: 'Five consecutive dots in a diagonal.',
    description:
      'A line rewards motion along one axis. Step off the axis, and sensation disappears.',
    points: translate([
      { row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 },
      { row: 3, col: 3 }, { row: 4, col: 4 }
    ], { row: 2, col: 2 })
  },
  {
    name: 'Horizontal Line',
    tagline: 'Five consecutive dots horizontally.',
    description:
      'A horizontal line rewards movement left and right. Step above or below it, and sensation disappears.',
    points: translate([
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
      { row: 0, col: 3 }, { row: 0, col: 4 }
    ], { row: 4, col: 2 })
  },
  {
    name: 'Vertical Line',
    tagline: 'Five consecutive dots vertically.',
    description:
      'A vertical line rewards movement up and down. Step left or right of it, and sensation disappears.',
    points: translate([
      { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 },
      { row: 3, col: 0 }, { row: 4, col: 0 }
    ], { row: 2, col: 4 })
  },
  {
    name: 'L Shape',
    tagline: 'Three vertical dots, then two dots extending right from the bottom dot.',
    description:
      'The turn is the clue: movement reveals both a vertical stem and a horizontal rightward base.',
    points: translate([
      { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 },
      { row: 2, col: 1 }, { row: 2, col: 2 }
    ])
  }
];

/**
 * Convert a point into a stable string key.
 *
 * Useful for Maps/Sets because objects like { row: 1, col: 2 }
 * are not directly comparable by value in JavaScript.
 */
export const pointKey = (p: Point) => `${p.row},${p.col}`;

/**
 * Check whether two points refer to the same grid cell.
 */
export const samePoint = (a: Point, b: Point) => a.row === b.row && a.col === b.col;

/**
 * Check whether a shape contains a specific board cell.
 */
export const containsPoint = (shape: ShapeDefinition, point: Point) =>
  shape.points.some((p) => samePoint(p, point));

/**
 * The robot's sensory system.
 *
 * Given a hidden shape and a location, return:
 * - 'filled' if that cell is part of the object
 * - 'empty' if that cell is not part of the object
 */
export function senseAt(shape: ShapeDefinition, point: Point): Sensation {
  return containsPoint(shape, point) ? 'filled' : 'empty';
}

/**
 * The structure of a single memory created by the robot after probing a cell.
 *
 * This is the core evidence used by the prediction system.
 */
export type Observation = {
  id: string;
  step: number;
  point: Point;
  sensation: Sensation;
};

/**
 * Convert a shape back into local/object-centered coordinates.
 *
 * Example:
 * If a shape is currently at:
 *   { row: 5, col: 6 }, { row: 6, col: 6 }
 *
 * normalizePoints turns it back into:
 *   { row: 0, col: 0 }, { row: 0, col: 1 }
 *
 * This is what allows prediction to reason about the abstract shape
 * independent of where it happens to be on the board.
 */
function normalizePoints(points: Point[]): Point[] {
  const minRow = Math.min(...points.map((p) => p.row));
  const minCol = Math.min(...points.map((p) => p.col));

  return points.map((p) => ({
    row: p.row - minRow,
    col: p.col - minCol
  }));
}

/**
 * Generate every legal board placement for a shape.
 *
 * This is the prediction step using relative shape along the reference frame.
 *
 * Instead of asking:
 *   "Does this object match only in its display position?"
 *
 * We ask:
 *   "Could this object-centered pattern fit anywhere on the board
 *    and explain what the robot has sensed?"
 */
function possiblePlacements(shape: ShapeDefinition): ShapeDefinition[] {
  const normalized = normalizePoints(shape.points);

  const maxRow = Math.max(...normalized.map((p) => p.row));
  const maxCol = Math.max(...normalized.map((p) => p.col));

  const placements: ShapeDefinition[] = [];

  for (let rowOffset = 0; rowOffset <= GRID_SIZE - maxRow - 1; rowOffset++) {
    for (let colOffset = 0; colOffset <= GRID_SIZE - maxCol - 1; colOffset++) {
      placements.push({
        ...shape,
        points: normalized.map((p) => ({
          row: p.row + rowOffset,
          col: p.col + colOffset
        }))
      });
    }
  }

  return placements;
}

/**
 * Return the shapes that are still possible.
 *
 * A shape survives if at least one possible placement of that shape matches
 * every observation the robot has made so far.
 */
export function candidatesFor(observations: Observation[]) {
  return SHAPES.filter((shape) =>
    possiblePlacements(shape).some((placement) =>
      observations.every((obs) => senseAt(placement, obs.point) === obs.sensation)
    )
  );
}

/**
 * Calculate a confidence score for each shape.
 *
 * For each possible shape:
 * 1. Try that shape in every possible board location.
 * 2. Count how many observations each placement explains.
 * 3. Use the best placement as the confidence score.
 * 4. Mark the shape eliminated only if no placement explains all observations.
 */
export function confidenceFor(observations: Observation[]) {
  return SHAPES.map((shape) => {
    const placements = possiblePlacements(shape);

    const bestMatches = Math.max(
      ...placements.map((placement) =>
        observations.filter((obs) => senseAt(placement, obs.point) === obs.sensation).length
      )
    );

    const hasValidPlacement = placements.some((placement) =>
      observations.every((obs) => senseAt(placement, obs.point) === obs.sensation)
    );

    return {
      name: shape.name,
      score:
        observations.length === 0
          ? 33
          : Math.round((bestMatches / observations.length) * 100),
      eliminated: observations.length > 0 && !hasValidPlacement
    };
  });
}

/**
 * Randomly choose a hidden shape AND randomly place it on the grid.
 * - We choose a shape
 * - Normalize it to its object-centered form
 * - Place it at a random valid position on the board
 */
export function chooseHiddenShape() {
  /**
   * Step 1: Pick a random shape identity
   */
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];

  /**
   * Step 2: Convert shape back to local (object-centered) coordinates
   *
   * This removes any fixed board positioning so we can reposition it freely.
   */
  const normalized = normalizePoints(shape.points);

  /**
   * Step 3: Compute shape size
   *
   * We need to know how far it extends so we don't place it outside the grid.
   */
  const maxRow = Math.max(...normalized.map((p) => p.row));
  const maxCol = Math.max(...normalized.map((p) => p.col));

  /**
   * Step 4: Pick a random valid position on the grid
   *
   * The shape must fit entirely inside the grid, so we subtract its size.
   */
  const rowOffset = Math.floor(Math.random() * (GRID_SIZE - maxRow));
  const colOffset = Math.floor(Math.random() * (GRID_SIZE - maxCol));

  /**
   * Step 5: Create a new shape instance at the random position
   *
   * Each point is shifted by the random offsets.
   */
  return {
    ...shape,
    // the origin is the top-left edge of the object
    origin: { row: rowOffset, col: colOffset },
    points: normalized.map((p) => ({
      row: p.row + rowOffset,
      col: p.col + colOffset
    }))
  };
}