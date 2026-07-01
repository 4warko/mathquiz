# MathQuiz

A math quiz web app built with [React](https://react.dev) + [Vite](https://vite.dev).

## Getting started

Requires [Node.js](https://nodejs.org) 18+.

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:5173)
npm run dev

# Build for production (output in dist/)
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint
```

## Project structure

```
mathquiz/
├── public/            # Static assets served as-is
├── src/
│   ├── App.jsx        # Root component (starter quiz lives here)
│   ├── App.css        # Component styles
│   ├── index.css      # Global styles
│   └── main.jsx       # App entry point
├── index.html         # HTML shell
├── vite.config.js     # Vite configuration
└── eslint.config.js   # ESLint (flat config)
```

## Deploying to GitHub Pages

1. Uncomment `base: '/mathquiz/'` in [vite.config.js](vite.config.js).
2. Push to `main` — the workflow in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) builds and deploys automatically.
3. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.

## License

[MIT](LICENSE)
