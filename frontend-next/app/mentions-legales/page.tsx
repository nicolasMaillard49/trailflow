import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Mentions Légales — TrailFlow",
  description:
    "Mentions légales du site trailflow.boutique — informations sur l'éditeur, l'hébergeur et les conditions d'utilisation.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
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

        <h1 className="legal-h1">Mentions légales</h1>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">01</span>Éditeur du site</h2>
          <p>
            Le site <strong>trailflow.shop</strong> est édité par :<br />
            <strong>NMF Agence</strong>
            <br />
            Entrepreneur individuel
            <br />
            Siège social : 1 rue Marguerin, 75014 Paris, France
            <br />
            SIREN : 102 905 379
            <br />
            SIRET : 102 905 379 00016
            <br />
            Code APE : 6201Z – Programmation informatique
            <br />
            TVA : Non applicable, article 293 B du CGI
            <br />
            Directeur de la publication : NMF Agence
            <br />
            Contact :{" "}
            <a href="mailto:contact@trailflow.shop">contact@trailflow.shop</a>
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">02</span>Hébergeur</h2>
          <p>
            Le site est hébergé par :<br />
            Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, USA (frontend)
            <br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">
              vercel.com
            </a>
          </p>
          <p>
            Railway Corp., 2261 Market Street #4029, San Francisco, CA 94114, USA
            (backend et base de données)
            <br />
            <a href="https://railway.app" target="_blank" rel="noopener noreferrer">
              railway.app
            </a>
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">03</span>Propriété intellectuelle</h2>
          <p>
            L'ensemble du contenu de ce site (textes, photographies, vidéos, logos,
            icônes, identité visuelle, code source, etc.) est protégé par le droit
            d'auteur et le droit de la propriété intellectuelle. La marque
            TrailFlow, son logotype et les visuels associés sont la propriété
            exclusive de l'éditeur. Toute reproduction, représentation,
            modification, publication, adaptation, totale ou partielle, des
            éléments du site est interdite sans l'autorisation écrite préalable de
            l'éditeur.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">04</span>Protection des données personnelles</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD)
            et à la loi Informatique et Libertés du 6 janvier 1978 modifiée, vous
            disposez d'un droit d'accès, de rectification, de suppression et de
            portabilité de vos données personnelles.
          </p>
          <p>
            Les données collectées dans le cadre d'une commande (nom, adresse,
            email, téléphone) sont exclusivement utilisées pour le traitement de
            votre commande, l'expédition et le service après-vente. Elles ne sont
            jamais cédées à des tiers à des fins commerciales.
          </p>
          <p>
            Pour exercer ces droits ou pour toute question relative à la
            protection de vos données, contactez-nous à :{" "}
            <a href="mailto:contact@trailflow.shop">contact@trailflow.shop</a>
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">05</span>Cookies</h2>
          <p>
            Le site utilise des cookies essentiels au fonctionnement du service
            (session, panier, paiement Stripe). Aucun cookie publicitaire ou de
            suivi tiers n'est déposé sans votre consentement explicite.
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">06</span>Médiation des litiges</h2>
          <p>
            Conformément aux articles L.616-1 et R.616-1 du Code de la
            consommation, en cas de litige non résolu, le consommateur peut
            recourir gratuitement au service de médiation de la consommation.
          </p>
          <p>
            Plateforme européenne de règlement en ligne des litiges :{" "}
            <a
              href="https://ec.europa.eu/consumers/odr"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr
            </a>
          </p>
        </section>

        <section className="legal-section">
          <h2 className="legal-h2"><span className="num">07</span>Droit applicable</h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. En
            cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </section>
      </div>
      <SiteFooter />
    </main>
  );
}
