import { useEffect, useState } from 'react';
import { api, ApiError } from '../api/client';
import type { ValidationError } from '../api/types';
import ValidationReport from './ValidationReport';

type PreviewState =
  | { status: 'loading' }
  | { status: 'ready'; url: string }
  | { status: 'invalid'; errors: ValidationError[] }
  | { status: 'error'; message: string };

function isValidationBody(body: unknown): body is { validationErrors: ValidationError[] } {
  return (
    typeof body === 'object' &&
    body !== null &&
    Array.isArray((body as { validationErrors?: unknown }).validationErrors)
  );
}

// The API serves the PDF with `Content-Disposition: attachment`, which an
// <iframe src> would turn into a download. Fetching it as a blob and pointing
// the iframe at an object URL renders it inline without touching the API.
export default function PdfPreview({ href, fileName }: { href: string; fileName: string }) {
  const [state, setState] = useState<PreviewState>({ status: 'loading' });

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setState({ status: 'loading' });
    api
      .getBlob(href)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setState({ status: 'ready', url });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && isValidationBody(err.body)) {
          setState({ status: 'invalid', errors: err.body.validationErrors });
        } else {
          setState({
            status: 'error',
            message: err instanceof ApiError ? `Erreur ${err.status}` : 'Erreur réseau',
          });
        }
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [href]);

  if (state.status === 'loading') return <p className="hint">Génération du PDF…</p>;
  if (state.status === 'error') return <p className="error-box">{state.message}</p>;
  if (state.status === 'invalid') {
    return <ValidationReport title="Génération refusée par factur-x-ts" errors={state.errors} />;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Aperçu Factur-X (PDF/A-3)</h3>
        <a className="btn" href={state.url} download={fileName}>
          Télécharger
        </a>
      </div>
      <iframe className="pdf-frame" src={state.url} title="Aperçu PDF Factur-X" />
    </div>
  );
}
