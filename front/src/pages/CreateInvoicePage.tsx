import { useEffect, useState } from 'react';
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
  lineName: string;
  quantity: string;
  unit: string;
  netPrice: string;
  vatCategory: VatCategoryCode;
  vatRate: string;
}

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
  lineName: 'Prestation de conseil',
  quantity: '2',
  unit: 'C62',
  netPrice: '100',
  vatCategory: 'S',
  vatRate: '20',
};

export default function CreateInvoicePage() {
  const [form, setForm] = useState<FormState>(initialState);
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

  function applyProduct(productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setForm((f) => ({
      ...f,
      lineName: product.name,
      unit: product.unit,
      netPrice: String(product.netPrice),
      vatCategory: product.vatCategory,
      vatRate: String(product.vatRate),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const quantity = Number(form.quantity);
    const netPrice = Number(form.netPrice);
    const vatRate = Number(form.vatRate);
    const lineTotal = Math.round(quantity * netPrice * 100) / 100;
    const calculatedAmount = Math.round(((lineTotal * vatRate) / 100) * 100) / 100;
    const grandTotal = Math.round((lineTotal + calculatedAmount) * 100) / 100;

    const payload: CreateInvoiceInput = {
      number: form.number,
      issueDate: new Date(form.issueDate).toISOString(),
      paymentDueDate: form.paymentDueDate ? new Date(form.paymentDueDate).toISOString() : undefined,
      paymentTerms: form.paymentTerms || undefined,
      currency: form.currency,
      typeCode: form.typeCode,
      profile: form.profile,
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
      lines: [
        {
          id: '1',
          name: form.lineName,
          quantity,
          unit: form.unit,
          netPrice,
          lineTotal,
          vatCategory: form.vatCategory,
          vatRate,
        },
      ],
      taxBreakdown: [
        {
          type: 'VAT',
          category: form.vatCategory,
          rate: vatRate,
          basisAmount: lineTotal,
          calculatedAmount,
        },
      ],
      totals: {
        lineTotal,
        taxBasisTotal: lineTotal,
        taxTotal: calculatedAmount,
        grandTotal,
        duePayable: grandTotal,
      },
    };

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
          <h3>Ligne (facture à une ligne pour cette démo)</h3>
          {products.length > 0 && (
            <div className="field">
              <label>Depuis le catalogue (facultatif)</label>
              <select defaultValue="" onChange={(e) => applyProduct(e.target.value)}>
                <option value="" disabled>
                  Choisir un produit…
                </option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.sku} — {p.name} ({p.netPrice} €)
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="field">
            <label>Désignation</label>
            <input value={form.lineName} onChange={(e) => set('lineName', e.target.value)} required />
          </div>
          <div className="grid">
            <div className="field">
              <label>Quantité</label>
              <input
                type="number"
                step="any"
                value={form.quantity}
                onChange={(e) => set('quantity', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Unité (UN/ECE Rec 20)</label>
              <input value={form.unit} onChange={(e) => set('unit', e.target.value)} required />
            </div>
            <div className="field">
              <label>Prix unitaire HT</label>
              <input
                type="number"
                step="any"
                value={form.netPrice}
                onChange={(e) => set('netPrice', e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>Catégorie TVA</label>
              <select
                value={form.vatCategory}
                onChange={(e) => set('vatCategory', e.target.value as VatCategoryCode)}
              >
                {VAT_CATEGORY_CODES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Taux TVA (%)</label>
              <input
                type="number"
                step="any"
                value={form.vatRate}
                onChange={(e) => set('vatRate', e.target.value)}
                required
              />
            </div>
          </div>
          <p className="hint">Total HT, TVA et total TTC sont calculés automatiquement à l'envoi.</p>
        </div>

        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Création…' : 'Créer la facture'}
        </button>
      </form>
    </section>
  );
}
