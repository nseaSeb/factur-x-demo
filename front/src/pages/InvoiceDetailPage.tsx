import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError, toPath } from '../api/client';
import type { InvoiceResource, ValidationResult } from '../api/types';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<InvoiceResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get<InvoiceResource>(`/invoices/${id}`)
      .then(setResource)
      .catch((err: unknown) =>
        setError(err instanceof ApiError ? `Erreur ${err.status}` : 'Erreur réseau'),
      );
  }, [id]);

  if (error) return <p className="error-box">{error}</p>;
  if (!resource) return <p className="hint">Chargement…</p>;

  const { data, _links } = resource;
  const { payload } = data;

  async function runValidation() {
    setValidating(true);
    setValidation(null);
    try {
      const result = await api.post<ValidationResult>(_links.validation.href, {
        ...payload,
        profile: data.profile,
      });
      setValidation(result);
    } catch (err) {
      setValidation(
        err instanceof ApiError
          ? { valid: false, errors: [{ code: 'ERROR', field: '', message: `Erreur ${err.status}` }] }
          : { valid: false, errors: [{ code: 'ERROR', field: '', message: 'Erreur réseau' }] },
      );
    } finally {
      setValidating(false);
    }
  }

  return (
    <section>
      <Link to="/" className="hint">
        ← Toutes les factures
      </Link>
      <h2>{data.number}</h2>
      <p className="hint">
        Profil {data.profile} · {data.source === 'parsed' ? 'importée depuis un PDF' : 'créée'} le{' '}
        {new Date(data.createdAt).toLocaleString('fr-FR')}
      </p>

      <div className="actions">
        <a className="btn primary" href={toPath(_links.pdf.href)} target="_blank" rel="noreferrer">
          Télécharger le PDF
        </a>
        <button className="btn" onClick={runValidation} disabled={validating}>
          {validating ? 'Validation…' : 'Valider (EN 16931)'}
        </button>
      </div>

      {validation && (
        <div className={validation.valid ? 'ok-box' : 'error-box'}>
          {validation.valid ? (
            'Facture valide EN 16931.'
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {validation.errors.map((e, i) => (
                <li key={i}>
                  <strong>{e.field || e.code}</strong> — {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h3>Vendeur</h3>
          <p>{payload.seller.name}</p>
          <p className="hint">{payload.seller.vatId}</p>
          <p className="hint">
            {payload.seller.address.lineOne}, {payload.seller.address.postcode}{' '}
            {payload.seller.address.city} ({payload.seller.address.country})
          </p>
        </div>
        <div className="card">
          <h3>Acheteur</h3>
          <p>{payload.buyer.name}</p>
          <p className="hint">
            {payload.buyer.address.lineOne}, {payload.buyer.address.postcode}{' '}
            {payload.buyer.address.city} ({payload.buyer.address.country})
          </p>
        </div>
      </div>

      <div className="card">
        <h3>Lignes</h3>
        <table>
          <thead>
            <tr>
              <th>Désignation</th>
              <th>Qté</th>
              <th>PU HT</th>
              <th>Total HT</th>
              <th>TVA</th>
            </tr>
          </thead>
          <tbody>
            {payload.lines.map((line) => (
              <tr key={line.id}>
                <td>{line.name}</td>
                <td>
                  {line.quantity} {line.unit}
                </td>
                <td>{line.netPrice} €</td>
                <td>{line.lineTotal} €</td>
                <td>
                  {line.vatCategory} {line.vatRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Totaux</h3>
        <p>Total HT : {payload.totals.taxBasisTotal} €</p>
        <p>TVA : {payload.totals.taxTotal} €</p>
        <p>
          <strong>Total TTC : {payload.totals.grandTotal} €</strong>
        </p>
        <p>À payer : {payload.totals.duePayable} €</p>
      </div>
    </section>
  );
}
