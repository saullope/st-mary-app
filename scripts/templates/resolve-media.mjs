// Resuelve las imágenes y videos pendientes del catálogo de plantillas
// (src/features/templates/catalog) y regenera catalog/index.ts.
//
//   node scripts/templates/resolve-media.mjs            busca, sube y escribe los JSON
//   node scripts/templates/resolve-media.mjs --dry-run  solo muestra lo que elegiría
//
// Pixabay prohíbe enlazar sus imágenes: se descargan y se suben a Firebase Storage
// (uploads/pixabay_*, el mismo esquema que el editor). Unsplash pide lo contrario:
// mostrar su URL, avisar la descarga y citar al autor. De YouTube solo se aceptan videos
// insertables y marcados como contenido para niños; aun así, los revisa una persona.
// "counting" no busca nada: dibuja una ilustración con la cantidad exacta (ver counting-art.mjs),
// porque una foto de stock no garantiza cuántas cosas muestra.
import { createRequire } from "module";
import { randomUUID } from "crypto";
import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { join, relative, resolve } from "path";
import { countingSvg } from "./counting-art.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const require = createRequire(join(ROOT, "package.json"));
require("@next/env").loadEnvConfig(ROOT);

const CATALOG = join(ROOT, "src/features/templates/catalog");
const DRY_RUN = process.argv.includes("--dry-run");
const env = process.env;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : name.endsWith(".json") ? [path] : [];
  });
}

let bucket = null;
function storageBucket() {
  if (bucket) return bucket;
  const { initializeApp, cert } = require("firebase-admin/app");
  const { getStorage } = require("firebase-admin/storage");
  // La clave del .env trae "\n" literales.
  const privateKey = env.FIREBASE_PRIVATE_KEY.split("\\n").join("\n");
  const app = initializeApp({
    credential: cert({ projectId: env.FIREBASE_PROJECT_ID, clientEmail: env.FIREBASE_CLIENT_EMAIL, privateKey }),
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
  bucket = getStorage(app).bucket();
  return bucket;
}

async function uploadToStorage(imageUrl, name) {
  const response = await fetch(imageUrl);
  if (!response.ok) throw new Error(`download ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const path = `uploads/pixabay_${Date.now()}_${name.replace(/[^\w.-]+/g, "_")}`;
  const token = randomUUID();
  await storageBucket().file(path).save(buffer, {
    contentType: response.headers.get("content-type") ?? "image/jpeg",
    metadata: { metadata: { firebaseStorageDownloadTokens: token } },
  });
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket().name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

async function counting(spec) {
  const svg = countingSvg(spec);
  const name = createHash("sha1").update(spec).digest("hex").slice(0, 16);
  if (DRY_RUN) return { url: `counting:${spec}`, credit: "Ilustración de LudiGame" };
  // Mismo dibujo, mismo archivo: volver a resolver no sube copias.
  const path = `uploads/counting_${name}.svg`;
  const file = storageBucket().file(path);
  let [exists] = await file.exists();
  let token;
  if (exists) token = (await file.getMetadata())[0].metadata?.firebaseStorageDownloadTokens;
  if (!exists || !token) {
    token = randomUUID();
    await file.save(Buffer.from(svg), { contentType: "image/svg+xml", metadata: { metadata: { firebaseStorageDownloadTokens: token } } });
  }
  return {
    url: `https://firebasestorage.googleapis.com/v0/b/${storageBucket().name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`,
    credit: "Ilustración de LudiGame",
  };
}

async function getJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`${new URL(url).host} ${response.status}`);
  return response.json();
}

async function pixabay(query, used) {
  for (const imageType of ["illustration", "photo"]) {
    const params = new URLSearchParams({
      key: env.NEXT_PUBLIC_PIXABY_API_KEY, q: query, lang: "es", image_type: imageType, safesearch: "true", per_page: "20",
    });
    const data = await getJson(`https://pixabay.com/api/?${params}`);
    const hit = data.hits.find((h) => !used.has(`pixabay:${h.id}`));
    if (!hit) continue;
    used.add(`pixabay:${hit.id}`);
    const url = DRY_RUN ? hit.webformatURL : await uploadToStorage(hit.webformatURL, `${hit.id}.jpg`);
    return { url, credit: `Imagen de ${hit.user} en Pixabay` };
  }
  return null;
}

