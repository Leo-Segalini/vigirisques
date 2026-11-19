/**
 * Configuration publique uniquement (pas de secrets).
 * formApiUrl vide = fallback mailto (prod non bloquée sans Cloudflare).
 * formToEmail = destinataire des demandes de démonstration.
 */
window.VIGIRISQUES_CONFIG = {
  formApiUrl: "",
  formToEmail: "ali@iroko.io",
};
