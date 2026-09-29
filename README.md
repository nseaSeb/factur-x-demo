# Factur-X demo

Démo d'usage de la librairie [`factur-x-ts`](https://www.npmjs.com/package/factur-x-ts) — un générateur/parseur Factur-X (EN 16931) TypeScript-natif. Ce repo n'est **pas** un système de facturation en production : c'est un banc d'essai qui expose les trois capacités de la lib (générer un PDF Factur-X, le parser, le valider) via une API HTTP, avec un petit front React pour les manipuler sans curl.

## Ce que ça démontre

- **`generate()`** — `POST /invoices` (persiste les données) puis `GET /invoices/:id/pdf` (génère le PDF/A-3 Factur-X à la volée)
- **`parse()`** — `POST /invoices/parse` (upload d'un PDF Factur-X, extraction du XML embarqué, round-trip vérifiable via `GET /invoices`)
- **`validateEn16931()`** — `POST /invoices/validate` (rapport de validation sans persistance)
- **`computeTotals()`** — `POST /invoices/totals` : à partir des seules lignes, dérive les totaux de ligne, la ventilation TVA et les totaux du document en arithmétique décimale exacte ; un montant fourni est vérifié (`TOTALS_MISMATCH`). Le formulaire de création l'appelle à chaque saisie
- **`serialize()` + `validateXsd()` + `validateSchematron()`** — `GET /invoices/:id/conformance?profile=…` : le XML CII de la facture passé au XSD officiel du profil (en process) et à son Schematron (serveur Saxon, optionnel)
- **Les cinq profils** — MINIMUM, BASIC WL, BASIC, EN 16931, EXTENDED : la page détail régénère le PDF et relance le contrôle de conformité pour le profil choisi (`?profile=` sur `pdf` et `conformance`)
- Un catalogue produits (CRUD) pour pré-remplir les lignes de facture, histoire d'avoir un scénario de démo qui ressemble à un vrai usage plutôt qu'un formulaire vide à chaque fois

L'API expose ces ressources en style HATEOAS léger (chaque réponse porte ses `_links` : self, pdf, validation, conformance, collection…) plutôt que des routes à deviner.

Détail : [`docs/demo-walkthrough.md`](docs/demo-walkthrough.md) pour un scénario pas-à-pas (créer → générer le PDF → le ré-uploader → valider).

## Stack

- **API** : NestJS 11, TypeORM + Postgres, Swagger (`/api/docs`)
- **Front** : React + Vite (`front/`), consomme l'API via son proxy dev, suit les hyperliens renvoyés plutôt que des routes codées en dur
- **Lib testée** : [`factur-x-ts`](https://www.npmjs.com/package/factur-x-ts) (générateur/parseur Factur-X)
- **Rendu visuel** : template [Typst](https://typst.app) (`src/facturx/templates/invoice.typ`) compilé en PDF/A-3b via `@myriaddreamin/typst-ts-node-compiler`, passé à `generate()` en `visualPdf` — sans ça, factur-x-ts produit une page A4 blanche qui ne sert que de support au XML

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

## Schematron (optionnel)

Le contrôle XSD tourne sans rien installer (`xmllint-wasm`). Le Schematron compile en XSLT 2.0, que Node n'exécute pas : il passe par le serveur Saxon fourni avec `factur-x-ts`.

```bash
# depuis le repo factur-x-ts
docker compose -f docker/compose.yml build
docker run -d --rm --name facturx-saxon -p 5055:5000 -e JAVA_OPTS=-Xmx1g factur-x-ts-saxon
```

puis dans `.env` :

```bash
FACTURX_SAXON_URL=http://localhost:5055/transform
FACTURX_SAXON_CODEDB_DIR=file:///opt/facturx
```

Port 5055 plutôt que 5000 : sur macOS, 5000 est pris par AirPlay, qui répond 403. `FACTURX_SAXON_CODEDB_DIR` pointe l'XSLT vers les listes de codes embarquées dans l'image ; sans elle, il les télécharge depuis GitHub à chaque contrôle. Sans `FACTURX_SAXON_URL`, le Schematron est signalé « non lancé » ; un serveur injoignable est signalé « indisponible », jamais comme un succès.

## Hors scope

- Authentification (dépendances passport présentes mais aucun guard branché)
- Front production-ready (c'est un outil de démo, pas une UI de facturation complète)

## Tests

```bash
pnpm run test        # unitaires
pnpm run test:e2e     # e2e (nécessite une DB Postgres accessible)
pnpm run lint
```
