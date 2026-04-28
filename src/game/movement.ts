/**
 * movement.ts
 *
 * This file handles how the robot moves around the grid.
 *
 * It defines:
 * - the allowed movement directions
 * - the robot’s starting position
 * - how a move updates the robot’s location
 *
 * Movement is constrained to stay within the bounds of the grid.
 */

import { GRID_SIZE, Point } from './shapes';

/**
 * The four directions the robot can move.
 *
 * Each direction corresponds to a change in row/column:
 * - up: decrease row
 * - down: increase row
 * - left: decrease column
 * - right: increase column
 */
export type Direction = 'up' | 'down' | 'left' | 'right';

/**
 * The robot starts in the center of the grid.
 *
 * On a 9×9 grid, { row: 4, col: 4 } is the middle.
 */
export const START_POINT: Point = { row: 4, col: 4 };

/**
 * Move the robot one step in the given direction.
 *
 * Example:
 * If the robot is at:
 *   { row: 4, col: 4 }
 *
 * and moves "up", it becomes:
 *   { row: 3, col: 4 }
 */
export function move(point: Point, direction: Direction): Point {
  const delta = {
    up: { row: -1, col: 0 },
    down: { row: 1, col: 0 },
    left: { row: 0, col: -1 },
    right: { row: 0, col: 1 }
  }[direction];

/**
 * Boundary behavior:
 * The robot cannot leave the grid.
 * If it tries to move past an edge, it stays at the boundary.
 *
 * Example:
 * If the robot is at the top row (row 0) and moves "up",
 * it will remain at row 0.
 */
  return {
    row: Math.min(GRID_SIZE - 1, Math.max(0, point.row + delta.row)),
    col: Math.min(GRID_SIZE - 1, Math.max(0, point.col + delta.col))
  };
}
