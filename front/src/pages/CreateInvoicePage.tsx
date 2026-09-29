import { useEffect, useState } from 'react';
import TotalsPanel from '../components/TotalsPanel';
import { useNavigate } from 'react-router-dom';
import { api, ApiError, toPath } from '../api/client';
import {
  FACTURX_PROFILES,
  VAT_CATEGORY_CODES,
  type CreateInvoiceInput,
  type CurrencyCode,
  type DocumentTypeCode,
  type FacturXProfile,
  type InvoiceResource,
  type Product,
  type ProductCollectionResource,
  type TotalsResult,
  type VatCategoryCode,
} from '../api/types';

interface FormState {
  number: string;
  issueDate: string;
  paymentDueDate: string;
  paymentTerms: string;
  currency: CurrencyCode;
  typeCode: DocumentTypeCode;
  profile: FacturXProfile;
  sellerName: string;
  sellerVatId: string;
  sellerLineOne: string;
  sellerPostcode: string;
  sellerCity: string;
  sellerCountry: string;
  buyerName: string;
  buyerLineOne: string;
  buyerPostcode: string;
  buyerCity: string;
  buyerCountry: string;
}

interface LineDraft {
  name: string;
  quantity: string;
  unit: string;
  netPrice: string;
  vatCategory: VatCategoryCode;
  vatRate: string;
}

const emptyLine: LineDraft = {
  name: '',
  quantity: '1',
  unit: 'C62',
  netPrice: '',
  vatCategory: 'S',
  vatRate: '20',
};

const initialLines: LineDraft[] = [
  { name: 'Prestation de conseil', quantity: '2', unit: 'HUR', netPrice: '100', vatCategory: 'S', vatRate: '20' },
  { name: 'Ouvrage technique', quantity: '3', unit: 'C62', netPrice: '12.35', vatCategory: 'S', vatRate: '5.5' },
];

// French keyboards type "12,5"; the API wants a decimal string.
const decimal = (value: string) => value.trim().replace(',', '.');

const initialState: FormState = {
  number: `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`,
  issueDate: new Date().toISOString().slice(0, 10),
  paymentDueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().slice(0, 10),
  paymentTerms: 'Paiement à 30 jours, par virement',
  currency: 'EUR',
  typeCode: '380',
  profile: 'EN 16931',
  sellerName: 'Ma Société SARL',
  sellerVatId: 'FR12345678901',
  sellerLineOne: '1 rue de la Paix',
  sellerPostcode: '75001',
  sellerCity: 'Paris',
  sellerCountry: 'FR',
  buyerName: 'Client & Co',
  buyerLineOne: '2 avenue des Champs',
  buyerPostcode: '69000',
  buyerCity: 'Lyon',
  buyerCountry: 'FR',
};

