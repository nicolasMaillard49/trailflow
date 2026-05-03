import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Retours & remboursements — TrailFlow",
  description:
    "Politique de retours TrailFlow — 15 jours pour changer d'avis, retour gratuit, remboursement intégral.",
  alternates: { canonical: "/retours" },
};

export default function RetoursPage() {
  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <a href="/" className="legal-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour à l&apos;accueil
        </a>

        <h1 className="legal-h1">Retours &amp; remboursements</h1>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">01</span>15 jours pour changer d&apos;avis</h2>
          <p>
            Vous disposez d&apos;un délai de <strong>15 jours</strong> à compter
            de la réception de votre commande pour exercer votre droit de
            rétractation, sans avoir à justifier de motif. Ce délai est plus
            généreux que les 14 jours minimum prévus par la loi française
            (article L.221-18 du Code de la consommation).
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">02</span>Comment retourner un produit</h2>
          <ol>
            <li>
              Envoyez-nous un email à{" "}
              <a href="mailto:contact@trailflow.boutique">contact@trailflow.boutique</a>{" "}
              en indiquant votre <strong>numéro de commande</strong> et le motif du retour.
            </li>
            <li>
              Nous vous renvoyons une <strong>étiquette de retour prépayée</strong> sous 24h ouvrées.
            </li>
            <li>
              Emballez le produit dans son <strong>conditionnement d&apos;origine</strong>,
              avec les étiquettes intactes et tous les accessoires.
            </li>
            <li>
              Collez l&apos;étiquette de retour, déposez le colis en bureau de
              poste ou en point relais.
            </li>
            <li>
              Dès réception et contrôle du produit, nous procédons au remboursement
              sous <strong>14 jours maximum</strong>.
            </li>
          </ol>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">03</span>État du produit retourné</h2>
          <p>
            Pour être accepté, le produit doit être :
          </p>
          <ul>
            <li>Dans son <strong>état d&apos;origine</strong> (neuf, non-utilisé)</li>
            <li>Avec les <strong>étiquettes attachées</strong></li>
            <li>Dans son <strong>emballage d&apos;origine</strong></li>
            <li>Accompagné de tous les <strong>accessoires inclus</strong></li>
          </ul>
          <p>
            Les essayages courts sont autorisés. En revanche, un produit visiblement
            porté, lavé, taché ou endommagé pourra être refusé ou faire l&apos;objet
            d&apos;une décote.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">04</span>Frais de retour</h2>
          <p>
            <strong>Le retour est 100% gratuit</strong> en France métropolitaine,
            Belgique, Suisse et Luxembourg. Nous prenons en charge les frais via
            une étiquette prépayée.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">05</span>Modalités de remboursement</h2>
          <p>
            Le remboursement est effectué sur le <strong>même moyen de paiement</strong>{" "}
            utilisé lors de la commande (carte bancaire via Stripe). Vous recevez
            une confirmation par email dès le traitement.
          </p>
          <p>
            Délai : <strong>3 à 5 jours ouvrés</strong> pour voir le remboursement
            apparaître sur votre compte (selon votre banque).
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">06</span>Échange de taille</h2>
          <p>
            Le gilet ne vous va pas ? Vous pouvez l&apos;échanger contre une autre
            taille, sans frais. Indiquez la nouvelle taille souhaitée dans votre
            email, nous expédions la nouvelle dès réception du retour. Sous
            réserve de stock disponible.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">07</span>Produit défectueux</h2>
          <p>
            En cas de défaut constaté à la réception (couture, mesh, boucle, zip…),
            contactez-nous immédiatement avec une photo. Nous procédons à un
            <strong> échange gratuit</strong> ou un <strong>remboursement intégral</strong>{" "}
            au choix.
          </p>
          <p>
            La <strong>garantie légale de conformité</strong> couvre tout défaut
            apparu dans les <strong>2 ans</strong> suivant la livraison
            (articles L.217-4 à L.217-14 du Code de la consommation).
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">08</span>Une question ?</h2>
          <p>
            Notre équipe répond sous <strong>48h ouvrées</strong> :{" "}
            <a href="mailto:contact@trailflow.boutique">contact@trailflow.boutique</a>.
          </p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
