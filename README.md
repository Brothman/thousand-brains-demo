# Thousand Brains Developer Advocate Trial Task — The Robot Game

This project is a small, interactive React browser game that demonstrates three core ideas from the Thousand Brains Theory:

- **Movement + sensation = understanding.**
- **Reference Frames help locate models of objects in space**
- **Voting by sharing data helps predict an accurate model of reality**

The learner controls a robotic agent on a grid object containing a hidden object. At each step, the agent receives a local binary sensory label — `empty` or `filled` — and the interface narrows the possible hidden shapes by comparing the observations against candidate object models.

## Live Website
You can find the live website to play with here: https://thousand-brains-demo.netlify.app/

## Target audience

This tutorial is aimed at technically curious developers who may not know the Thousand Brains Theory yet, but can understand a concept through a small interactive system. It is also aimed at bringing a smile to my interviewers' faces.

It is intentionally simple enough to read and play within one sitting, but polished enough to show how an educational developer advocate tutorial could grow into a larger lesson.

## What it teaches

1. **Active sensing** — perception improves when the agent moves and samples the world.
2. **Candidate models** — each shape requires different empty/filled readings to be the hidden model we're experiencing.
3. **Object-centered reference frames** — states become useful when stored as states at locations relative to an object.
4. **Voting / narrowing** — as observations accumulate, inconsistent candidate shapes are eliminated.

## Hidden shapes

The game randomly chooses one of five hidden objects:

- **Block** — a solid 3 × 3 square.
- **Diaganol Line** — five consecutive dots vertically, or horizontally.
- **Horizontal Line** — five consecutive dots horizontally.
- **Vertical Line** — five consecutive dots vertically.
- **L Shape** — three vertical dots, with the bottom dot extending two more cells to the right.

## How to run locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite, usually:

```bash
http://localhost:5173
```

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```txt
thousand-brains-demo/
├── src/
│   ├── components/
│   │   ├── ConfidenceBars.tsx        # Animated hypothesis/candidate voting display
│   │   ├── GameBoard.tsx             # Main playable robot game
│   │   ├── ReferenceFramePanel.tsx   # Object-centered coordinate visualization
│   │   ├── ShapePreview.tsx          # Visual diagrams for each hidden shape
│   │   └── TutorialArticle.tsx       # Blog-style lesson before the game
│   ├── game/
│   │   ├── movement.ts               # Small movement model for the agent
│   │   └── shapes.ts                 # Shape definitions, sensory model, candidate logic
│   ├── styles/
│   │   └── global.css                # Complete visual design system
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
└── README.md
```

## Design notes

### Why a game?

Based on my discussions with Viviane, we both agreed an interactive tutorial teaches us far better than a static explanation. A browser game makes the idea concrete: the user experiences the same limitation as the agent. They cannot see the hidden object. They must move, gather sensations, and let the evidence update their beliefs.

### Why this sensory model?

The game uses a small local model:

- `empty`: no object/data point at the current location
- `filled`: the current cell contains part of the hidden object

This is not meant to be a biological simulation. It is a teaching scaffold: local features plus movement plus location create an object model.

### How candidate narrowing works

Every observation is saved as:

```ts
{
  point: { row, col },
  sensation: 'empty' | 'filled'
}
```

Each candidate shape predicts what sensation should occur at that grid location. If a candidate can no longer predict the correction
sensation given the experiential data, it is eliminated from the strict candidate list. The confidence bars show how well each candidate
still matches the evidence (in this demo, it is either 0% or 100%).

### How reference frames are shown

The panel converts grid coordinates into object-centered coordinates by subtracting an origin of the object (in this demo, it's the top left corner of the object). This teaches users more about how reference frames work (tracking the distance between an object and an agent):

```ts
x = point.col - origin.col
y = point.row - origin.row
```

The user sees the latest binary reading stored as a location relative to the object rather than as a disconnected touch.

One flaw in this demo model is that the system already knows where the object's top-left corner is (the origin),
which isn't an accurate model for how reference frames work. In reality, the reference frame data
would be more dynamic as the agent moves relatives to the object and compares it location to the models it's testing against.

## Possible extensions

- Fix object origin so it more accurately represents how reference frames work and are dynamically developed
- Add rotations and translations of the same shape.
- Let the user design their own hidden object.
- Add a replay mode showing how evidence changed after every movement.
- Add a Monty-inspired code section that maps the toy model to a real learning-module abstraction.