async function unsplash(query, used) {
  const headers = { Authorization: `Client-ID ${env.NEXT_PUBLIC_UNSPLASH_API_KEY}` };
  const params = new URLSearchParams({ query, lang: "es", per_page: "20", content_filter: "high", orientation: "landscape" });
  const data = await getJson(`https://api.unsplash.com/search/photos?${params}`, { headers });
  const photo = data.results.find((p) => !used.has(`unsplash:${p.id}`));
  if (!photo) return null;
  used.add(`unsplash:${photo.id}`);
  // Las reglas de la API piden registrar cada uso de una foto.
  if (!DRY_RUN) await fetch(photo.links.download_location, { headers }).catch(() => undefined);
  return { url: photo.urls.regular, credit: `Foto de ${photo.user.name} en Unsplash` };
}

async function youtube(query, used) {
  const key = env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const params = new URLSearchParams({
    part: "snippet", type: "video", q: query, maxResults: "15", safeSearch: "strict", videoEmbeddable: "true",
    relevanceLanguage: "es", regionCode: "NI", videoDuration: "medium", key,
  });
  const search = await getJson(`https://www.googleapis.com/youtube/v3/search?${params}`);
  const ids = search.items.map((item) => item.id.videoId).filter((id) => !used.has(`youtube:${id}`));
  if (ids.length === 0) return null;
  const details = await getJson(`https://www.googleapis.com/youtube/v3/videos?part=status,snippet&id=${ids.join(",")}&key=${key}`);
  const video = details.items.find((v) => v.status.embeddable && v.status.madeForKids);
  if (!video) return null;
  used.add(`youtube:${video.id}`);
  return { url: `https://www.youtube.com/embed/${video.id}`, credit: `Video de ${video.snippet.channelTitle} en YouTube: ${video.snippet.title}` };
}

const RESOLVERS = { pixabay, unsplash, youtube, counting };

function mediaNodes(value, found = []) {
  if (Array.isArray(value)) value.forEach((item) => mediaNodes(item, found));
  else if (value && typeof value === "object") {
    if (typeof value.source === "string" && typeof value.query === "string") found.push(value);
    else Object.values(value).forEach((item) => mediaNodes(item, found));
  }
  return found;
}

const files = walk(CATALOG).sort();
const pending = [];
for (const file of files) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  // Dentro de un mismo archivo no se repite una imagen (p. ej. las parejas de LudiMemory).
  const used = new Set();
  let changed = false;
  for (const node of mediaNodes(data)) {
    if (node.url) continue;
    try {
      const picked = await RESOLVERS[node.source](node.query, used);
      if (!picked) {
        pending.push(`${relative(CATALOG, file)}: ${node.source} "${node.query}" sin resultado`);
        continue;
      }
      console.log(`${relative(CATALOG, file)} · ${node.source} "${node.query}" -> ${picked.credit}`);
      if (!DRY_RUN) Object.assign(node, picked);
      changed = true;
    } catch (error) {
      pending.push(`${relative(CATALOG, file)}: ${node.source} "${node.query}" error ${error.message}`);
    }
  }
  if (changed && !DRY_RUN) writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

// Next no puede importar una carpeta entera: el índice lista cada archivo.
const templateFiles = files.filter((file) => !file.endsWith("collections.json"));
const index = [
  "// Generado por scripts/templates/resolve-media.mjs: no editar a mano.",
  'import collections from "./collections.json";',
  ...templateFiles.map((file, i) => `import t${i} from "./${relative(CATALOG, file).split("\\").join("/")}";`),
  "",
  "export const catalogCollections: unknown[] = collections;",
  `export const catalogTemplates: unknown[] = [${templateFiles.map((_, i) => `t${i}`).join(", ")}];`,
  "",
].join("\n");
if (!DRY_RUN) writeFileSync(join(CATALOG, "index.ts"), index);

console.log(`\n${files.length} archivos. Pendientes: ${pending.length}`);
pending.forEach((line) => console.log(`  - ${line}`));
