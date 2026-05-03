/**
 * Footer global du site (public). Réutilisé sur toutes les pages user-facing.
 */
export function SiteFooter() {
  return (
    <footer>
      <div className="footer-logo">TrailFlow</div>
      <div className="footer-links">
        <a href="/suivi">Suivi commande</a>
        <a href="/mentions-legales">Mentions légales</a>
        <a href="/cgv">CGV</a>
        <a href="/confidentialite">Confidentialité</a>
        <a href="/retours">Retours</a>
        <a href="mailto:contact@trailflow.boutique">Contact</a>
      </div>
      <div className="footer-credit">
        Site conçu par{" "}
        <a
          href="https://www.nmf-agence.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          NMF Agence
        </a>
      </div>
      <div className="footer-copy">© 2026 TrailFlow</div>
    </footer>
  );
}
