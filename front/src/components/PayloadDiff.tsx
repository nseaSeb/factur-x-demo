import type { FacturXInvoicePayload } from '../api/types';

type Flat = Map<string, string>;

// Flattens a payload into dotted paths (seller.address.city, lines[0].vatRate)
// so two invoices can be compared leaf by leaf, whatever optional blocks the
// lib added or dropped.
function flatten(value: unknown, path: string, out: Flat): Flat {
  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, `${path}[${i}]`, out));
  } else if (value !== null && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, path ? `${path}.${key}` : key, out);
    }
  } else if (value !== undefined) {
    out.set(path, String(value));
  }
  return out;
}

// Numbers can come back as "20" vs "20.00" after an XML round-trip; that's
// formatting, not data loss.
function sameValue(a: string, b: string): boolean {
  if (a === b) return true;
  const na = Number(a);
  const nb = Number(b);
  return a !== '' && b !== '' && !Number.isNaN(na) && !Number.isNaN(nb) && na === nb;
}

interface Row {
  path: string;
  before?: string;
  after?: string;
}

export default function PayloadDiff({
  before,
  after,
}: {
  before: FacturXInvoicePayload;
  after: FacturXInvoicePayload;
}) {
  const a = flatten(before, '', new Map());
  const b = flatten(after, '', new Map());
  const paths = [...new Set([...a.keys(), ...b.keys()])].sort();
  const diffs: Row[] = paths
    .map((path) => ({ path, before: a.get(path), after: b.get(path) }))
    .filter((row) => !(row.before !== undefined && row.after !== undefined && sameValue(row.before, row.after)));

  if (diffs.length === 0) {
    return (
      <div className="ok-box">
        Round-trip sans perte : les {paths.length} champs relus du PDF sont identiques à la facture
        d'origine.
      </div>
    );
  }

  return (
    <div className="card">
      <h3>
        Round-trip : {diffs.length} écart{diffs.length > 1 ? 's' : ''} sur {paths.length} champs
      </h3>
      <table>
        <thead>
          <tr>
            <th>Champ</th>
            <th>Facture d'origine</th>
            <th>Relu depuis le PDF</th>
          </tr>
        </thead>
        <tbody>
          {diffs.map((row) => (
            <tr
              key={row.path}
              className={row.before === undefined || row.after === undefined ? 'diff-added' : 'diff-changed'}
            >
              <td>
                <code>{row.path}</code>
              </td>
              <td>{row.before ?? <span className="hint">absent</span>}</td>
              <td>{row.after ?? <span className="hint">absent</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
