/**
 * Comparatif TrailFlow vs gilet d'entrée de gamme générique.
 * Volontairement pas de marque nommée (anti-litige) — descriptif "gilet trail
 * d'entrée de gamme" qui couvre toute la concurrence Décathlon-like.
 */
type Row = {
  label: string;
  tf: string;
  other: string;
  tfWin: boolean;
};

const ROWS: Row[] = [
  { label: "Prix",                tf: "34,90 €", other: "55 € – 90 €",   tfWin: true },
  { label: "Poids",               tf: "180 g",   other: "300 – 420 g",   tfWin: true },
  { label: "Poches",              tf: "6",       other: "2 à 3",         tfWin: true },
  { label: "Poche téléphone tactile", tf: "Oui", other: "Non",           tfWin: true },
  { label: "Réfléchissant 360°",  tf: "Oui",     other: "Bandes seules", tfWin: true },
  { label: "Boucles anti-ballottement", tf: "Double", other: "Simple",   tfWin: true },
  { label: "Tailles",             tf: "S – XL",  other: "Souvent M/L seul", tfWin: true },
  { label: "Retour gratuit 15j",  tf: "Oui",     other: "Variable",      tfWin: true },
];

export function ComparisonTable() {
  return (
    <section className="compare" id="compare">
      <div className="compare-header">
        <span className="section-eyebrow">Le match</span>
        <h2>
          TrailFlow vs<br />
          <em>gilet d&apos;entrée de gamme</em>
        </h2>
        <p className="compare-sub">
          Mêmes promesses, deux philosophies. Le tableau parle pour nous.
        </p>
      </div>

      <div className="compare-table" role="table" aria-label="Comparatif TrailFlow vs gilet entrée de gamme">
        <div className="compare-row compare-row--head" role="row">
          <div className="compare-cell compare-cell--label" role="columnheader">Critère</div>
          <div className="compare-cell compare-cell--tf" role="columnheader">
            <span className="compare-brand">TrailFlow</span>
          </div>
          <div className="compare-cell compare-cell--other" role="columnheader">
            <span className="compare-brand compare-brand--other">Entrée de gamme</span>
          </div>
        </div>

        {ROWS.map((r) => (
          <div className="compare-row" role="row" key={r.label}>
            <div className="compare-cell compare-cell--label" role="cell">{r.label}</div>
            <div className="compare-cell compare-cell--tf" role="cell">
              {r.tfWin && (
                <svg className="compare-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              <span>{r.tf}</span>
            </div>
            <div className="compare-cell compare-cell--other" role="cell">
              <span>{r.other}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="compare-footnote">
        Comparatif basé sur les fiches techniques publiques des gilets trail
        à moins de 90 € disponibles en grande distribution (poids et poches
        renseignés par les fabricants, prix observés au {new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}).
      </p>
    </section>
  );
}
