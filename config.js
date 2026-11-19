/**
 * Configuration publique uniquement (pas de secrets).
 * formApiUrl vide = envoi HTTP vers formToEmail (sans ouvrir le client mail).
 * formApiUrl renseigné = Cloudflare Worker + Brevo.
 */
window.VIGIRISQUES_CONFIG = {
  formApiUrl: "",
  formToEmail: "ali@iroko.io",
};
