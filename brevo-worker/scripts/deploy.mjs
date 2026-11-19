#!/usr/bin/env node
/**
 * Déploie le Worker Cloudflare et configure le secret Brevo depuis le .env racine.
 * Usage (racine) : npm run deploy:form
 */
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerDir = resolve(__dirname, "..");
const rootDir = resolve(workerDir, "..");
const envPath = resolve(rootDir, ".env");

function loadEnv(path) {
  if (!existsSync(path)) {
    console.error(`Fichier manquant : ${path}`);
    console.error(
      "Copie .env.example vers .env et renseigne BREVO_API_KEY, CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID."
    );
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

function run(cmd, args, { env, input, inherit = false } = {}) {
  const res = spawnSync(cmd, args, {
    cwd: workerDir,
    encoding: "utf8",
    env: { ...process.env, ...env },
    input,
    stdio: inherit ? "inherit" : ["pipe", "pipe", "pipe"],
  });
  if (res.status !== 0) {
    const err = (res.stderr || res.stdout || "").trim();
    if (err) console.error(err);
    process.exit(res.status || 1);
  }
  return res;
}

function extractWorkersUrl(text) {
  const match = text.match(/https:\/\/[a-z0-9.-]+\.workers\.dev\/?/i);
  return match ? match[0].replace(/\/$/, "") : "";
}

const fileEnv = loadEnv(envPath);
const required = ["BREVO_API_KEY", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"];
for (const key of required) {
  if (!fileEnv[key]) {
    console.error(`Variable manquante dans .env : ${key}`);
    process.exit(1);
  }
}

const cfEnv = {
  CLOUDFLARE_API_TOKEN: fileEnv.CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID: fileEnv.CLOUDFLARE_ACCOUNT_ID,
};

writeFileSync(
  resolve(workerDir, ".dev.vars"),
  `BREVO_API_KEY=${fileEnv.BREVO_API_KEY}\n`,
  "utf8"
);
console.log("✓ .dev.vars synchronisé (local)");

console.log("→ Déploiement Cloudflare Worker…");
const deploy = run("npx", ["wrangler", "deploy"], { env: cfEnv });
const deployOut = `${deploy.stdout || ""}\n${deploy.stderr || ""}`;
process.stdout.write(deployOut);

console.log("→ Configuration du secret BREVO_API_KEY…");
run("npx", ["wrangler", "secret", "put", "BREVO_API_KEY"], {
  env: cfEnv,
  input: `${fileEnv.BREVO_API_KEY}\n`,
});
console.log("✓ Secret BREVO_API_KEY enregistré");

let formApiUrl = (fileEnv.FORM_API_URL || "").trim() || extractWorkersUrl(deployOut);

if (formApiUrl) {
  const configPath = resolve(rootDir, "config.js");
  let config = readFileSync(configPath, "utf8");
  if (!/formApiUrl:\s*["'][^"']*["']/.test(config)) {
    console.error("Impossible de mettre à jour config.js (champ formApiUrl introuvable).");
    process.exit(1);
  }
  config = config.replace(
    /formApiUrl:\s*["'][^"']*["']/,
    `formApiUrl: "${formApiUrl}"`
  );
  writeFileSync(configPath, config, "utf8");
  console.log(`✓ config.js → formApiUrl = ${formApiUrl}`);

  // Persiste l'URL dans .env pour les prochains déploiements
  let envText = readFileSync(envPath, "utf8");
  if (/^FORM_API_URL=/m.test(envText)) {
    envText = envText.replace(/^FORM_API_URL=.*$/m, `FORM_API_URL=${formApiUrl}`);
  } else {
    envText = `${envText.trimEnd()}\nFORM_API_URL=${formApiUrl}\n`;
  }
  writeFileSync(envPath, envText, "utf8");
} else {
  console.log("⚠ URL Worker non détectée. Colle manuellement l’URL *.workers.dev dans config.js.");
}

console.log("\nDéploiement terminé. Teste le formulaire, puis pousse config.js si besoin.");
