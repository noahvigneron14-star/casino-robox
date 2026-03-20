# FlipCasino - Installation locale

## Prérequis
- [Node.js](https://nodejs.org) (version 18 ou plus)
- [pnpm](https://pnpm.io) ou npm

## Installation

### Avec pnpm (recommandé)
```bash
pnpm install
pnpm dev
```

### Avec npm
```bash
npm install
npm run dev
```

Ouvre ensuite **http://localhost:3000** dans ton navigateur.

## Build pour production

```bash
pnpm build
# ou
npm run build
```

Les fichiers se trouvent dans le dossier `dist/` — tu peux les déposer sur n'importe quel hébergeur statique (Netlify, Vercel, GitHub Pages...).
