# IA VigiRisques — landing page

Landing page responsive, SEO/GEO-ready, en HTML, CSS et JavaScript natifs.

## Lancer le projet
- Ouvrir `index.html` dans un navigateur, ou
- Depuis ce dossier : `python3 -m http.server 8000`, puis ouvrir http://localhost:8000.

## Formulaire Brevo (sans BDD)

Le formulaire envoie les demandes via un **Cloudflare Worker** qui appelle l’API Brevo. La clé API n’est jamais dans le front.

```bash
cd brevo-worker
npm install
npx wrangler login
npx wrangler secret put BREVO_API_KEY   # colle ta clé Brevo
npm run deploy                          # note l’URL *.workers.dev
```

Puis dans `config.js` :

```js
window.VIGIRISQUES_CONFIG = {
  formApiUrl: "https://vigirisques-form.<ton-compte>.workers.dev",
};
```

**Prérequis Brevo :** expéditeur `contact@vigirisques.fr` vérifié (ou adapter `FORM_FROM_EMAIL` dans `brevo-worker/wrangler.toml`).

## Déploiement site
1. Pousser sur `main` (GitHub Pages).
2. Vérifier `config.js` (URL Worker) et les canonical/sitemap si le domaine change.

## Fichiers
- `index.html` / `styles.css` / `script.js` / `config.js`
- `brevo-worker/` — proxy Brevo (Cloudflare Worker)
- `images/` — photos design
- `guides/` · pages légales · `robots.txt` · `sitemap.xml`
- `Documentation/` — docs internes
