# Tinda.ph

React + Vite + TypeScript + Tailwind starter app for Tinda.ph.

## Stack
- React 18
- Vite 5
- TypeScript 5
- Tailwind CSS 3

## Theme templates preserved
The original sample with the three color templates is preserved as:
- `tindaph-v6.sample.html`

The new app keeps the same three theme modes:
- `light`
- `dark`
- `noir`

## Project scripts
After installing dependencies, use:

```bash
npm run dev
npm run build
npm run preview
npm run check
```

## Install dependencies

```bash
npm install
```

If your network is unstable, retry once connected to a working network.

## Structure
- `index.html` - Vite entry HTML
- `src/main.tsx` - React bootstrap
- `src/App.tsx` - Initial themed app shell
- `src/index.css` - Tailwind imports + theme variables
- `tailwind.config.ts` - Tailwind configuration
- `postcss.config.cjs` - PostCSS plugins
