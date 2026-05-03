import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Conditions Générales de Vente — TrailFlow",
  description:
    "Conditions générales de vente du site trailflow.boutique — commande, livraison, retours et garanties du gilet hydratation TrailFlow.",
  alternates: { canonical: "/cgv" },
};

export default function CgvPage() {
  return (
    <main className="legal-page">
      <div className="legal-wrap">
        <a href="/" className="legal-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Retour à l'accueil
        </a>

        <h1 className="legal-h1">Conditions générales de vente</h1>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">01</span>Objet</h2>
          <p>
            Les présentes conditions générales de vente (CGV) régissent les ventes
            de produits effectuées sur le site <strong>trailflow.shop</strong>.
            Toute commande implique l'acceptation sans réserve des présentes CGV.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">02</span>Produits</h2>
          <p>
            Les produits proposés à la vente — gilet d'hydratation TrailFlow et
            accessoires associés — sont décrits avec la plus grande exactitude
            possible. Les photographies et vidéos illustrant les produits n'entrent
            pas dans le champ contractuel. En cas d'erreur, notre responsabilité ne
            saurait être engagée.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">03</span>Prix</h2>
          <p>
            Les prix sont indiqués en euros, toutes taxes comprises (TTC). Les
            frais de livraison sont offerts pour la France métropolitaine.
            L'éditeur se réserve le droit de modifier ses prix à tout moment, les
            produits étant facturés au prix en vigueur au moment de la commande.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">04</span>Commande</h2>
          <p>Le processus de commande comprend les étapes suivantes :</p>
          <ol>
            <li>Sélection du produit, de la taille (S, M, L, XL) et du coloris</li>
            <li>Choix de la quantité</li>
            <li>Saisie des informations de livraison</li>
            <li>Paiement sécurisé via Stripe</li>
            <li>Confirmation de commande par email</li>
          </ol>
          <p>
            La commande est définitive après confirmation du paiement. Un email de
            confirmation est envoyé à l'adresse indiquée lors de la commande.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">05</span>Paiement</h2>
          <p>
            Le paiement s'effectue par carte bancaire (Visa, Mastercard, CB) via la
            plateforme sécurisée Stripe. Vos données bancaires sont chiffrées et
            ne sont jamais stockées sur nos serveurs. Le débit est effectué au
            moment de la confirmation de commande.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">06</span>Livraison</h2>
          <p>
            Les délais de livraison sont estimés entre <strong>5 et 7 jours ouvrés</strong>{" "}
            pour la France métropolitaine, via Colissimo. Un numéro de suivi vous
            sera communiqué par email dès l'expédition.
          </p>
          <p>
            En cas de retard significatif (au-delà de 30 jours), vous pouvez
            annuler votre commande et obtenir un remboursement intégral
            conformément à l'article L.216-2 du Code de la consommation.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">07</span>Droit de rétractation</h2>
          <p>
            Conformément à l'article L.221-18 du Code de la consommation, vous
            disposez d'un délai de <strong>14 jours</strong> à compter de la
            réception du produit pour exercer votre droit de rétractation, sans
            avoir à justifier de motif ni à payer de pénalité.
          </p>
          <p>
            Pour exercer ce droit, contactez-nous à{" "}
            <a href="mailto:contact@trailflow.shop">contact@trailflow.shop</a> en
            indiquant votre numéro de commande. Le produit doit être retourné dans
            son état d'origine, étiquettes intactes, dans un délai de 14 jours
            suivant la notification de rétractation.
          </p>
          <p>
            Le remboursement sera effectué dans les 14 jours suivant la réception
            du produit retourné, via le même moyen de paiement que celui utilisé
            lors de la commande. Les frais de retour sont à la charge du client.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">08</span>Garanties</h2>
          <p>
            Outre la garantie commerciale de{" "}
            <strong>15 jours satisfait ou remboursé</strong>, vous bénéficiez des
            garanties légales suivantes :
          </p>
          <ul>
            <li>
              <strong>Garantie légale de conformité</strong> (articles L.217-4 à
              L.217-14 du Code de la consommation) : 2 ans à compter de la
              livraison
            </li>
            <li>
              <strong>Garantie des vices cachés</strong> (articles 1641 à 1649 du
              Code civil) : 2 ans à compter de la découverte du défaut
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">09</span>Service client</h2>
          <p>Pour toute question ou réclamation, contactez notre service client :</p>
          <p>
            Email :{" "}
            <a href="mailto:contact@trailflow.shop">contact@trailflow.shop</a>
            <br />
            Délai de réponse : 48 heures ouvrées maximum
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">10</span>Médiation</h2>
          <p>
            En cas de litige non résolu avec notre service client, vous pouvez
            recourir gratuitement au médiateur de la consommation désigné dans nos{" "}
            <a href="/mentions-legales">mentions légales</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">11</span>Droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige,
            et après tentative de médiation, les tribunaux français seront seuls
            compétents.
          </p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
