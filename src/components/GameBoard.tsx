/**
 * GameBoard.tsx
 *
 * This is the core interactive component of the application.
 *
 * It is responsible for:
 * - managing game state (robot position, observations, hidden shape)
 * - handling movement and sensing
 * - rendering the grid the robot explores
 * - showing candidate predictions and reference frame information
 *
 * Conceptually, this file is where:
 *   movement + sensation leads to observations, then predictions, and finally understanding
 */

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, RotateCcw, Sparkles } from 'lucide-react';
import { START_POINT, Direction, move } from '../game/movement';
import { candidatesFor, chooseHiddenShape, GRID_SIZE, Observation, pointKey, senseAt, ShapeDefinition } from '../game/shapes';
import { ConfidenceBars } from './ConfidenceBars';
import { ReferenceFramePanel } from './ReferenceFramePanel';

/**
 * Defines one movement button (UI + behavior).
 */
type MoveButton = { label: string; direction: Direction; icon: ReactNode };

/**
 * The four directional movement buttons.
 */
const MOVE_BUTTONS: MoveButton[] = [
  { label: 'Up', direction: 'up', icon: <ArrowUp size={18} /> },
  { label: 'Left', direction: 'left', icon: <ArrowLeft size={18} /> },
  { label: 'Right', direction: 'right', icon: <ArrowRight size={18} /> },
  { label: 'Down', direction: 'down', icon: <ArrowDown size={18} /> }
];

/**
 * RobotGrid renders the grid and shows:
 * - where the robot is
 * - which cells have been visited
 * - what the robot sensed at each cell
 *
 * It does NOT control logic — only visualization.
 */
function RobotGrid({
  hiddenShape,
  robot,
  observations,
  revealed
}: {
  hiddenShape: ShapeDefinition;
  robot: { row: number; col: number };
  observations: Observation[];
  revealed: boolean;
}) {
  /**
   * Convert observations into a lookup map:
   * key = "row,col"
   * value = sensation ("empty" | "filled")
   *
   * This lets us quickly check if a cell has been visited.
   */  
    const touched = new Map(observations.map((obs) => [pointKey(obs.point), obs.sensation]));

  /**
   * Generate every cell in the grid.
   */
    const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => ({
      row: Math.floor(index / GRID_SIZE),
      col: index % GRID_SIZE
    }));

  return (
    <div className="robot-grid" role="grid" aria-label="Blindfolded robot grid">
      {cells.map((cell) => {
        const key = pointKey(cell);
        const isRobot = key === pointKey(robot);
        // if it's game over, reveal all the cells; otherwise only reveal touched cells
        const sensation = revealed ? senseAt(hiddenShape, cell) : touched.get(key);
        return (
          <button
            key={key}
            className={[
              'robot-cell',
              isRobot ? 'robot-here' : '',
              sensation ? `sensed sensed-${sensation}` : ''
            ].join(' ')}
            aria-label={`row ${cell.row}, column ${cell.col}`}
            title={sensation ? `Visited: ${sensation}` : 'Unvisited'}
          >
            {isRobot ? (
              <span className="robot-stack">
                <Eye size={18} />
                {sensation && <small>{sensation[0].toUpperCase()}</small>}
              </span>
            ) : sensation ? (
              sensation[0].toUpperCase()
            ) : (
              ''
            )}
          </button>
        );
      })}
      <span className="sr-only">Hidden answer: {hiddenShape.name}</span>
    </div>
  );
}
/**
 * Main game component
 */
