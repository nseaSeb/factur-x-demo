import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { InvoiceCollectionResource } from '../api/types';

export default function InvoiceListPage() {
  const [href, setHref] = useState('/invoices?page=1&limit=20');
  const [resource, setResource] = useState<InvoiceCollectionResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<InvoiceCollectionResource>(href)
      .then(setResource)
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? `Erreur ${err.status}` : 'Erreur réseau'),
      )
      .finally(() => setLoading(false));
  }, [href]);

  return (
    <section>
      <div className="actions">
        <Link className="btn primary" to="/invoices/new">
          + Nouvelle facture
        </Link>
        <Link className="btn" to="/invoices/parse">
          Importer un PDF
        </Link>
      </div>

      {loading && <p className="hint">Chargement…</p>}
      {error && <p className="error-box">{error}</p>}

      {resource && (
        <>
          <table>
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Profil</th>
                <th>Origine</th>
                <th>Créée le</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {resource.data.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{invoice.profile}</td>
                  <td>
                    <span className={`pill ${invoice.source === 'parsed' ? 'parsed' : ''}`}>
                      {invoice.source === 'parsed' ? 'importée' : 'créée'}
                    </span>
                  </td>
                  <td>{new Date(invoice.createdAt).toLocaleString('fr-FR')}</td>
                  <td>
                    <Link to={`/invoices/${invoice.id}`}>Voir →</Link>
                  </td>
                </tr>
              ))}
              {resource.data.length === 0 && (
                <tr>
                  <td colSpan={5} className="hint">
                    Aucune facture pour l'instant.
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
