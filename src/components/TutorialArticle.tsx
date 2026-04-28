/**
 * TutorialArticle.tsx
 *
 * This component renders the "learn first" portion of the experience.
 *
 * It introduces key ideas from the Thousand Brains Theory before the user
 * interacts with the game.
 *
 * The structure is educational:
 * 1. A high-level thousand brains theory overview (hero section)
 * 2. The possible objects (pre-defined models for the game)
 * 3. Core principles (explaining key thousand brain concepts)
 * 4. A unifying insight (reference frames)
 *
 * By the time the user reaches the game, they already have intuition
 * about how movement, sensation, and prediction work together.
 */

import { Brain, Compass, MousePointer2, Network } from 'lucide-react';
import { SHAPES } from '../game/shapes';
import { ShapePreview } from './ShapePreview';

export function TutorialArticle() {
  return (
    <article className="article">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">Tutorial  · The Robot Game</div>
          <h1>Movement + sensation = understanding</h1>
          <p>
            This mini lesson turns the core Thousand Brains Theory principle about sensorimotor learning and inference
            into a playable browser puzzle: an agent cannot see a full picture, but it can move, touch and see a single
            cell, remember locations, and let multiple hypotheses for models compete.
          </p>
          <a className="primary-button hero-button" href="#play">Skip the tutorial and start the game</a>
        </div>
        <div className="hero-panel">
          <Brain size={54} />
          <p>
            The thousand brains theory posits that cortical columns are the base unit of intelligence. A cortical column-like
            learner does not need a full picture all at once. It can build a model by pairing local features
            with locations in a reference frame (in this tutorial, the reference frame is a simplified 2D reality, 
            represented by x and y coordinates).

          </p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div className="eyebrow">The Hidden Objects</div>
          <h2>Five Possible Objects</h2>
          <p>
            The robot is dropped into a 2D grid that contains one of these shapes. The diagrams are visible to you now, 
            but hidden during play.
          </p>
        </div>
        <div className="shape-cards">
          {SHAPES.map((shape) => (
            <div className="shape-card" key={shape.name}>
              <ShapePreview shape={shape} />
              <h3>{shape.name}</h3>
              <p className="tagline">{shape.tagline}</p>
              <p>{shape.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="concept-grid">
        <div className="concept-card">
          <MousePointer2 />
          <h3>1. Perception is active</h3>
          <p>
            A single touch is ambiguous. A sequence of touches is informative because each new movement asks the object a question,
            inquiring where the object exists within space.
          </p>
        </div>
        <div className="concept-card">
          <Compass />
          <h3>2. Location gives sensation meaning</h3>
          <p>
            “Filled” (i.e. there is an object here) is not enough. “The pattern of filled squares in a reference frame" allows us to map
            sensation to the model of an object.
          </p>
        </div>
        <div className="concept-card">
          <Network />
          <h3>3. Observations vote</h3>
          <p>
            Each shape has different empty/filled readings. As evidence accumulates, all the different observations (representing cortical columns)
            share their data (voting), so that any shape who no longer matches the data disappears from the possibility list.
          </p>
        </div>
      </section>

      <section className="lesson-callout">
        <div>
          <div className="eyebrow">The Magic of Reference Frames</div>
          <h2>Reference frames turn scattered touches into object knowledge</h2>
        </div>
        <p>
          The game is intentionally tiny, but the reference frame pattern is powerful: the learner moves, receives a local feature, 
          records that feature at a location relative to the object's top left corner (this is an oversimplified version
          of how reference frames track the distance between an object and an agent), and updates its candidate object models.
        </p>
      </section>
    </article>
  );
}
