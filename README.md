# Holly's Animal Math 🐰

A cheerful math game for kids, built with [React](https://react.dev) + [Vite](https://vite.dev).
Tap along a trail of levels, solve addition / subtraction / "which has more?" puzzles with
animal pictures, earn stars, and collect a new animal friend at the end of each level.

## Getting started

Requires [Node.js](https://nodejs.org) 18+.

```bash
npm install        # install dependencies
npm run dev        # start dev server → http://localhost:5173
npm run build      # production build → dist/
npm run preview    # preview the production build
npm run lint       # lint
```

## How the game works

- **Map** — a scrolling trail of 12 levels. Level 1 is open; each level unlocks the next.
- **Play** — 5 questions per level. Question types:
  - `add` — count two groups of animals and pick the total.
  - `sub` — some animals hop away; pick how many are left.
  - `compare` — tap the group with MORE (or FEWER).
- **Reward** — stars (3 = no mistakes, 2 = ≤2, 1 otherwise) plus the animal you unlocked.
- **Collection** — every animal friend you've found so far.

Progress (best stars per level + collected animals) is saved to `localStorage`
under the key **`holly-math-v1`**.

## Project structure

```
src/
├── levels.js                 # the 12 levels: type, difficulty, unlockable animal, colors
├── game.js                   # pure logic (question generation) + shared style helpers
├── App.jsx                   # game state machine + screen routing
├── screens/
│   ├── MapScreen.jsx         # level-select trail
│   ├── PlayScreen.jsx        # the quiz itself (add / sub / compare)
│   ├── RewardScreen.jsx      # stars, confetti, unlocked animal
│   └── CollectionScreen.jsx  # animal friends grid
├── App.css                   # frame layout + keyframe animations
├── index.css                 # reset / base styles
└── main.jsx                  # entry point
```

### Where to make common changes

- **Add / edit a level** → [src/levels.js](src/levels.js)
- **Change how questions are generated** → `genOne` in [src/game.js](src/game.js)
- **Tune difficulty** (`sumMax`, `minMax`, `lo`/`hi`) → per-level in [src/levels.js](src/levels.js)
- **Reword praise / cheers** → `CHEERS` in [src/screens/RewardScreen.jsx](src/screens/RewardScreen.jsx)

Fonts (Baloo 2, Patrick Hand) load from Google Fonts in [index.html](index.html).

## Deploying to GitHub Pages

1. Uncomment `base: '/mathquiz/'` in [vite.config.js](vite.config.js).
2. Push to `main` — the workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys.
3. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.

## License

[MIT](LICENSE)