export default function CreateInvoicePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [lines, setLines] = useState<LineDraft[]>(initialLines);
  const [totals, setTotals] = useState<TotalsResult | null>(null);
  const [totalsPending, setTotalsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get<ProductCollectionResource>('/products?page=1&limit=100')
      .then((resource) => setProducts(resource.data))
      .catch(() => setProducts([]));
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setLine<K extends keyof LineDraft>(index: number, key: K, value: LineDraft[K]) {
    setLines((ls) => ls.map((l, i) => (i === index ? { ...l, [key]: value } : l)));
  }

  function applyProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setLines((ls) =>
      ls.map((l, i) =>
        i === index
          ? {
              ...l,
              name: product.name,
              unit: product.unit,
              netPrice: String(product.netPrice),
              vatCategory: product.vatCategory,
              vatRate: String(product.vatRate),
            }
          : l,
      ),
    );
  }

  // The invoice minus its arithmetic: no line totals, no VAT breakdown, no
  // document totals. factur-x-ts's computeTotals derives all of them.
  function buildDraft() {
    return {
      number: form.number,
      issueDate: new Date(form.issueDate).toISOString(),
      paymentDueDate: form.paymentDueDate ? new Date(form.paymentDueDate).toISOString() : undefined,
      paymentTerms: form.paymentTerms || undefined,
      currency: form.currency,
      typeCode: form.typeCode,
      seller: {
        name: form.sellerName,
        vatId: form.sellerVatId || undefined,
        address: {
          lineOne: form.sellerLineOne,
          postcode: form.sellerPostcode,
          city: form.sellerCity,
          country: form.sellerCountry,
        },
      },
      buyer: {
        name: form.buyerName,
        address: {
          lineOne: form.buyerLineOne,
          postcode: form.buyerPostcode,
          city: form.buyerCity,
          country: form.buyerCountry,
        },
      },
      lines: lines.map((l, i) => ({
        id: String(i + 1),
        name: l.name,
        quantity: decimal(l.quantity),
        unit: l.unit,
        netPrice: decimal(l.netPrice),
        vatCategory: l.vatCategory,
        vatRate: decimal(l.vatRate),
      })),
    };
  }

  // Recompute on every edit, debounced so typing doesn't flood the API.
  useEffect(() => {
    setTotalsPending(true);
    const timer = setTimeout(() => {
      api
        .post<TotalsResult>('/invoices/totals', buildDraft())
        .then(setTotals)
        .catch((err: unknown) =>
          setTotals({
            ok: false,
            errors: [
              {
                code: err instanceof ApiError ? `HTTP ${err.status}` : 'NETWORK',
                field: '',
                message: 'Saisie incomplète ou invalide',
              },
            ],
          }),
        )
        .finally(() => setTotalsPending(false));
    }, 300);
    return () => clearTimeout(timer);
    // buildDraft reads form and lines, which are the real dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, lines]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!totals?.ok) return;
    setSubmitting(true);
    setError(null);

    const payload: CreateInvoiceInput = { ...totals.invoice, profile: form.profile };

    try {
      const resource = await api.post<InvoiceResource>('/invoices', payload);
      navigate(toPath(resource._links.self.href));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `Erreur ${err.status}: ${JSON.stringify(err.body)}`
          : 'Erreur réseau',
      );
      setSubmitting(false);
    }
  }

  return (
    <section>
      <h2>Nouvelle facture</h2>
      {error && <p className="error-box">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <div className="field">
            <label>Numéro</label>
            <input value={form.number} onChange={(e) => set('number', e.target.value)} required />
          </div>
          <div className="field">
            <label>Date d'émission</label>
            <input
              type="date"
              value={form.issueDate}
              onChange={(e) => set('issueDate', e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label>Échéance (BT-9)</label>
            <input
              type="date"
              value={form.paymentDueDate}
              onChange={(e) => set('paymentDueDate', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Conditions de paiement (BT-20)</label>
            <input value={form.paymentTerms} onChange={(e) => set('paymentTerms', e.target.value)} />
          </div>
          <div className="field">
            <label>Devise</label>
            <select value={form.currency} onChange={(e) => set('currency', e.target.value as CurrencyCode)}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="GBP">GBP</option>
              <option value="CHF">CHF</option>
            </select>
          </div>
          <div className="field">
            <label>Profil Factur-X</label>
            <select value={form.profile} onChange={(e) => set('profile', e.target.value as FacturXProfile)}>
              {FACTURX_PROFILES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Vendeur</h3>
            <div className="field">
              <label>Nom</label>
              <input value={form.sellerName} onChange={(e) => set('sellerName', e.target.value)} required />
            </div>
            <div className="field">
              <label>TVA intracommunautaire</label>
              <input value={form.sellerVatId} onChange={(e) => set('sellerVatId', e.target.value)} />
            </div>
            <div className="field">
              <label>Adresse</label>
              <input
                value={form.sellerLineOne}
                onChange={(e) => set('sellerLineOne', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Code postal / Ville / Pays</label>
              <input
                value={form.sellerPostcode}
                onChange={(e) => set('sellerPostcode', e.target.value)}
                required
              />
              <input value={form.sellerCity} onChange={(e) => set('sellerCity', e.target.value)} required />
              <input
                value={form.sellerCountry}
                onChange={(e) => set('sellerCountry', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="card">
            <h3>Acheteur</h3>
            <div className="field">
              <label>Nom</label>
              <input value={form.buyerName} onChange={(e) => set('buyerName', e.target.value)} required />
            </div>
            <div className="field">
              <label>Adresse</label>
              <input
                value={form.buyerLineOne}
                onChange={(e) => set('buyerLineOne', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Code postal / Ville / Pays</label>
              <input
                value={form.buyerPostcode}
                onChange={(e) => set('buyerPostcode', e.target.value)}
                required
              />
              <input value={form.buyerCity} onChange={(e) => set('buyerCity', e.target.value)} required />
              <input
                value={form.buyerCountry}
                onChange={(e) => set('buyerCountry', e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Lignes</h3>
            <button type="button" className="btn" onClick={() => setLines((ls) => [...ls, emptyLine])}>
              + Ajouter une ligne
            </button>
          </div>
          <table className="lines-table">
            <thead>
              <tr>
                <th>Désignation</th>
                <th>Qté</th>
                <th>Unité</th>
                <th>PU HT</th>
                <th>Cat.</th>
                <th>TVA %</th>
                <th>Total HT</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td>
                    <input value={line.name} onChange={(e) => setLine(i, 'name', e.target.value)} required />
                    {products.length > 0 && (
                      <select value="" onChange={(e) => applyProduct(i, e.target.value)}>
                        <option value="" disabled>
                          Depuis le catalogue…
                        </option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.sku} — {p.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <input
                      inputMode="decimal"
                      value={line.quantity}
                      onChange={(e) => setLine(i, 'quantity', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input value={line.unit} onChange={(e) => setLine(i, 'unit', e.target.value)} required />
                  </td>
                  <td>
                    <input
                      inputMode="decimal"
                      value={line.netPrice}
                      onChange={(e) => setLine(i, 'netPrice', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <select
                      value={line.vatCategory}
                      onChange={(e) => setLine(i, 'vatCategory', e.target.value as VatCategoryCode)}
                    >
                      {VAT_CATEGORY_CODES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      inputMode="decimal"
                      value={line.vatRate}
                      onChange={(e) => setLine(i, 'vatRate', e.target.value)}
                      required
                    />
                  </td>
                  <td className="num">{totals?.ok ? totals.invoice.lines[i]?.lineTotal : '—'}</td>
                  <td>
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))}
                      disabled={lines.length === 1}
                      aria-label="Supprimer la ligne"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <TotalsPanel result={totals} pending={totalsPending} currency={form.currency} />

        <button className="btn primary" type="submit" disabled={submitting || !totals?.ok || totalsPending}>
          {submitting ? 'Création…' : 'Créer la facture'}
        </button>
      </form>
    </section>
  );
}
