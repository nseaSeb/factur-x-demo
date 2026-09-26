import type { ValidationError } from '../api/types';

// Groups errors by the invoice field they point at, so a demo viewer sees
// "lines[0].vatRate: 2 problems" instead of a flat list of messages.
function groupByField(errors: ValidationError[]): [string, ValidationError[]][] {
  const groups = new Map<string, ValidationError[]>();
  for (const error of errors) {
    const key = error.field || '(document)';
    groups.set(key, [...(groups.get(key) ?? []), error]);
  }
  return [...groups.entries()];
}

export default function ValidationReport({
  title,
  errors,
}: {
  title: string;
  errors: ValidationError[];
}) {
  if (errors.length === 0) {
    return (
      <div className="ok-box">
        <strong>{title}</strong> — aucune erreur, facture conforme EN 16931.
      </div>
    );
  }

  const groups = groupByField(errors);
  return (
    <div className="error-box">
      <strong>{title}</strong> — {errors.length} erreur{errors.length > 1 ? 's' : ''} sur{' '}
      {groups.length} champ{groups.length > 1 ? 's' : ''}
      <table className="report-table">
        <thead>
          <tr>
            <th>Champ</th>
            <th>Règle</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {groups.flatMap(([field, fieldErrors]) =>
            fieldErrors.map((e, i) => (
              <tr key={`${field}-${i}`}>
                {i === 0 && (
                  <td rowSpan={fieldErrors.length}>
                    <code>{field}</code>
                  </td>
                )}
                <td>
                  <span className="pill">{e.code}</span>
                </td>
                <td>{e.message}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}
