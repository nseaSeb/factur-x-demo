# Factur-X demo

Démo d'usage de la librairie [`factur-x-ts`](https://www.npmjs.com/package/factur-x-ts) — un générateur/parseur Factur-X (EN 16931) TypeScript-natif. Ce repo n'est **pas** un système de facturation en production : c'est un banc d'essai qui expose les trois capacités de la lib (générer un PDF Factur-X, le parser, le valider) via une API HTTP, avec un petit front React pour les manipuler sans curl.

## Ce que ça démontre

- **`generate()`** — `POST /invoices` (persiste les données) puis `GET /invoices/:id/pdf` (génère le PDF/A-3 Factur-X à la volée)
- **`parse()`** — `POST /invoices/parse` (upload d'un PDF Factur-X, extraction du XML embarqué, round-trip vérifiable via `GET /invoices`)
- **`validateEn16931()`** — `POST /invoices/validate` (rapport de validation sans persistance)
- Un catalogue produits (CRUD) pour pré-remplir les lignes de facture, histoire d'avoir un scénario de démo qui ressemble à un vrai usage plutôt qu'un formulaire vide à chaque fois

L'API expose ces ressources en style HATEOAS léger (chaque réponse porte ses `_links` : self, pdf, validation, collection…) plutôt que des routes à deviner.

Détail : [`docs/demo-walkthrough.md`](docs/demo-walkthrough.md) pour un scénario pas-à-pas (créer → générer le PDF → le ré-uploader → valider).

## Stack

- **API** : NestJS 11, TypeORM + Postgres, Swagger (`/api/docs`)
- **Front** : React + Vite (`front/`), consomme l'API via son proxy dev, suit les hyperliens renvoyés plutôt que des routes codées en dur
- **Lib testée** : [`factur-x-ts`](https://www.npmjs.com/package/factur-x-ts) (générateur/parseur Factur-X)

## Lancer le projet

```bash
pnpm install
cp .env.example .env   # ajuster DB_HOST/DB_USER/DB_PASSWORD/DB_NAME
pnpm run setup          # crée la DB + joue les migrations
pnpm run start
```

API sur `http://localhost:3200`, doc Swagger sur `http://localhost:3200/api/docs`.

Front (terminal séparé) :

```bash
cd front
pnpm install
pnpm run dev
```

Front sur `http://localhost:5173`, proxy Vite vers l'API — pas de CORS à gérer en dev.

## Hors scope

- Authentification (dépendances passport présentes mais aucun guard branché)
- Validation XSD/Schematron officielle EN 16931 (la lib ne la fait pas, à faire en aval avant tout envoi réel)
- Front production-ready (c'est un outil de démo, pas une UI de facturation complète)

## Tests

```bash
pnpm run test        # unitaires
pnpm run test:e2e     # e2e (nécessite une DB Postgres accessible)
pnpm run lint
```
