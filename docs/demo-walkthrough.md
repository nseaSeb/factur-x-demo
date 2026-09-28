# Démo — factur-x-ts via l'API

Scénario complet démontrant les trois capacités de la lib (`generate`, `parse`, `validateEn16931`)
à travers l'API HATEOAS. Port par défaut : `3200`. Swagger : `http://localhost:3200/api/docs`.

## 1. Créer une facture

```bash
curl -s -X POST http://localhost:3200/invoices \
  -H 'Content-Type: application/json' \
  --data @docs/sample-invoice.json
```

Le payload doit porter `paymentDueDate` (BT-9) ou `paymentTerms` (BT-20) dès que le net à payer est
positif (BR-CO-25) — sans l'un des deux, la génération du PDF est refusée à l'étape 2.

Réponse : `Resource<Invoice>` avec `_links.self`, `_links.pdf`, `_links.validation`, `_links.collection`.
Noter l'`id` retourné.

## 2. Générer le PDF Factur-X

```bash
curl -s http://localhost:3200/invoices/<id>/pdf -o invoice.pdf
```

`GET .../pdf` accepte `?profile=` pour surcharger le profil stocké (`EN 16931` par défaut — le seul
profil avec validation complète implémentée dans la lib).

## 3. Ré-uploader le PDF pour tester le parsing (boucle round-trip)

```bash
curl -s -X POST http://localhost:3200/invoices/parse -F "file=@invoice.pdf;type=application/pdf"
```

La nouvelle ligne apparaît avec `source: "parsed"` dans `GET /invoices`, à côté de l'originale
(`source: "created"`) — même `number`/`totals`, preuve que le round-trip generate→parse préserve les données.

## 4. Valider une facture (business rules EN 16931)

Un payload structurellement valide mais avec un total incohérent :

```bash
curl -s -X POST http://localhost:3200/invoices/validate \
  -H 'Content-Type: application/json' \
  --data @invalid-invoice.json
```

```json
{
  "valid": false,
  "errors": [
    { "field": "totals.grandTotal", "code": "AMOUNT_MISMATCH", "message": "grandTotal must equal taxBasisTotal + taxTotal (BR-CO-15)" }
  ]
}
```

Le même payload envoyé à `POST /invoices` puis `GET .../pdf` renvoie un `400` avec le même
`validationErrors` structuré (mapping `FacturXGenerateError` → `BadRequestException`).

Note : un payload structurellement incomplet (champ requis manquant) est rejeté plus tôt, au niveau
DTO (`class-validator`), avant même d'atteindre `validateEn16931`.

## Hors scope de cette démo

- Frontend React (phase ultérieure).
- Authentification (`.addBearerAuth()` documenté dans Swagger mais non appliqué — dépendances passport
  déjà présentes, guard à construire plus tard).
- Validation XSD/Schematron officielle — disponible dans `factur-x-ts` depuis la 0.2, pas encore
  exposée par l'API.
