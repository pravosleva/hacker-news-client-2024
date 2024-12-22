# Hacker News Client

This is client application for https://github.com/HackerNews/API

[Life demo](https://pravosleva.pro/dist.hacker-news-2024/)

## Minimal Requirements (Infrastructure)
- Node 20.17.0
- npm 10.8.2 (or yarn 1.22.22)

## Technical assignment: UI/UX & Tech stack
- [x] React
- [x] Redux
- [x] React Router v6.x
- [x] Material UI
- [x] 2 pages:
  - [x] Homepage
    - [x] Last 100 news
    - [x] Each news item has visual attrs:
      - [x] Title
      - [x] Rating
      - [x] Author nickname
      - [x] Publish date
    - [x] Button for move to `/news/:id`
    - [x] Refresh list each 60 sec
    - [x] Button for update list
  - [x] News item page
    - [x] Visual news item attrs:
      - [x] Link to url
      - [x] Title
      - [x] Publish date
      - [x] Author nickname
      - [x] Comments counter
      - [x] Comments tree
        - [x] Root comments loaded atomatically
        - [x] Subcomments loaded by click on root comment
      - [x] Button for refresh all comments
      - [x] Button for move to Homepage

## Special features (not from the technical assignment)
- [x] Worker thread for main request queue
  - [x] Shared Worker
  - [x] Dedicated Worker (if Shared Worker not supported)
  - [x] Configurable cache time (newstories list)
- [x] Main thread for comments polling (could be moved to workers too)
- [x] Something from Web API for better UX (scroll)

## FAQ
> Q: Why Hash Router?
> A: hash router for easy external NGINX setttings - could be changed to browser router

> Q: Why Wokers used?
> A: For better browser performance

> Q: Why Vite not latest?
> A: Cuz its unstable yet =)

> Q: Why so much request in browser?
> A: Polling used for refresh each comment per 60 sec - I think, it's logical (could be turned off if necessary)

### Install deps
```shell
yarn
```

### Preview mode on http://localhost:3000
```shell
yarn build && yarn preview
```

### Development mode on http://localhost:3001
```shell
yarn dev
```

## Bundle size analysis
http://localhost/stats.html

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
