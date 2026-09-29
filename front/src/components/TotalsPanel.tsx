import type { TotalsResult } from '../api/types';

// Shows what factur-x-ts's computeTotals derived from the lines: the VAT
// breakdown (one entry per category and rate) and the document totals.
export default function TotalsPanel({
  result,
  pending,
  currency,
}: {
  result: TotalsResult | null;
  pending: boolean;
  currency: string;
}) {
  if (!result) return <p className="hint">Calcul des totaux…</p>;

  if (!result.ok) {
    return (
      <div className="error-box">
        <strong>computeTotals</strong> — calcul impossible
        <ul>
          {result.errors.map((e, i) => (
            <li key={i}>
              {e.field && <code>{e.field}</code>} {e.message}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const { taxBreakdown, totals } = result.invoice;
  return (
    <div className={`card${pending ? ' stale' : ''}`}>
      <div className="card-header">
        <h3>Totaux</h3>
        <span className="hint">calculés par factur-x-ts (computeTotals, arithmétique décimale exacte)</span>
      </div>
      <div className="grid">
        <table>
          <thead>
            <tr>
              <th>TVA</th>
              <th className="num">Base HT</th>
              <th className="num">Montant</th>
            </tr>
          </thead>
          <tbody>
            {taxBreakdown.map((t) => (
              <tr key={`${t.category}-${t.rate}`}>
                <td>
                  {t.rate} % ({t.category})
                </td>
                <td className="num">{t.basisAmount}</td>
                <td className="num">{t.calculatedAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table>
          <tbody>
            <tr>
              <td>Total HT</td>
              <td className="num">{totals.taxBasisTotal}</td>
            </tr>
            <tr>
              <td>TVA</td>
              <td className="num">{totals.taxTotal}</td>
            </tr>
            <tr>
              <td>
                <strong>Total TTC</strong>
              </td>
              <td className="num">
                <strong>
                  {totals.grandTotal} {currency}
                </strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
