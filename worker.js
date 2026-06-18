const ORIGENES_PERMITIDOS = [
  "https://www.multiservice24.com.ar",
  "https://multiservice24.com.ar",
  "https://multi24.github.io",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5500"
];

const MAX_ARCHIVOS = 6;
const MAX_MB_POR_ARCHIVO = 30;
const MAX_BYTES_POR_ARCHIVO = MAX_MB_POR_ARCHIVO * 1024 * 1024;

function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "";
  const permitido = ORIGENES_PERMITIDOS.includes(origin);

  return {
    "Access-Control-Allow-Origin": permitido ? origin : "https://multi24.github.io",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function respuestaJson(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function limpiarNombreArchivo(nombre) {
  return String(nombre || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90);
}

function tipoGeneral(mime) {
  if (mime.startsWith("image/")) return "Foto";
  if (mime.startsWith("video/")) return "Video";
  if (mime.startsWith("audio/")) return "Audio";
  return "Archivo";
}

function escaparHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function obtenerGaleriaArchivos(request, env) {
  const url = new URL(request.url);
  const galeriaId = decodeURIComponent(url.pathname.replace("/g/", "")).trim();

  if (!galeriaId) {
    return new Response("Falta galería", {
      status: 400,
      headers: corsHeaders(request)
    });
  }

  const meta = await env.ARCHIVOS.get(`galerias/${galeriaId}.json`);

  if (!meta) {
    return new Response("Galería no encontrada", {
      status: 404,
      headers: corsHeaders(request)
    });
  }

  let data = null;

  try {
    data = JSON.parse(await meta.text());
  } catch (error) {
    return new Response("Galería inválida", {
      status: 500,
      headers: corsHeaders(request)
    });
  }

  const archivos = Array.isArray(data.archivos) ? data.archivos : [];
  const tituloGaleria = data.tituloGaleria || "Archivos de la solicitud";
  const descripcionGaleria = data.descripcionGaleria || "";

    const cards = archivos.map((archivo, index) => {
    const nombre = escaparHtml(archivo.nombre || `Archivo ${index + 1}`);
    const tipo = String(archivo.tipo || "");
    const tipoBonito = escaparHtml(archivo.tipoGeneral || "Archivo");
    const link = archivo.urlCorta || archivo.url || "";

    let preview = `
      <div class="file-icon">
        📎
      </div>
    `;

    if (tipo.startsWith("image/")) {
      preview = `<img src="${escaparHtml(link)}" alt="${nombre}" />`;
    }

    if (tipo.startsWith("video/")) {
      preview = `<video src="${escaparHtml(link)}" controls></video>`;
    }

    if (tipo.startsWith("audio/")) {
      preview = `
        <div class="audio-box">
          🎙️
          <audio src="${escaparHtml(link)}" controls></audio>
        </div>
      `;
    }

return `
      <article class="card">
        <div class="preview">
          <span class="contador">${index + 1}/${archivos.length}</span>
          ${preview}
        </div>

        <div class="info">
          <strong>${tipoBonito}</strong>
          <span>${nombre}</span>
          <a href="${escaparHtml(link)}" target="_blank" rel="noopener">Abrir archivo</a>
        </div>
      </article>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Archivos Multi24</title>

      <style>
:root{
  --azul-noche:#071b3a;
  --rojo:#e11f2a;
  --fondo:#f3f6fb;
  --muted:#6b768a;
  --borde:rgba(7,27,58,.12);
}

*{
  box-sizing:border-box;
}

body{
  margin:0;
  min-height:100vh;
  background:var(--fondo);
  font-family:Arial, Helvetica, sans-serif;
  color:var(--azul-noche);
}

header{
  padding:18px 20px;
  background:#fff;
  border-bottom:1px solid var(--borde);
  position:sticky;
  top:0;
  z-index:5;
}

h1{
  margin:0;
  font-size:24px;
  letter-spacing:-.4px;
}

p{
  margin:6px 0 0;
  color:var(--muted);
  font-weight:800;
}

.galeria{
  display:flex;
  align-items:stretch;
  gap:16px;
  overflow-x:auto;
  padding:20px;
  scroll-snap-type:x mandatory;
  overscroll-behavior-x:contain;
}

.card{
  flex:0 0 clamp(280px, 82vw, 340px);
  height:430px;
  background:#fff;
  border-radius:24px;
  overflow:hidden;
  border:1px solid var(--borde);
  box-shadow:0 14px 30px rgba(7,27,58,.12);
  scroll-snap-align:start;
  display:flex;
  flex-direction:column;
}

.preview{
  height:265px;
  flex:0 0 265px;
  background:#e9eff7;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  position:relative;
}

.contador{
  position:absolute;
  top:12px;
  right:12px;
  z-index:2;
  min-width:48px;
  text-align:center;
  padding:7px 10px;
  border-radius:999px;
  background:rgba(7,27,58,.88);
  color:#fff;
  font-size:13px;
  font-weight:1000;
  box-shadow:0 8px 18px rgba(7,27,58,.18);
}

.preview img,
.preview video{
  width:100%;
  height:100%;
  object-fit:contain;
  display:block;
  background:#e9eff7;
}

.audio-box{
  width:100%;
  height:100%;
  padding:24px;
  display:grid;
  align-content:center;
  gap:18px;
  text-align:center;
  font-size:56px;
}

.audio-box audio{
  width:100%;
}

.file-icon{
  font-size:70px;
}

.info{
  flex:1;
  padding:15px;
  display:grid;
  grid-template-rows:auto minmax(48px, 1fr) auto;
  gap:8px;
}

.info strong{
  color:var(--rojo);
  font-size:13px;
  line-height:1;
}

.info span{
  font-weight:1000;
  overflow:hidden;
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  line-height:1.25;
  min-height:48px;
  overflow-wrap:anywhere;
}

.info a{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-height:42px;
  padding:12px 14px;
  border-radius:999px;
  background:var(--azul-noche);
  color:#fff;
  text-decoration:none;
  font-weight:1000;
}

@media(min-width:900px){
  .galeria{
    padding:24px;
  }

  .card{
    flex-basis:340px;
  }
}

@media(max-width:640px){
  header{
    padding:16px;
  }

  h1{
    font-size:22px;
  }

  .galeria{
    padding:16px;
    gap:14px;
  }

  .card{
    flex-basis:calc(100vw - 32px);
    height:430px;
  }
}
      </style>
    </head>

    <body>
      <header>
<h1>${escaparHtml(tituloGaleria)}</h1>
${
  descripcionGaleria
    ? `<p class="galeria-detalle">${escaparHtml(descripcionGaleria)}</p>`
    : `<p>Fotos, videos y audios cargados desde Multi24.</p>`
}
      </header>

      <main class="galeria">
        ${cards || `<article class="card"><div class="info"><span>No hay archivos.</span></div></article>`}
      </main>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      ...corsHeaders(request),
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "private, max-age=3600"
    }
  });
}

async function subirArchivos(request, env) {
  const formData = await request.formData();
  const tituloGaleria = String(formData.get("titulo") || "Archivos de la solicitud").trim();
  const descripcionGaleria = String(formData.get("descripcion") || "").trim();
  const archivos = formData.getAll("files").filter(item => item instanceof File);

  const telefonoCliente = String(formData.get("telefono") || "")
    .replace(/[^\d]/g, "")
    .slice(-12) || "cliente";

  if (!archivos.length) {
    return respuestaJson({
      ok: false,
      error: "No se recibieron archivos."
    }, 400, request);
  }

  if (archivos.length > MAX_ARCHIVOS) {
    return respuestaJson({
      ok: false,
      error: `Máximo ${MAX_ARCHIVOS} archivos por solicitud.`
    }, 400, request);
  }

  const permitidos = ["image/", "video/", "audio/"];

  for (const archivo of archivos) {
    const mime = archivo.type || "";

    if (!permitidos.some(tipo => mime.startsWith(tipo))) {
      return respuestaJson({
        ok: false,
        error: `Archivo no permitido: ${archivo.name}`
      }, 400, request);
    }

    if (archivo.size > MAX_BYTES_POR_ARCHIVO) {
      return respuestaJson({
        ok: false,
        error: `El archivo ${archivo.name} supera ${MAX_MB_POR_ARCHIVO}MB.`
      }, 400, request);
    }
  }

  const ahora = new Date();
  const vence = new Date();
  vence.setMonth(vence.getMonth() + 6);

  const origen = new URL(request.url).origin;
  const subidos = [];

  let contadorArchivos = 0;
  let contadorAudios = 0;

  for (const archivo of archivos) {
    const nombreLimpio = limpiarNombreArchivo(archivo.name);
    const id = crypto.randomUUID();

    const key = `solicitudes/${ahora.getFullYear()}/${String(ahora.getMonth() + 1).padStart(2, "0")}/${Date.now()}-${id}-${nombreLimpio}`;

    await env.ARCHIVOS.put(key, archivo.stream(), {
      httpMetadata: {
        contentType: archivo.type || "application/octet-stream"
      },
      customMetadata: {
        nombreOriginal: archivo.name,
        tipoGeneral: tipoGeneral(archivo.type || ""),
        venceEn: vence.toISOString()
      }
    });

    const esAudio = (archivo.type || "").startsWith("audio/");

    if (esAudio) {
      contadorAudios++;
    } else {
      contadorArchivos++;
    }

    const shortBase = Date.now().toString(36).slice(-6);

    const shortId = esAudio
      ? `audio-${telefonoCliente}-${shortBase}-${contadorAudios}`
      : `archivo-${telefonoCliente}-${shortBase}-${contadorArchivos}`;

    await env.ARCHIVOS.put(`links/${shortId}.json`, JSON.stringify({
      key,
      nombre: archivo.name,
      tipo: archivo.type || "",
      tipoGeneral: tipoGeneral(archivo.type || ""),
      venceEn: vence.toISOString()
    }), {
      httpMetadata: {
        contentType: "application/json; charset=utf-8"
      }
    });

    subidos.push({
      nombre: archivo.name,
      key,
      url: `${origen}/archivo?key=${encodeURIComponent(key)}`,
      urlCorta: `${origen}/a/${encodeURIComponent(shortId)}`,
      shortId,
      tipo: archivo.type || "",
      tipoGeneral: tipoGeneral(archivo.type || ""),
      tamanioBytes: archivo.size,
      venceEn: vence.toISOString()
    });
  }

  const galeriaId = `solicitud-${telefonoCliente}-${Date.now().toString(36)}-${crypto.randomUUID().slice(0, 8)}`;
  const galeriaUrl = `${origen}/g/${encodeURIComponent(galeriaId)}`;

await env.ARCHIVOS.put(`galerias/${galeriaId}.json`, JSON.stringify({
  galeriaId,
  tituloGaleria,
  descripcionGaleria,
  telefonoCliente,
  creadoEn: ahora.toISOString(),
  venceEn: vence.toISOString(),
  archivos: subidos
}), {
    httpMetadata: {
      contentType: "application/json; charset=utf-8"
    }
  });

  return respuestaJson({
    ok: true,
    archivos: subidos,
    galeriaId,
    galeriaUrl,
    retencionMeses: 6,
    vencenEn: vence.toISOString()
  }, 200, request);
}

async function obtenerArchivoCorto(request, env) {
  const url = new URL(request.url);
  const shortId = decodeURIComponent(url.pathname.replace("/a/", "")).trim();

  if (!shortId) {
    return new Response("Falta archivo", {
      status: 400,
      headers: corsHeaders(request)
    });
  }

  const meta = await env.ARCHIVOS.get(`links/${shortId}.json`);

  if (!meta) {
    return new Response("Link no encontrado", {
      status: 404,
      headers: corsHeaders(request)
    });
  }

  let data = null;

  try {
    data = JSON.parse(await meta.text());
  } catch (error) {
    return new Response("Link inválido", {
      status: 500,
      headers: corsHeaders(request)
    });
  }

  const objeto = await env.ARCHIVOS.get(data.key);

  if (!objeto) {
    return new Response("Archivo no encontrado", {
      status: 404,
      headers: corsHeaders(request)
    });
  }

  return new Response(objeto.body, {
    headers: {
      ...corsHeaders(request),
      "Content-Type": objeto.httpMetadata?.contentType || data.tipo || "application/octet-stream",
      "Cache-Control": "private, max-age=3600"
    }
  });
}

async function obtenerArchivo(request, env) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return new Response("Falta key", {
      status: 400,
      headers: corsHeaders(request)
    });
  }

  const objeto = await env.ARCHIVOS.get(key);

  if (!objeto) {
    return new Response("Archivo no encontrado", {
      status: 404,
      headers: corsHeaders(request)
    });
  }

  return new Response(objeto.body, {
    headers: {
      ...corsHeaders(request),
      "Content-Type": objeto.httpMetadata?.contentType || "application/octet-stream",
      "Cache-Control": "private, max-age=3600"
    }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders(request)
      });
    }

    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/upload") {
      return subirArchivos(request, env);
    }

    if (request.method === "GET" && url.pathname === "/archivo") {
      return obtenerArchivo(request, env);
    }

    if (request.method === "GET" && url.pathname.startsWith("/a/")) {
  return obtenerArchivoCorto(request, env);
}

    if (request.method === "GET" && url.pathname.startsWith("/g/")) {
  return obtenerGaleriaArchivos(request, env);
}
    

    return respuestaJson({
      ok: true,
      mensaje: "Worker Multi24 activo."
    }, 200, request);
  }
};
