/**
 * ConfidenceBars.tsx
 *
 * This component visualizes the "voting" process between candidate shapes.
 *
 * It shows:
 * - which shapes are still possible
 * - how well each shape matches the robot’s observations
 *
 * This is where the abstract idea of "hypotheses competing" becomes visible.
 */

import { Observation, confidenceFor } from '../game/shapes';

/**
 * Props:
 * - observations: the robot’s memory of what it has sensed so far
 */
type Props = {
  observations: Observation[];
};

export function ConfidenceBars({ observations }: Props) {
  /**
   * Compute confidence scores for each shape.
   *
   * confidenceFor() returns an array like:
   * [
   *   { name: 'Block', score: 100, eliminated: false },
   *   { name: 'L Shape', score: 100, eliminated: false },
   *   { name: 'Vertical Line', score: 0, eliminated: true }
   *   { name: 'Diagonal Line', score: 0, eliminated: true }
   *   { name: 'Horizontal Line', score: 0, eliminated: true }
   * ]
   *
   * This is the "voting" output from the model.
   */
  const confidence = confidenceFor(observations);

  return (
    <section className="confidence-card">
      <div className="eyebrow">Object voting</div>
      <h3>The hypotheses narrow as evidence arrives</h3>
      <p>
        Based on observations sharing data (voting) with each other about the visited locations, we see which objects are still possible.
        Wrong predictions drop to a 0% match.
      </p>
      <div className="bars">
        {confidence.map((item) => (
          <div className="bar-row" key={item.name}>
            <div className="bar-label">
              <span>{item.name}</span>
              <small>{item.eliminated ? 'eliminated' : `${item.score}% match`}</small>
            </div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${item.eliminated ? 8 : item.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