export function GameBoard() {

  /**
   * Hidden object the robot is trying to infer
   */
  const [hiddenShape, setHiddenShape] = useState(() => chooseHiddenShape());
  /**
   * Robot position
   */
  const [robot, setRobot] = useState(START_POINT);
  /**
   * Observation history (the robot’s memory)
   */
  const [observations, setObservations] = useState<Observation[]>(() => [
    {
      id: crypto.randomUUID(),
      step: 1,
      point: START_POINT,
      sensation: senseAt(hiddenShape, START_POINT)
    }
  ]);

  /**
   * Whether to reveal the full board
   */
  const [revealed, setRevealed] = useState(false);

  /**
   * Compute possible candidates based on observations
   */
  const candidates = useMemo(() => candidatesFor(observations), [observations]);
 
  /**
   * Game is "certain" when only one candidate remains
   */
  const isCertain = candidates.length === 1;

  /**
   * Auto-reveal the full board when only one candidate remains.
   */  
  useEffect(() => {
    if (isCertain) {
      // show the whole game board as the game is over
      setRevealed(true);
    }
  }, [isCertain]);
  const latest = observations.at(-1);

  /**
   * Probe a location and record an observation
   */
  function probe(currentPoint = robot) {
    const sensation = senseAt(hiddenShape, currentPoint);
    setObservations((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        step: previous.length + 1,
        point: currentPoint,
        sensation
      }
    ]);
  }

  /**
   * Move robot and immediately probe new location
   */
  function handleMove(direction: Direction) {
    // if there's only one candidate left, the game is over, stop player movement
    if (isCertain) return;

    const next = move(robot, direction);
    setRobot(next);
    probe(next);
  }

   /**
   * Keyboard controls:
   * - Arrow keys → movement
   * - R → reset
   */ 
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
        if (event.key.toLowerCase() === 'r') {
          event.preventDefault();
          reset();
          return;
        }
      const keyToDirection: Record<string, Direction> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right'
      };

      const direction = keyToDirection[event.key];

      if (!direction) return;

      event.preventDefault();
      handleMove(direction);
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [robot, hiddenShape, isCertain]);

  /**
   * Reset game state with a new hidden shape
   */
  function reset() {
    const nextShape = chooseHiddenShape();
    setHiddenShape(nextShape);
    setRobot(START_POINT);
    setObservations([
      {
        id: crypto.randomUUID(),
        step: 1,
        point: START_POINT,
        sensation: senseAt(nextShape, START_POINT)
      }
    ]);
    setRevealed(false);
  }

  return (
    <section className="game-shell" id="play">
      <div className="game-intro">
        <div>
          <div className="eyebrow">Interactive tutorial</div>
          <h2>Play the Robot Game</h2>
          <p>
            Move the agent to discover a hidden object. Each step returns one bit of local data: empty <b>(E)</b> 
            or filled <b>(F)</b>. The goal is to infer the object by actively sampling different data points 
            through sensory movement.
          </p>
        </div>
      </div>

      <div className="game-layout">
        <div className="play-card">
          <div className="status-row">
            <div>
              <span className="muted">Latest sensation</span>
              <strong>{latest ? latest.sensation : 'Move or probe to begin'}</strong>
            </div>
            <div>
              <span className="muted">Candidates left</span>
              <strong>{candidates.map((c) => c.name).join(', ') || 'none'}</strong>
            </div>
          </div>

          <RobotGrid
            hiddenShape={hiddenShape}
            robot={robot}
            observations={observations}
            revealed={revealed}
          />

          <div className="controls">
            <div className="move-pad">
              {MOVE_BUTTONS.map((button) => (
                <button key={button.direction} onClick={() => handleMove(button.direction)}>
                  {button.icon} {button.label}
                </button>
              ))}
               <button
                className="secondary"
                onClick={reset}
                title="Press R to reset"
              >
                Reset (R)
               </button>
            </div>

           </div>

          <div className="answer-row">
            <button className="link-button" onClick={() => setRevealed((value) => !value)}>
              {revealed ? 'Hide answer' : 'Reveal answer'}
            </button>
            {revealed && <strong>The hidden shape is: {hiddenShape.name}</strong>}
          </div>
        </div>

        <div className="side-stack">
          <ConfidenceBars observations={observations} />
          <ReferenceFramePanel
            observations={observations}
            origin={hiddenShape.origin}
          />
        </div>
      </div>
    </section>
  );
}
