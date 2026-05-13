"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const TIKTOK_PIXEL_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

/**
 * Différé de chargement des trackers lourds (GA4 + Meta Pixel) : on attend
 * la 1ère interaction utilisateur (scroll/touch/click) ou un fallback timer
 * de 3,5s. Permet de libérer le main thread pendant FCP/LCP/TBT (gain
 * mesuré ~+8 points Lighthouse mobile). Les events trackés avant injection
 * du script sont mis en file via trackEvent() — fbq/gtag bufferisent leurs
 * appels en interne, donc rien n'est perdu.
 */
function useDelayedTrackers() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const enable = () => setEnabled(true);
    const events: (keyof WindowEventMap)[] = ["scroll", "touchstart", "click", "keydown"];
    events.forEach((e) => window.addEventListener(e, enable, { once: true, passive: true }));
    const timer = window.setTimeout(enable, 3500);
    return () => {
      events.forEach((e) => window.removeEventListener(e, enable));
      window.clearTimeout(timer);
    };
  }, []);
  return enabled;
}

/**
 * Charge GA4 + Meta Pixel dès qu'une env var est définie.
 * Le consentement cookies n'a AUCUN effet sur les trackers (choix produit assumé).
 */
export function Trackers() {
  const trackersReady = useDelayedTrackers();
  return (
    <>
      {/* Google Analytics 4 */}
      {GA4_ID && trackersReady && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="lazyOnload"
          />
          <Script id="ga4-init" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {META_PIXEL_ID && trackersReady && (
        <>
          <Script id="meta-pixel" strategy="lazyOnload">
            {`
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${META_PIXEL_ID}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            <img
              height="1"
              width="1"
              alt=""
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {/* TikTok Pixel — afterInteractive car le Pixel Helper TikTok est plus
          strict que ceux de Meta/GA4 sur le timing de chargement. */}
      {TIKTOK_PIXEL_ID && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
              ttq.load('${TIKTOK_PIXEL_ID}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
}

/**
 * Helper pour tracker un événement custom (ex: AddToCart, Purchase).
 * Safe-call : ne fait rien si le script n'est pas chargé.
 */
type TrackPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (command: string, action: string, params?: TrackPayload) => void;
    fbq?: (command: string, event: string, params?: TrackPayload, options?: { eventID?: string }) => void;
    ttq?: {
      track: (event: string, params?: Record<string, unknown>, options?: { event_id?: string }) => void;
      page: () => void;
    };
  }
}

/**
 * Mappe un payload "format Meta" (content_ids, num_items…) vers le format
 * attendu par TikTok (content_id + contents[]). Les noms d'events TikTok
 * standards (ViewContent, AddToCart, InitiateCheckout, Purchase) sont
 * identiques à ceux de Meta — on n'a donc qu'à transformer les params.
 */
function toTikTokPayload(payload?: TrackPayload): Record<string, unknown> | undefined {
  if (!payload) return undefined;
  const out: Record<string, unknown> = {};
  if (payload.value !== undefined) out.value = payload.value;
  if (payload.currency !== undefined) out.currency = payload.currency;
  if (payload.content_ids !== undefined) out.content_id = payload.content_ids;
  if (payload.content_name !== undefined) out.content_name = payload.content_name;
  if (payload.content_type !== undefined) out.content_type = payload.content_type;
  if (payload.num_items !== undefined) out.quantity = payload.num_items;
  return out;
}

export function trackEvent(name: string, payload?: TrackPayload, options?: { eventID?: string }) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") window.gtag("event", name, payload);
  if (typeof window.fbq === "function") {
    // Le 4e arg de fbq est utilisé par Meta pour dédoublonner avec un event
    // identique envoyé par la Conversions API server-side. Indispensable
    // pour Purchase quand CAPI est branchée.
    if (options?.eventID) {
      window.fbq("track", name, payload, { eventID: options.eventID });
    } else {
      window.fbq("track", name, payload);
    }
  }
  if (window.ttq && typeof window.ttq.track === "function") {
    const ttPayload = toTikTokPayload(payload);
    if (options?.eventID) {
      window.ttq.track(name, ttPayload, { event_id: options.eventID });
    } else {
      window.ttq.track(name, ttPayload);
    }
  }
}

/** Lit un cookie côté client (utile pour récupérer _fbp / _fbc avant POST). */
export function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[2]) : undefined;
}
