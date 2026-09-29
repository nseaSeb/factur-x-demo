import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, ApiError, withProfile } from '../api/client';
import {
  FACTURX_PROFILES,
  type FacturXProfile,
  type InvoiceResource,
  type ValidationResult,
} from '../api/types';
import ConformancePanel from '../components/ConformancePanel';
import PdfPreview from '../components/PdfPreview';
import ValidationReport from '../components/ValidationReport';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [resource, setResource] = useState<InvoiceResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [profile, setProfile] = useState<FacturXProfile | null>(null);

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
  // Same invoice, any of the five profiles: the PDF and the conformance
  // check follow this selector, defaulting to the stored profile.
  const activeProfile = profile ?? data.profile;

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
        <label className="hint" htmlFor="profile">
          Profil
        </label>
        <select
          id="profile"
          value={activeProfile}
          onChange={(e) => setProfile(e.target.value as FacturXProfile)}
        >
          {FACTURX_PROFILES.map((p) => (
            <option key={p} value={p}>
              {p}
              {p === data.profile ? ' (enregistré)' : ''}
            </option>
          ))}
        </select>
        <button className="btn primary" onClick={runValidation} disabled={validating}>
          {validating ? 'Validation…' : 'Valider (EN 16931)'}
        </button>
      </div>

      {validation && (
        <ValidationReport title="Validation EN 16931" errors={validation.errors} />
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

      <ConformancePanel href={_links.conformance.href} profile={activeProfile} />

      <PdfPreview
        href={withProfile(_links.pdf.href, activeProfile)}
        fileName={`${data.number}-${activeProfile.replace(' ', '-')}.pdf`}
      />
    </section>
  );
}
