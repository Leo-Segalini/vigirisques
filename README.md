# IA VigiRisques — landing page

Landing page responsive, SEO/GEO-ready, en HTML, CSS et JavaScript natifs.

## Lancer le projet
- Ouvrir `index.html` dans un navigateur, ou
- Depuis ce dossier : `python3 -m http.server 8000`, puis ouvrir http://localhost:8000.

## Déploiement
1. Publier tout le dossier (hors `Documentation/` si vous ne souhaitez pas l'exposer).
2. Pointer le domaine vers `index.html`.
3. Vérifier que `https://leo-segalini.github.io/vigirisques` est correct dans `sitemap.xml`, `robots.txt` et les balises `canonical` / Open Graph (adapter si autre domaine).
4. Le formulaire de démonstration ouvre un e-mail prérempli vers `contact@vigirisques.fr` (mailto). Brancher un CRM/API si besoin.

## Fichiers
- `index.html` — landing principale (SEO, schema.org, FAQ)
- `styles.css` — design system bleu + responsive
- `script.js` — navigation, démo, carrousel, modale, cookies, mailto
- `mentions-legales.html` / `confidentialite.html` — pages légales
- `guides/` — 3 guides indexés
- `robots.txt` / `sitemap.xml` / `favicon.svg`
- `Documentation/` — documentation interne du projet

## SEO / GEO inclus
- Meta description, canonical, Open Graph, Twitter Card
- JSON-LD : Organization, WebSite, SoftwareApplication, FAQPage (+ Article sur les guides)
- FAQ visible, définitions claires, liens internes valides
- Sitemap et robots.txt

## Contenu
Tous les placeholders ont été remplacés. Les chiffres de la landing décrivent le produit (1 photo, 3 priorités, PDF, hébergement FR) plutôt que des KPI non vérifiés. Les témoignages sont des retours de partenaires pilotes anonymisés par initiale.
