import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Politique de confidentialité — TrailFlow",
  description:
    "Politique de confidentialité du site trailflow.boutique — collecte, usage et protection de vos données personnelles.",
  alternates: { canonical: "/confidentialite" },
};

export default function ConfidentialitePage() {
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

        <h1 className="legal-h1">Politique de confidentialité</h1>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">01</span>Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles collectées sur le
            site <strong>trailflow.boutique</strong> est <strong>NMF Agence</strong>,
            entrepreneur individuel — 1 rue Marguerin, 75014 Paris, France —
            SIREN 102 905 379. Contact :{" "}
            <a href="mailto:contact@trailflow.boutique">contact@trailflow.boutique</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">02</span>Données collectées</h2>
          <p>Nous collectons les données strictement nécessaires à votre commande :</p>
          <ul>
            <li><strong>Identité</strong> : nom, prénom</li>
            <li><strong>Coordonnées</strong> : adresse email, numéro de téléphone</li>
            <li><strong>Adresse de livraison</strong> : rue, code postal, ville, pays</li>
            <li><strong>Données de commande</strong> : produits, quantités, montant, statut</li>
            <li><strong>Données techniques</strong> : adresse IP, navigateur, pages visitées (anonymisées)</li>
          </ul>
          <p>
            Aucune donnée bancaire n&apos;est stockée sur nos serveurs. Le paiement
            est traité directement par <strong>Stripe</strong> (PCI-DSS niveau 1).
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">03</span>Finalités</h2>
          <p>Vos données sont utilisées exclusivement pour :</p>
          <ul>
            <li>Traiter et expédier votre commande</li>
            <li>Vous envoyer la confirmation et le suivi de livraison par email</li>
            <li>Répondre à vos demandes au service client</li>
            <li>Gérer les retours et remboursements</li>
            <li>Respecter nos obligations légales (facturation, comptabilité)</li>
            <li>
              Si vous y consentez : mesurer l&apos;audience du site (Google Analytics 4)
              et l&apos;efficacité de nos campagnes publicitaires (Meta Pixel)
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">04</span>Base légale</h2>
          <ul>
            <li><strong>Exécution du contrat</strong> : pour le traitement de la commande</li>
            <li><strong>Obligation légale</strong> : pour la conservation des factures</li>
            <li><strong>Consentement</strong> : pour les cookies de mesure et de publicité</li>
            <li><strong>Intérêt légitime</strong> : pour la prévention de la fraude</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">05</span>Durée de conservation</h2>
          <ul>
            <li><strong>Données de commande</strong> : 10 ans (obligation comptable)</li>
            <li><strong>Données client</strong> : 3 ans après la dernière commande, puis archivage</li>
            <li><strong>Cookies de mesure</strong> : 13 mois maximum</li>
            <li><strong>Logs techniques</strong> : 12 mois</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">06</span>Destinataires</h2>
          <p>Vos données ne sont jamais cédées à des tiers à des fins commerciales. Elles peuvent être partagées avec :</p>
          <ul>
            <li><strong>Stripe</strong> (paiement) — Stripe Inc., Irlande</li>
            <li><strong>Resend</strong> (envoi des emails transactionnels) — Resend Inc., USA</li>
            <li><strong>Vercel</strong> (hébergement frontend) — USA</li>
            <li><strong>Railway</strong> (hébergement backend et base de données) — USA</li>
            <li>
              <strong>Google Analytics 4</strong> et <strong>Meta Pixel</strong>{" "}
              (uniquement avec votre consentement)
            </li>
            <li><strong>Notre transporteur</strong> Colissimo / La Poste pour la livraison</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">07</span>Transferts hors UE</h2>
          <p>
            Certains de nos sous-traitants (Stripe, Resend, Vercel, Railway, Google,
            Meta) hébergent des données en dehors de l&apos;Union Européenne, principalement
            aux États-Unis. Ces transferts sont encadrés par le Data Privacy Framework
            ou par des clauses contractuelles types validées par la Commission Européenne.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">08</span>Vos droits</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul>
            <li><strong>Droit d&apos;accès</strong> à vos données</li>
            <li><strong>Droit de rectification</strong> en cas d&apos;erreur</li>
            <li><strong>Droit à l&apos;effacement</strong> (« droit à l&apos;oubli »)</li>
            <li><strong>Droit à la portabilité</strong> de vos données</li>
            <li><strong>Droit d&apos;opposition</strong> au traitement</li>
            <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
            <li><strong>Droit d&apos;introduire une réclamation</strong> auprès de la CNIL</li>
          </ul>
          <p>
            Pour exercer vos droits :{" "}
            <a href="mailto:contact@trailflow.boutique">contact@trailflow.boutique</a>.
            Réponse sous 30 jours maximum.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">09</span>Cookies</h2>
          <p>
            Le site utilise deux types de cookies :
          </p>
          <ul>
            <li>
              <strong>Cookies essentiels</strong> (toujours actifs) : panier,
              paiement, session. Sans ces cookies, le site ne peut pas fonctionner.
            </li>
            <li>
              <strong>Cookies de mesure et de publicité</strong> (soumis à votre
              consentement) : Google Analytics 4 et Meta Pixel pour mesurer
              l&apos;audience et l&apos;efficacité publicitaire.
            </li>
          </ul>
          <p>
            Le bandeau de consentement vous permet d&apos;accepter ou de refuser
            les cookies non-essentiels. Vous pouvez modifier votre choix à tout
            moment en effaçant les cookies du site dans votre navigateur.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">10</span>Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles
            appropriées pour protéger vos données : chiffrement HTTPS, accès
            restreint, mots de passe hashés, sauvegardes régulières.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">11</span>Réclamations</h2>
          <p>
            En cas de désaccord sur le traitement de vos données, vous pouvez
            saisir la CNIL :{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
              www.cnil.fr
            </a>.
          </p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
