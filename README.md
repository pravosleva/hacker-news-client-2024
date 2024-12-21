# Hacker News Client

[Demo](https://pravosleva.pro/dist.hacker-news-2024/)

## Requirements of tech stack
- [x] React
- [x] Redux
- [x] React Router v6.x

## Original features
- [x] Workers for main request queue
  - [x] Shared Worker
  - [x] Dedicated Worker (if Shared Worker not supported)
  - [x] Configurable cache time (newstories list)

## FAQ
Q: Why Hash Router?
A: hash router for easy external NGINX setttings - could be changed to browser router

Q: Why Wokers used?
A: For better browser performance

Q: Why Vite not latest?
A: Cuz its unstable yet =)

Q: Why so much request in browser?
A: Polling used for refresh each comment per 60 sec - I think, it's logical (could be turned off if necessary)

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
