/**
 * Cloudflare Worker — proxy sécurisé Brevo (sans BDD)
 * Reçoit le formulaire, valide, envoie un e-mail transactionnel via Brevo.
 */

const PROFILE_LABELS = {
  collectivite: "Mairie ou collectivité",
  assureur: "Assureur ou courtier",
  autre: "Autre",
};

function json(data, status = 200, origin = "*") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "86400",
      "cache-control": "no-store",
    },
  });
}

function pickOrigin(request, allowedCsv) {
  const origin = request.headers.get("Origin") || "";
  const allowed = String(allowedCsv || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!origin) return allowed[0] || "*";
  if (allowed.includes(origin)) return origin;
  return null;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function validatePayload(body) {
  const name = String(body.name || "").trim();
  const organization = String(body.organization || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const profile = String(body.profile || "").trim();
  const consent = Boolean(body.consent);
  const website = String(body.website || "").trim(); // honeypot

  if (website) return { ok: false, spam: true, error: "Rejeté." };
  if (name.length < 2 || name.length > 120) return { ok: false, error: "Nom invalide." };
  if (organization.length < 2 || organization.length > 160) {
    return { ok: false, error: "Organisation invalide." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) {
    return { ok: false, error: "Email invalide." };
  }
  if (!PROFILE_LABELS[profile]) return { ok: false, error: "Profil invalide." };
  if (!consent) return { ok: false, error: "Consentement requis." };

  return {
    ok: true,
    data: { name, organization, email, profile, consent },
  };
}

async function sendBrevoEmail(env, data) {
  const toEmail = env.FORM_TO_EMAIL || "ali@iroko.io";
  const fromEmail = env.FORM_FROM_EMAIL || toEmail;
  const fromName = env.FORM_FROM_NAME || "IA VigiRisques";
  const profileLabel = PROFILE_LABELS[data.profile] || data.profile;

  const htmlContent = `
    <h2>Nouvelle demande de démonstration</h2>
    <p><strong>Nom :</strong> ${escapeHtml(data.name)}</p>
    <p><strong>Organisation :</strong> ${escapeHtml(data.organization)}</p>
    <p><strong>Email :</strong> ${escapeHtml(data.email)}</p>
    <p><strong>Profil :</strong> ${escapeHtml(profileLabel)}</p>
    <p><strong>Consentement :</strong> oui</p>
    <hr>
    <p style="color:#666;font-size:12px">Envoyé depuis le site IA VigiRisques (Brevo).</p>
  `;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: fromName, email: fromEmail },
      to: [{ email: toEmail, name: fromName }],
      replyTo: { email: data.email, name: data.name },
      subject: `Demande de démonstration — ${data.organization}`,
      htmlContent,
      tags: ["vigirisques-demo"],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Brevo error", res.status, detail.slice(0, 500));
    throw new Error("BREVO_SEND_FAILED");
  }
}

export default {
  async fetch(request, env) {
    const origin = pickOrigin(request, env.ALLOWED_ORIGINS);
    if (request.method === "OPTIONS") {
      if (!origin) return new Response(null, { status: 403 });
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": origin,
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "content-type",
          "access-control-max-age": "86400",
        },
      });
    }

    if (request.method !== "POST") {
      return json({ error: "Méthode non autorisée." }, 405, origin || "*");
    }

    if (!origin) {
      return json({ error: "Origine non autorisée." }, 403, "*");
    }

    if (!env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY manquante");
      return json({ error: "Service e-mail non configuré." }, 503, origin);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Payload invalide." }, 400, origin);
    }

    const validated = validatePayload(body);
    if (validated.spam) return json({ ok: true }, 200, origin); // silence bots
    if (!validated.ok) return json({ error: validated.error }, 422, origin);

    try {
      await sendBrevoEmail(env, validated.data);
      return json({ ok: true }, 200, origin);
    } catch {
      return json(
        { error: "Envoi impossible pour le moment. Réessayez ou écrivez à contact@vigirisques.fr." },
        502,
        origin
      );
    }
  },
};
