import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { Invoice, InvoiceCollectionResource, ParseInvoiceResponse } from '../api/types';
import PayloadDiff from '../components/PayloadDiff';

// The PDF carries no reference to the record it was generated from, so the
// original is looked up by invoice number among invoices created in the demo.
async function findOriginal(parsed: Invoice): Promise<Invoice | null> {
  const params = new URLSearchParams({ number: parsed.number, limit: '100' });
  const collection = await api.get<InvoiceCollectionResource>(`/invoices?${params.toString()}`);
  return collection.data.find((inv) => inv.source === 'created' && inv.id !== parsed.id) ?? null;
}

export default function ParseUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParseInvoiceResponse | null>(null);
  const [original, setOriginal] = useState<Invoice | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    setOriginal(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resource = await api.postForm<ParseInvoiceResponse>('/invoices/parse', formData);
      setResult(resource);
      // Comparison is a bonus: a failed lookup must not hide a successful parse.
      setOriginal(await findOriginal(resource.data).catch(() => null));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? `Erreur ${err.status}: ${JSON.stringify(err.body)}`
          : 'Erreur réseau',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <section>
      <h2>Importer une facture Factur-X</h2>
      <p className="hint">
        Uploader un PDF déjà généré (via cette démo ou ailleurs) pour extraire son XML embarqué et
        vérifier le round-trip génération → parsing.
      </p>

      <form onSubmit={handleSubmit} className="actions">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button className="btn primary" type="submit" disabled={!file || uploading}>
          {uploading ? 'Analyse…' : 'Importer'}
        </button>
      </form>

      {error && <p className="error-box">{error}</p>}

      {result && (
        <div className="ok-box">
          Facture <strong>{result.data.number}</strong> extraite avec succès (conformité{' '}
          {result.parsedMetadata.conformanceLevel}).{' '}
          <Link to={`/invoices/${result.data.id}`}>Voir la facture →</Link>
        </div>
      )}

      {result &&
        (original ? (
          <>
            <p className="hint">
              Comparaison avec la facture d'origine{' '}
              <Link to={`/invoices/${original.id}`}>{original.number}</Link> créée le{' '}
              {new Date(original.createdAt).toLocaleString('fr-FR')}.
            </p>
            <PayloadDiff before={original.payload} after={result.data.payload} />
          </>
        ) : (
          <p className="hint">
            Aucune facture créée dans la démo avec le numéro {result.data.number} : pas de
            comparaison possible (PDF venu d'ailleurs ?).
          </p>
        ))}
    </section>
  );
}
