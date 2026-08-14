import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api/client';
import type { ParseInvoiceResponse } from '../api/types';

export default function ParseUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ParseInvoiceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const resource = await api.postForm<ParseInvoiceResponse>('/invoices/parse', formData);
      setResult(resource);
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
    </section>
  );
}
