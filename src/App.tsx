/**
 * App.tsx
 *
 * This is the top-level component for the entire application.
 *
 * It acts as the "page layout", composing together:
 * - the tutorial/explanation (TutorialArticle)
 * - the interactive game (GameBoard)
 * - a footer with context about the project
 *
 * Think of this file as the "story wrapper":
 * first the user learns the concept,
 * then they interact with it,
 * then they see the framing of what they just experienced.
 */

import { GameBoard } from './components/GameBoard';
import { TutorialArticle } from './components/TutorialArticle';
import './styles/global.css';

/**
 * The root React component.
 *
 * It renders the full experience in a vertical flow:
 * 1. Explanation (TutorialArticle)
 * 2. Interactive game (GameBoard)
 * 3. Footer (context / attribution)
 */
export default function App() {
  return (
    <main>
      <TutorialArticle />
      <GameBoard />
      <footer className="footer">
        <strong>Thousand Brains Developer Advocate Trial Task</strong>
        <span>A fun follow-along tutorial for movement, sensation, candidate voting, and object-centered reference frames.</span>
      </footer>
    </main>
  );
}
