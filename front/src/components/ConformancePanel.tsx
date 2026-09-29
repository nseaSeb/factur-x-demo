import { useState } from 'react';
import { api, ApiError, withProfile } from '../api/client';
import type { ConformanceResult, FacturXProfile } from '../api/types';

// Official rule sets, run by factur-x-ts on the CII XML of this invoice:
// the profile's XSD (in-process) and its Schematron (on a Saxon server).
export default function ConformancePanel({
  href,
  profile,
}: {
  href: string;
  profile: FacturXProfile;
}) {
  const [result, setResult] = useState<ConformanceResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      setResult(await api.get<ConformanceResult>(withProfile(href, profile)));
    } catch (err) {
      setError(err instanceof ApiError ? `Erreur ${err.status}: ${JSON.stringify(err.body)}` : 'Erreur réseau');
    } finally {
      setRunning(false);
    }
  }

  const stale = result && result.profile !== profile;

  return (
    <div className="card">
      <div className="card-header">
        <h3>Conformité officielle — {profile}</h3>
        <button className="btn" onClick={run} disabled={running}>
          {running ? 'Contrôle…' : 'Contrôler XSD + Schematron'}
        </button>
      </div>
      {error && <p className="error-box">{error}</p>}
      {stale && <p className="hint">Résultat pour {result.profile} — relancer pour {profile}.</p>}
      {result && (
        <>
          <div className={result.xsd.valid ? 'ok-box' : 'error-box'}>
            <strong>XSD</strong> —{' '}
            {result.xsd.valid ? 'conforme au schéma du profil.' : `${result.xsd.errors.length} erreur(s)`}
            {!result.xsd.valid && (
              <ul>
                {result.xsd.errors.map((e, i) => (
                  <li key={i}>
                    {e.line !== undefined && <code>ligne {e.line}</code>} {e.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {result.schematron.status === 'checked' ? (
            <div className={result.schematron.valid ? 'ok-box' : 'error-box'}>
              <strong>Schematron</strong> —{' '}
              {result.schematron.valid
                ? 'aucune règle métier enfreinte'
                : `${result.schematron.errors.length} règle(s) enfreinte(s)`}
              {result.schematron.warnings.length > 0 &&
                `, ${result.schematron.warnings.length} avertissement(s)`}
              {[...result.schematron.errors, ...result.schematron.warnings].length > 0 && (
                <ul>
                  {result.schematron.errors.map((v, i) => (
                    <li key={`e${i}`}>{v.message}</li>
                  ))}
                  {result.schematron.warnings.map((v, i) => (
                    <li key={`w${i}`} className="hint">
                      {v.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="hint">
              Schematron {result.schematron.status === 'skipped' ? 'non lancé' : 'indisponible'} :{' '}
              {result.schematron.reason}
            </p>
          )}
        </>
      )}
    </div>
  );
}
