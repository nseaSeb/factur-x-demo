import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { ProductCollectionResource } from '../api/types';

export default function ProductListPage() {
  const [href, setHref] = useState('/products?page=1&limit=20');
  const [resource, setResource] = useState<ProductCollectionResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    api
      .get<ProductCollectionResource>(href)
      .then(setResource)
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? `Erreur ${err.status}` : 'Erreur réseau'),
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [href]);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce produit du catalogue ?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur ${err.status}` : 'Erreur réseau');
    }
  }

  return (
    <section>
      <div className="actions">
        <Link className="btn primary" to="/products/new">
          + Nouveau produit
        </Link>
      </div>

      {loading && <p className="hint">Chargement…</p>}
      {error && <p className="error-box">{error}</p>}

      {resource && (
        <>
          <table>
            <thead>
              <tr>
                <th>Référence</th>
                <th>Désignation</th>
                <th>Unité</th>
                <th>Prix HT</th>
                <th>TVA</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {resource.data.map((product) => (
                <tr key={product.id}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.unit}</td>
                  <td>{product.netPrice} €</td>
                  <td>
                    {product.vatCategory} {product.vatRate}%
                  </td>
                  <td style={{ display: 'flex', gap: 10 }}>
                    <Link to={`/products/${product.id}/edit`}>Modifier</Link>
                    <button className="btn" onClick={() => handleDelete(product.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {resource.data.length === 0 && (
                <tr>
                  <td colSpan={6} className="hint">
                    Catalogue vide.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="actions">
            <button
              className="btn"
              disabled={!resource._links.prev}
              onClick={() => resource._links.prev && setHref(resource._links.prev.href)}
            >
              ← Précédent
            </button>
            <button
              className="btn"
              disabled={!resource._links.next}
              onClick={() => resource._links.next && setHref(resource._links.next.href)}
            >
              Suivant →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
