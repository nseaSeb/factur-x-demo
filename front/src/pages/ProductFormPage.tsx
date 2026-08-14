import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import {
  VAT_CATEGORY_CODES,
  type CreateProductInput,
  type ProductResource,
  type VatCategoryCode,
} from '../api/types';

interface FormState {
  sku: string;
  name: string;
  description: string;
  unit: string;
  netPrice: string;
  vatCategory: VatCategoryCode;
  vatRate: string;
}

const emptyForm: FormState = {
  sku: '',
  name: '',
  description: '',
  unit: 'C62',
  netPrice: '',
  vatCategory: 'S',
  vatRate: '20',
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(editing);

  useEffect(() => {
    if (!id) return;
    api
      .get<ProductResource>(`/products/${id}`)
      .then((resource) => {
        const p = resource.data;
        setForm({
          sku: p.sku,
          name: p.name,
          description: p.description ?? '',
          unit: p.unit,
          netPrice: String(p.netPrice),
          vatCategory: p.vatCategory,
          vatRate: String(p.vatRate),
        });
      })
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? `Erreur ${err.status}` : 'Erreur réseau'),
      )
      .finally(() => setLoading(false));
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const payload: CreateProductInput = {
      sku: form.sku,
      name: form.name,
      description: form.description || undefined,
      unit: form.unit,
      netPrice: Number(form.netPrice),
      vatCategory: form.vatCategory,
      vatRate: Number(form.vatRate),
    };

    try {
      if (editing && id) {
        await api.patch<ProductResource>(`/products/${id}`, payload);
      } else {
        await api.post<ProductResource>('/products', payload);
      }
      navigate('/products');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `Erreur ${err.status}: ${JSON.stringify(err.body)}`
          : 'Erreur réseau',
      );
      setSubmitting(false);
    }
  }

  if (loading) return <p className="hint">Chargement…</p>;

  return (
    <section>
      <h2>{editing ? 'Modifier le produit' : 'Nouveau produit'}</h2>
      {error && <p className="error-box">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="grid">
          <div className="field">
            <label>Référence (SKU)</label>
            <input value={form.sku} onChange={(e) => set('sku', e.target.value)} required />
          </div>
          <div className="field">
            <label>Désignation</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </div>
        </div>
        <div className="field">
          <label>Description</label>
          <input value={form.description} onChange={(e) => set('description', e.target.value)} />
        </div>
        <div className="grid">
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

        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Enregistrement…' : editing ? 'Enregistrer' : 'Créer le produit'}
        </button>
      </form>
    </section>
  );
}
