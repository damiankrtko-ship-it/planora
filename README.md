# Planora

Live verzia: https://damiankrtko-ship-it.github.io/planora/

Planora je responzívny osobný priestor v slovenčine pre poznámky, úlohy a plánovanie. MVP funguje bez backendu a dáta ukladá do `localStorage`.

## Spustenie

```bash
npm ci
npm run dev
```

Kontroly kvality:

```bash
npm run lint
npm test
npm run build
```

## Deploy

Push do `main` automaticky spustí quality workflow a bezpečný deploy na GitHub Pages.
Workflow používa oficiálne GitHub Pages actions, artifact z `dist` a minimálne potrebné
permissions. Pull requesty spúšťajú kontroly kvality, ale nenasadzujú aplikáciu.

V repozitári treba v Settings → Pages nastaviť Source na **GitHub Actions**. Lokálny vývoj
funguje cez `npm run dev` na `http://localhost:5173/`; produkčný build používa base URL `/planora/`.

## Release postup

1. Vytvor feature branch a pull request.
2. Po úspešnom quality workflow merge-ni PR do `main`.
3. Push do `main` spustí build a deploy; výsledok over na live URL.

Obsahuje dashboard so vzorovými dátami pri prvom spustení, CRUD úloh a poznámok, vyhľadávanie, tagy, pripínanie, priority, mesačný kalendár, dark/light tému, prázdne stavy, mobilnú navigáciu a klávesnicovo použiteľné ovládacie prvky.
