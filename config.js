/**
 * Configuration publique uniquement (pas de secrets).
 * formApiUrl vide = fallback mailto (prod non bloquée sans Cloudflare).
 * Après déploiement du Worker : coller l'URL *.workers.dev
 */
window.VIGIRISQUES_CONFIG = {
  formApiUrl: "",
};
