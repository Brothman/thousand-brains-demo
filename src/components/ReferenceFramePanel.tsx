/**
 * ReferenceFramePanel.tsx
 *
 * This component visualizes how the robot builds an object-centered map.
 *
 * Instead of storing raw grid positions, the robot converts observations into
 * coordinates relative to the object (a reference frame).
 *
 * This demonstrates a core idea from Thousand Brains Theory:
 *   perception = sensation + location (in a shared frame)
 */

import { Observation, Point } from '../game/shapes';

/**
 * Convert a board coordinate into an object-centered coordinate.
 *
 * Example:
 * If the board position is:
 *   { row: 5, col: 6 }
 *
 * and OBJECT_ORIGIN is:
 *   { row: 3, col: 3 }
 *
 * then:
 *   x = 6 - 3 = 3
 *   y = 5 - 3 = 2
 *
 * Result:
 *   { x: 3, y: 2 }
 *
 * This shifts the coordinate system from:
 *   "absolute board position"
 * to:
 *   "position relative to the object"
 */
function toObjectFrame(point: Point, origin: Point) {
  return {
    x: point.col - origin.col,
    y: point.row - origin.row
  };
}

/**
 * Props:
 * - observations: the robot’s history of sensed points
 */
type Props = {
  observations: Observation[];
  origin?: Point;
};

export function ReferenceFramePanel({ observations, origin }: Props) {
  /**
   * Get the most recent observation (the end of the array).
   *
   * This represents the robot's current position in the object-centered reference frame.
   */
  const latest = observations.at(-1);
  /**
   * Convert the latest observation into object-centered coordinates.
   */
const objectLocation =
  latest && origin
    ? toObjectFrame(latest.point, origin)
    : null;

  return (
    <aside className="reference-card">
      <div className="eyebrow">Object-centered reference frame</div>
      <h3>Same movement, better map</h3>
      <p>
        The robot stores sensations as <strong>state + location</strong>. Instead of just “I found a filled cell somewhere,”
        it records “filled at x/y coordinates relative to the object's top left corner.”
      </p>
      <div className="coordinate-readout">
        <span>Latest object coordinate</span>
        <strong>{objectLocation ? `x ${objectLocation.x}, y ${objectLocation.y}` : '—'}</strong>
      </div>
      <div className="observation-list">
        {observations.length === 0 ? (
          <p className="muted">Probe a few cells to start building the object map.</p>
        ) : (
          observations.slice(-6).map((obs) => {
            const frame = origin ? toObjectFrame(obs.point, origin) : { x: 0, y: 0 };
            return (
              <div className="observation-row" key={obs.id}>
                <span>{obs.sensation}</span>
                <code>x {frame.x}, y {frame.y}</code>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
