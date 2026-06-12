/* =========================================================
   MULTI24 - APP V2
   Google Login + Roles + Solicitudes + Admin
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================================================
   FIREBASE CONFIG
========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyAMgWRboQ7HBbYMxjIr4sAl7UOjzrMCOyI",
  authDomain: "multiservice24-77177.firebaseapp.com",
  databaseURL: "https://multiservice24-77177-default-rtdb.firebaseio.com",
  projectId: "multiservice24-77177",
  storageBucket: "multiservice24-77177.firebasestorage.app",
  messagingSenderId: "806441507316",
  appId: "1:806441507316:web:4226d76f6a71933cd081a1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const providerGoogle = new GoogleAuthProvider();
providerGoogle.setCustomParameters({
  prompt: "select_account"
});

/* =========================================================
   CONFIG
========================================================= */

const WHATSAPP_NUMERO = "5491130042287";

const WORKER_UPLOAD_URL = "https://multi24-upload.multi24pro.workers.dev/upload";

const MAX_ARCHIVOS_SOLICITUD = 6;
const MAX_MB_ARCHIVO_SOLICITUD = 30;
const MAX_BYTES_ARCHIVO_SOLICITUD = MAX_MB_ARCHIVO_SOLICITUD * 1024 * 1024;

const ADMIN_EMAILS = [
  "multi24pro@gmail.com"
];

const ROLES = [
  "usuario",
  "prestador",
  "colaborador",
  "admin"
];

const SERVICIOS = [
  { nombre: "Cerrajería", icono: "fa-solid fa-key" },
  { nombre: "Electricidad", icono: "fa-solid fa-bolt" },
  { nombre: "Plomería", icono: "fa-solid fa-faucet-drip" },
  { nombre: "Destapaciones", icono: "fa-solid fa-toilet" },
  { nombre: "Gas", icono: "fa-solid fa-fire-flame-curved" },
  { nombre: "Seguridad", icono: "fa-solid fa-shield-halved" },
  { nombre: "Fumigación", icono: "fa-solid fa-bug" },
  { nombre: "Aire acondicionado", icono: "fa-solid fa-snowflake" },
  { nombre: "Albañilería", icono: "fa-solid fa-trowel-bricks" },
  { nombre: "Pintura", icono: "fa-solid fa-paint-roller" },
  { nombre: "Colocación de cerámicas", icono: "fa-solid fa-border-all" },
  { nombre: "Corte de pasto", icono: "fa-solid fa-seedling" },
  { nombre: "Maestranza", icono: "fa-solid fa-broom" },
  { nombre: "Envíos", icono: "fa-solid fa-truck-fast" }
];

/* =========================================================
   SELECTORES
========================================================= */

const $ = (id) => document.getElementById(id);

const btnMenuMobile = $("btnMenuMobile");
const msNav = $("msNav");
const linkPanelInterno = $("linkPanelInterno");
const linkMiEspacio = $("linkMiEspacio");

const btnCuenta = $("btnCuenta");
const btnLoginDesdePanel = $("btnLoginDesdePanel");
const btnLoginGoogle = $("btnLoginGoogle");
const btnCerrarSesion = $("btnCerrarSesion");

const modalCuenta = $("modalCuenta");
const modalContacto = $("modalContacto");
const modalSolicitud = $("modalSolicitud");
const modalPrestador = $("modalPrestador");

const cuentaNombre = $("cuentaNombre");
const cuentaEmail = $("cuentaEmail");
const cuentaRol = $("cuentaRol");

const btnAbrirContacto = $("btnAbrirContacto");
const btnAbrirSolicitud = $("btnAbrirSolicitud");
const btnLlamadaRapida = $("btnLlamadaRapida");
const btnCompartirApp = $("btnCompartirApp");
const btnInstalarApp = $("btnInstalarApp");
const btnPanelNuevaSolicitud = $("btnPanelNuevaSolicitud");
const btnInscripcionPrestador = $("btnInscripcionPrestador");

const serviciosGrid = $("serviciosGrid");
const solServicio = $("solServicio");
const solEmergencia = $("solEmergencia");
const emergenciaNota = $("emergenciaNota");

const prestadorHabilidades = $("prestadorHabilidades");

const formContactoRapido = $("formContactoRapido");
const formSolicitudServicio = $("formSolicitudServicio");
const formPrestador = $("formPrestador");

const boxSinLogin = $("boxSinLogin");
const panelUsuario = $("panelUsuario");
const panelPrestador = $("panelPrestador");
const panelEquipo = $("panelEquipo");

const txtUsuarioActual = $("txtUsuarioActual");
const listaMisSolicitudes = $("listaMisSolicitudes");
const listaSolicitudesEquipo = $("listaSolicitudesEquipo");
const listaAvisosEquipo = $("listaAvisosEquipo");
const listaSolicitudesPrestador = $("listaSolicitudesPrestador");
const listaUsuariosRoles = $("listaUsuariosRoles");
const listaPrestadoresAdmin = $("listaPrestadoresAdmin");

const estadoPrestador = $("estadoPrestador");
const contadorAvisos = $("contadorAvisos");

const btnWhatsappFlotante = $("btnWhatsappFlotante");
const btnSubirArriba = $("btnSubirArriba");
const toast = $("toast");

const vistaInicio = $("inicio");
const vistaComoFunciona = $("comoFunciona");
const vistaPaneles = $("paneles");
const bloqueContactoBetween = document.querySelector(".ms-contact-between");

/* =========================================================
   ESTADO
========================================================= */

let usuarioActual = null;
let perfilActual = null;
let prestadorActual = null;
let vistaActual = "inicio";

/* =========================================================
   HELPERS
========================================================= */

function limpiar(valor) {
  return String(valor || "").trim();
}

function emailLower(email) {
  return String(email || "").trim().toLowerCase();
}

function esEmailAdmin(email) {
  return ADMIN_EMAILS.map(emailLower).includes(emailLower(email));
}

function esAdminActual() {
  return perfilActual?.rol === "admin" || esEmailAdmin(usuarioActual?.email);
}

function puedeVerPanelEquipo() {
  const rol = perfilActual?.rol || "usuario";
  return rol === "admin" || rol === "colaborador";
}

function fechaTexto(valor) {
  try {
    if (!valor) return "Sin fecha";

    const fecha = valor.toDate ? valor.toDate() : new Date(valor);

    return fecha.toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return "Sin fecha";
  }
}

function normalizarTelefono(telefono) {
  return limpiar(telefono).replace(/[^\d]/g, "");
}

function toastMsg(texto) {
  if (!toast) return;

  toast.textContent = texto;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 2800);
}

function abrirModal(modal) {
  if (!modal) return;
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function cerrarModal(modal) {
  if (!modal) return;
  modal.classList.add("hidden");

  const hayAbierto = document.querySelector(".ms-modal:not(.hidden)");
  if (!hayAbierto) {
    document.body.classList.remove("modal-open");
  }
}

function cerrarTodosLosModales() {
  document.querySelectorAll(".ms-modal").forEach(modal => {
    modal.classList.add("hidden");
  });

  document.body.classList.remove("modal-open");
}

function abrirWhatsAppConMensaje(mensaje, ventanaPrevia = null) {
  const texto = encodeURIComponent(mensaje);
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;

  if (ventanaPrevia && !ventanaPrevia.closed) {
    ventanaPrevia.location.href = url;
    return;
  }

  window.open(url, "_blank");
}

async function subirArchivosSolicitud(archivosSeleccionados) {
  if (!archivosSeleccionados.length) {
    return {
      archivos: [],
      vencenEn: ""
    };
  }

  const formData = new FormData();

  archivosSeleccionados.forEach((archivo) => {
    formData.append("files", archivo);
  });

  const respuesta = await fetch(WORKER_UPLOAD_URL, {
    method: "POST",
    body: formData
  });

  let data = null;

  try {
    data = await respuesta.json();
  } catch (error) {
    throw new Error("El servidor de archivos no respondió correctamente.");
  }

  if (!respuesta.ok || !data?.ok) {
    throw new Error(data?.error || "No se pudieron subir los archivos.");
  }

  return {
    archivos: Array.isArray(data.archivos) ? data.archivos : [],
    vencenEn: data.vencenEn || ""
  };
}

function escaparHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function estadoBonito(estado) {
  const mapa = {
    nuevo: "Nuevo",
    contacto_rapido: "Contacto rápido",
    pendiente_derivar: "Pendiente de derivar",
    contactado: "Contactado",
    derivado: "Derivado",
    cotizando: "Cotizando",
    programado: "Programado",
    realizado: "Realizado",
    cerrado: "Cerrado",
    garantia: "Garantía",
    pendiente_entrevista: "Pendiente entrevista",
    habilitado: "Habilitado",
    rechazado: "Rechazado"
  };

  return mapa[estado] || estado || "Nuevo";
}

function mensajeWhatsAppContacto(data, id = "") {
  const partes = [];

  partes.push("*MULTI24 - Solicitud de contacto*");
  partes.push("");
  partes.push("Hola, quiero que me contacten.");
  partes.push("");
  partes.push(`*Nombre:* ${data.clienteNombre || "Sin nombre"}`);
  partes.push(`*WhatsApp:* ${data.clienteTelefono || "Sin teléfono"}`);

  if (data.zona) {
    partes.push(`*Zona:* ${data.zona}`);
  }

  if (data.descripcion) {
    partes.push("");
    partes.push(`*Mensaje:* ${data.descripcion}`);
  }

  partes.push("");
  partes.push("Gracias.");

  return partes.join("\n");
}

function mensajeWhatsAppSolicitud(data, id = "") {
  const partes = [];

  partes.push("*MULTI24 - Solicitud de servicio*");
  partes.push("");
  partes.push("Hola, quiero solicitar un servicio.");
  partes.push("");
  partes.push(`*Nombre:* ${data.clienteNombre || "Sin nombre"}`);
  partes.push(`*WhatsApp:* ${data.clienteTelefono || "Sin teléfono"}`);
  partes.push(`*Servicio:* ${data.servicio || "Sin servicio"}`);

  if (data.emergencia) {
    partes.push("");
    partes.push("*Emergencia:* Sí");
    partes.push("Las emergencias se resuelven dentro de las próximas 4 horas a la confirmación de la solicitud y se confirman con un pago de $20000 argentinos o 15 dólares.");
  }

  if (data.zona) {
    partes.push(`*Zona:* ${data.zona}`);
  }

  if (data.direccion) {
    partes.push(`*Dirección:* ${data.direccion}`);
  }

  if (data.fechaDeseada) {
    partes.push(`*Fecha deseada:* ${data.fechaDeseada}`);
  }

  if (data.horarioDeseado) {
    partes.push(`*Horario deseado:* ${data.horarioDeseado}`);
  }

if (data.descripcion) {
  partes.push("");
  partes.push(`*Detalle del trabajo:*`);
  partes.push(data.descripcion);
}

if (Array.isArray(data.archivos) && data.archivos.length) {
  partes.push("");
  partes.push(`*Archivos cargados:*`);

  data.archivos.forEach((archivo, index) => {
    const nombre = archivo.nombre || "Archivo";
    const tipo = archivo.tipoGeneral || "Archivo";
    const url = archivo.url ? ` - ${archivo.url}` : "";

    partes.push(`${index + 1}. ${nombre} (${tipo})${url}`);
  });

  partes.push("");
  partes.push("Los archivos quedan disponibles por 6 meses.");
}

partes.push("");
partes.push("Gracias.");

  return partes.join("\n");
}

/* =========================================================
   RENDER SERVICIOS
========================================================= */

function renderServicios() {
  if (!serviciosGrid) return;

  serviciosGrid.innerHTML = SERVICIOS.map(servicio => {
    return `
      <article class="ms-service-card" data-servicio-card="${servicio.nombre}">
        <div class="ms-service-icon">
          <i class="${servicio.icono}"></i>
        </div>
        <h3>${servicio.nombre}</h3>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-servicio-card]").forEach(card => {
    card.addEventListener("click", () => {
      const servicio = card.dataset.servicioCard || "";

      if (solServicio) {
        solServicio.value = servicio;
      }

      abrirModal(modalSolicitud);
    });
  });
}

function renderSelectServicios() {
  if (solServicio) {
    solServicio.innerHTML = `
      <option value="">Elegir servicio</option>
      ${SERVICIOS.map(s => `<option value="${s.nombre}">${s.nombre}</option>`).join("")}
    `;
  }

  if (prestadorHabilidades) {
    prestadorHabilidades.innerHTML = SERVICIOS.map(s => {
      return `
        <label class="ms-check-option">
          <input type="checkbox" value="${s.nombre}" />
          <span>${s.nombre}</span>
        </label>
      `;
    }).join("");
  }
}

function actualizarNotaEmergencia() {
  if (!solEmergencia || !emergenciaNota) return;

  emergenciaNota.classList.toggle("hidden", !solEmergencia.checked);
}

/* =========================================================
   FIRESTORE USUARIOS
========================================================= */

async function obtenerOCrearPerfil(user) {
  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);

  const debeSerAdmin = esEmailAdmin(user.email);

  if (!snap.exists()) {
    const nuevoPerfil = {
      uid: user.uid,
      nombre: user.displayName || "",
      email: user.email || "",
      foto: user.photoURL || "",
      rol: debeSerAdmin ? "admin" : "usuario",
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    };

    await setDoc(ref, nuevoPerfil, { merge: true });
    return nuevoPerfil;
  }

  const perfil = snap.data();

  if (debeSerAdmin && perfil.rol !== "admin") {
    await setDoc(ref, {
      rol: "admin",
      actualizadoEn: serverTimestamp()
    }, { merge: true });

    perfil.rol = "admin";
  }

  return {
    uid: user.uid,
    nombre: perfil.nombre || user.displayName || "",
    email: perfil.email || user.email || "",
    foto: perfil.foto || user.photoURL || "",
    rol: perfil.rol || "usuario",
    creadoEn: perfil.creadoEn || null,
    actualizadoEn: perfil.actualizadoEn || null
  };
}

async function obtenerPrestador(uid) {
  if (!uid) return null;

  const ref = doc(db, "prestadores", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data()
  };
}

/* =========================================================
   AUTH
========================================================= */

async function loginGoogle() {
  try {
    await signInWithPopup(auth, providerGoogle);
    cerrarTodosLosModales();
    toastMsg("Sesión iniciada");
  } catch (error) {
    console.error(error);
    toastMsg("No se pudo iniciar sesión con Google");
  }
}

async function cerrarSesionActual() {
  try {
    await signOut(auth);
    cerrarTodosLosModales();
    toastMsg("Sesión cerrada");
  } catch (error) {
    console.error(error);
    toastMsg("No se pudo cerrar sesión");
  }
}

/* =========================================================
   AVISOS INTERNOS
========================================================= */

async function crearAvisoInterno(data) {
  try {
    await addDoc(collection(db, "notificaciones"), {
      tipo: data.tipoAviso || "nueva_solicitud",
      titulo: data.titulo || "Nueva solicitud",
      mensaje: data.mensaje || "",
      solicitudId: data.solicitudId || "",
      rolesDestino: ["admin", "colaborador"],
      visto: false,
      creadoEn: serverTimestamp()
    });
  } catch (error) {
    console.warn("No se pudo crear aviso interno, pero no se cancela la solicitud:", error);
  }
}

/* =========================================================
   GUARDAR CONTACTO / SOLICITUD
========================================================= */

async function guardarContactoRapido(data) {
  const ref = await addDoc(collection(db, "solicitudes"), {
    tipo: "contacto_rapido",
    clienteUid: usuarioActual?.uid || null,
    clienteEmail: usuarioActual?.email || "",
    clienteNombre: data.nombre,
    clienteTelefono: data.telefono,
    zona: data.zona,
    direccion: "",
    servicio: "Contacto rápido",
    emergencia: false,
    descripcion: data.mensaje || "Quiero que me contacten.",
    estado: "nuevo",
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });

  await crearAvisoInterno({
    tipoAviso: "contacto_rapido",
    titulo: "Nuevo contacto rápido",
    mensaje: `${data.nombre} pidió que lo contacten.`,
    solicitudId: ref.id
  });

  return ref.id;
}

async function guardarSolicitudServicio(data) {
  const ref = await addDoc(collection(db, "solicitudes"), {
    tipo: "solicitud_servicio",
    clienteUid: usuarioActual?.uid || null,
    clienteEmail: usuarioActual?.email || "",
    clienteNombre: data.nombre,
    clienteTelefono: data.telefono,
    servicio: data.servicio,
    emergencia: data.emergencia,
    zona: data.zona,
    direccion: data.direccion,
    fechaDeseada: data.fechaDeseada,
    horarioDeseado: data.horarioDeseado,
descripcion: data.descripcion,
archivos: data.archivos || [],
archivosCantidad: Array.isArray(data.archivos) ? data.archivos.length : 0,
archivosRetencionMeses: 6,
archivosVencenEn: data.archivosVencenEn || "",
estado: "pendiente_derivar",
    prestadorAsignadoUid: "",
    colaboradorAsignadoUid: "",
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });

  await crearAvisoInterno({
    tipoAviso: "nueva_solicitud",
    titulo: "Nueva solicitud de servicio",
    mensaje: `${data.nombre} solicitó ${data.servicio}.`,
    solicitudId: ref.id
  });

  return ref.id;
}

/* =========================================================
   PRESTADOR
========================================================= */

async function guardarInscripcionPrestador(data) {
  if (!usuarioActual) {
    toastMsg("Primero tenés que ingresar con Google");
    abrirModal(modalCuenta);
    return;
  }

  await setDoc(doc(db, "prestadores", usuarioActual.uid), {
    uid: usuarioActual.uid,
    email: usuarioActual.email || "",
    nombre: data.nombre,
    telefono: data.telefono,
zona: data.zona,
movilidadHerramientas: !!data.movilidadHerramientas,
habilidades: data.habilidades,
comentario: data.comentario,
    habilitado: false,
    entrevistaEstado: "pendiente_entrevista",
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  }, { merge: true });

  await setDoc(doc(db, "usuarios", usuarioActual.uid), {
    rol: "prestador",
    actualizadoEn: serverTimestamp()
  }, { merge: true });

  await crearAvisoInterno({
    tipoAviso: "nuevo_prestador",
    titulo: "Nuevo prestador inscripto",
    mensaje: `${data.nombre} se inscribió como prestador.`,
    solicitudId: ""
  });

  perfilActual = await obtenerOCrearPerfil(usuarioActual);
  prestadorActual = await obtenerPrestador(usuarioActual.uid);

  cerrarModal(modalPrestador);
  toastMsg("Inscripción enviada. Queda pendiente de entrevista.");
  await renderPaneles();
}

async function postularmeASolicitud(solicitud) {
  if (!usuarioActual || !prestadorActual) {
    toastMsg("Tenés que estar inscripto como prestador");
    return;
  }

  if (!prestadorActual.habilitado) {
    toastMsg("Todavía no estás habilitado para postularte");
    return;
  }

  await addDoc(collection(db, "postulaciones"), {
    solicitudId: solicitud.id,
    servicio: solicitud.servicio,
    prestadorUid: usuarioActual.uid,
    prestadorEmail: usuarioActual.email || "",
    prestadorNombre: prestadorActual.nombre || usuarioActual.displayName || "",
    estado: "postulado",
    mensaje: "Prestador disponible para cotizar.",
    cotizacion: null,
    creadoEn: serverTimestamp()
  });

  await crearAvisoInterno({
    tipoAviso: "nueva_postulacion",
    titulo: "Nueva postulación de prestador",
    mensaje: `${prestadorActual.nombre || "Un prestador"} se postuló para ${solicitud.servicio}.`,
    solicitudId: solicitud.id
  });

  toastMsg("Postulación enviada");
  await renderPaneles();
}

/* =========================================================
   CARGAR DATOS
========================================================= */

async function obtenerTodasLasSolicitudes() {
  const snap = await getDocs(collection(db, "solicitudes"));

  const items = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  items.sort((a, b) => {
    const fa = a.creadoEn?.toMillis ? a.creadoEn.toMillis() : 0;
    const fb = b.creadoEn?.toMillis ? b.creadoEn.toMillis() : 0;
    return fb - fa;
  });

  return items;
}

async function obtenerMisSolicitudes() {
  if (!usuarioActual) return [];

  const todas = await obtenerTodasLasSolicitudes();

  return todas.filter(s => {
    return s.clienteUid === usuarioActual.uid
      || emailLower(s.clienteEmail) === emailLower(usuarioActual.email);
  });
}

async function obtenerAvisosEquipo() {
  const snap = await getDocs(collection(db, "notificaciones"));

  const items = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  items.sort((a, b) => {
    const fa = a.creadoEn?.toMillis ? a.creadoEn.toMillis() : 0;
    const fb = b.creadoEn?.toMillis ? b.creadoEn.toMillis() : 0;
    return fb - fa;
  });

  return items;
}

async function obtenerUsuarios() {
  const snap = await getDocs(collection(db, "usuarios"));

  const items = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  items.sort((a, b) => {
    return emailLower(a.email).localeCompare(emailLower(b.email));
  });

  return items;
}

async function obtenerPrestadoresTodos() {
  const snap = await getDocs(collection(db, "prestadores"));

  const items = snap.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));

  items.sort((a, b) => {
    return limpiar(a.nombre).localeCompare(limpiar(b.nombre));
  });

  return items;
}

/* =========================================================
   RENDER ITEMS
========================================================= */

function renderArchivosSolicitud(s) {
  if (!Array.isArray(s.archivos) || !s.archivos.length) {
    return "";
  }

  return `
    <div class="ms-solicitud-archivos">
      <p><strong>Archivos:</strong></p>

      <div class="ms-file-links">
        ${s.archivos.map((archivo, index) => {
          const nombre = escaparHtml(archivo.nombre || `Archivo ${index + 1}`);
          const tipo = escaparHtml(archivo.tipoGeneral || "Archivo");
          const url = archivo.url || "";

          if (!url) {
            return `
              <span class="ms-file-link">
                ${index + 1}. ${nombre} (${tipo})
              </span>
            `;
          }

          return `
            <a class="ms-file-link" href="${escaparHtml(url)}" target="_blank" rel="noopener">
              <i class="fa-solid fa-paperclip"></i>
              ${index + 1}. ${nombre} (${tipo})
            </a>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

function renderSolicitudItem(s, modo = "usuario") {
  const fecha = fechaTexto(s.creadoEn);
  const emergencia = s.emergencia ? `<span class="ms-status red">Emergencia</span>` : "";

  return `
    <article class="ms-item" data-solicitud-id="${s.id}">
      <h4>${escaparHtml(s.servicio || "Solicitud")}</h4>

      <p><strong>Cliente:</strong> ${escaparHtml(s.clienteNombre || "Sin nombre")}</p>
      <p><strong>WhatsApp:</strong> ${escaparHtml(s.clienteTelefono || "Sin teléfono")}</p>
      <p><strong>Zona:</strong> ${escaparHtml(s.zona || "Sin zona")}</p>
      <p><strong>Dirección:</strong> ${escaparHtml(s.direccion || "Sin dirección")}</p>
<p><strong>Detalle:</strong> ${escaparHtml(s.descripcion || "Sin detalle")}</p>
${renderArchivosSolicitud(s)}
<p><strong>Fecha:</strong> ${fecha}</p>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
        <span class="ms-status">${estadoBonito(s.estado)}</span>
        ${emergencia}
      </div>

      <div class="ms-item-actions">
        <button class="ms-mini-btn red" data-wa-solicitud="${s.id}" type="button">
          <i class="fa-brands fa-whatsapp"></i>
          WhatsApp
        </button>

        ${
          modo === "equipo"
            ? `
              <button class="ms-mini-btn" data-estado-solicitud="${s.id}" data-estado="contactado" type="button">
                Contactado
              </button>
              <button class="ms-mini-btn" data-estado-solicitud="${s.id}" data-estado="programado" type="button">
                Programado
              </button>
              <button class="ms-mini-btn" data-estado-solicitud="${s.id}" data-estado="cerrado" type="button">
                Cerrado
              </button>
            `
            : ""
        }

        ${
          modo === "prestador"
            ? `
              <button class="ms-mini-btn red" data-postular="${s.id}" type="button">
                <i class="fa-solid fa-hand"></i>
                Postularme a cotizar
              </button>
            `
            : ""
        }
      </div>
    </article>
  `;
}

function renderAvisoItem(a) {
  return `
    <article class="ms-item">
      <h4>${escaparHtml(a.titulo || "Aviso")}</h4>
      <p>${escaparHtml(a.mensaje || "")}</p>
      <p><strong>Fecha:</strong> ${fechaTexto(a.creadoEn)}</p>
      <span class="ms-status ${a.visto ? "" : "red"}">
        ${a.visto ? "Visto" : "Nuevo"}
      </span>
    </article>
  `;
}

function renderUsuarioRolItem(u) {
  const rolActual = u.rol || "usuario";

  return `
    <article class="ms-item">
      <h4>${escaparHtml(u.nombre || "Sin nombre")}</h4>
      <p><strong>Email:</strong> ${escaparHtml(u.email || "Sin email")}</p>
      <p><strong>Rol actual:</strong> <span class="ms-status">${escaparHtml(rolActual)}</span></p>

      <div class="ms-role-actions">
        ${ROLES.map(rol => `
          <button
            class="ms-mini-btn ${rol === rolActual ? "red" : ""}"
            data-cambiar-rol="${u.id}"
            data-rol="${rol}"
            type="button"
          >
            ${rol}
          </button>
        `).join("")}
      </div>
    </article>
  `;
}

function renderPrestadorAdminItem(p) {
  const habilitado = !!p.habilitado;

  return `
    <article class="ms-item">
      <h4>${escaparHtml(p.nombre || "Prestador")}</h4>
      <p><strong>Email:</strong> ${escaparHtml(p.email || "Sin email")}</p>
      <p><strong>WhatsApp:</strong> ${escaparHtml(p.telefono || "Sin teléfono")}</p>
<p><strong>Zona:</strong> ${escaparHtml(p.zona || "Sin zona")}</p>
<p><strong>Movilidad y herramientas propias:</strong> ${p.movilidadHerramientas ? "Sí" : "No declarado"}</p>
      <p><strong>Habilidades:</strong> ${Array.isArray(p.habilidades) ? p.habilidades.map(escaparHtml).join(", ") : "Sin habilidades"}</p>
      <p><strong>Comentario:</strong> ${escaparHtml(p.comentario || "Sin comentario")}</p>

      <span class="ms-status ${habilitado ? "" : "red"}">
        ${habilitado ? "Habilitado" : "Pendiente"}
      </span>

      <div class="ms-item-actions">
        <button class="ms-mini-btn red" data-habilitar-prestador="${p.id}" type="button">
          Habilitar
        </button>

        <button class="ms-mini-btn" data-deshabilitar-prestador="${p.id}" type="button">
          Deshabilitar
        </button>
      </div>
    </article>
  `;
}

/* =========================================================
   RENDER PANELES
========================================================= */

async function renderMisSolicitudes() {
  if (!listaMisSolicitudes) return;

  const items = await obtenerMisSolicitudes();

  if (!items.length) {
    listaMisSolicitudes.innerHTML = `
      <article class="ms-item">
        <p>Todavía no cargaste solicitudes.</p>
      </article>
    `;
    return;
  }

  listaMisSolicitudes.innerHTML = items.map(s => renderSolicitudItem(s, "usuario")).join("");
  activarBotonesDeSolicitudes(items);
}

async function renderEquipo() {
  if (!puedeVerPanelEquipo()) return;

  const solicitudes = await obtenerTodasLasSolicitudes();
  const avisos = await obtenerAvisosEquipo();

  if (listaSolicitudesEquipo) {
    listaSolicitudesEquipo.innerHTML = solicitudes.length
      ? solicitudes.map(s => renderSolicitudItem(s, "equipo")).join("")
      : `<article class="ms-item"><p>No hay solicitudes todavía.</p></article>`;
  }

  if (listaAvisosEquipo) {
    listaAvisosEquipo.innerHTML = avisos.length
      ? avisos.slice(0, 20).map(renderAvisoItem).join("")
      : `<article class="ms-item"><p>No hay avisos todavía.</p></article>`;
  }

  if (contadorAvisos) {
    const nuevos = avisos.filter(a => !a.visto).length;
    contadorAvisos.textContent = `${nuevos} avisos`;
  }

  activarBotonesDeSolicitudes(solicitudes);

  if (esAdminActual()) {
    await renderUsuariosRoles();
    await renderPrestadoresAdmin();
  }
}

async function renderUsuariosRoles() {
  if (!listaUsuariosRoles) return;

  try {
    const usuarios = await obtenerUsuarios();

    if (!usuarios.length) {
      listaUsuariosRoles.innerHTML = `
        <article class="ms-item">
          <p>Todavía no hay usuarios registrados.</p>
        </article>
      `;
      return;
    }

    listaUsuariosRoles.innerHTML = usuarios.map(renderUsuarioRolItem).join("");

    document.querySelectorAll("[data-cambiar-rol]").forEach(btn => {
      btn.onclick = async () => {
        const uid = btn.dataset.cambiarRol;
        const rol = btn.dataset.rol;

        try {
          await setDoc(doc(db, "usuarios", uid), {
            rol,
            actualizadoEn: serverTimestamp()
          }, { merge: true });

          toastMsg(`Rol actualizado: ${rol}`);

          if (usuarioActual?.uid === uid) {
            perfilActual = await obtenerOCrearPerfil(usuarioActual);
          }

          await renderPaneles();
        } catch (error) {
          console.error(error);
          toastMsg("No se pudo actualizar el rol");
        }
      };
    });
  } catch (error) {
    console.error(error);
    listaUsuariosRoles.innerHTML = `
      <article class="ms-item">
        <p>No se pudieron cargar los usuarios.</p>
      </article>
    `;
  }
}

async function renderPrestadoresAdmin() {
  if (!listaPrestadoresAdmin) return;

  try {
    const prestadores = await obtenerPrestadoresTodos();

    if (!prestadores.length) {
      listaPrestadoresAdmin.innerHTML = `
        <article class="ms-item">
          <p>Todavía no hay prestadores inscriptos.</p>
        </article>
      `;
      return;
    }

    listaPrestadoresAdmin.innerHTML = prestadores.map(renderPrestadorAdminItem).join("");

    document.querySelectorAll("[data-habilitar-prestador]").forEach(btn => {
      btn.onclick = async () => {
        const uid = btn.dataset.habilitarPrestador;

        try {
          await setDoc(doc(db, "prestadores", uid), {
            habilitado: true,
            entrevistaEstado: "habilitado",
            actualizadoEn: serverTimestamp()
          }, { merge: true });

          await setDoc(doc(db, "usuarios", uid), {
            rol: "prestador",
            actualizadoEn: serverTimestamp()
          }, { merge: true });

          toastMsg("Prestador habilitado");
          await renderPaneles();
        } catch (error) {
          console.error(error);
          toastMsg("No se pudo habilitar");
        }
      };
    });

    document.querySelectorAll("[data-deshabilitar-prestador]").forEach(btn => {
      btn.onclick = async () => {
        const uid = btn.dataset.deshabilitarPrestador;

        try {
          await setDoc(doc(db, "prestadores", uid), {
            habilitado: false,
            entrevistaEstado: "pendiente_entrevista",
            actualizadoEn: serverTimestamp()
          }, { merge: true });

          toastMsg("Prestador deshabilitado");
          await renderPaneles();
        } catch (error) {
          console.error(error);
          toastMsg("No se pudo deshabilitar");
        }
      };
    });
  } catch (error) {
    console.error(error);
    listaPrestadoresAdmin.innerHTML = `
      <article class="ms-item">
        <p>No se pudieron cargar los prestadores.</p>
      </article>
    `;
  }
}

async function renderPrestador() {
  if (!panelPrestador || !listaSolicitudesPrestador) return;

  if (!prestadorActual) {
    panelPrestador.classList.add("hidden");
    return;
  }

  panelPrestador.classList.remove("hidden");

  if (!prestadorActual.habilitado) {
    listaSolicitudesPrestador.innerHTML = `
      <article class="ms-item">
        <h4>Inscripción pendiente</h4>
        <p>Tu inscripción fue recibida. Falta entrevista y habilitación del admin.</p>
        <span class="ms-status red">${estadoBonito(prestadorActual.entrevistaEstado)}</span>
      </article>
    `;
    return;
  }

  const todas = await obtenerTodasLasSolicitudes();
  const habilidades = Array.isArray(prestadorActual.habilidades) ? prestadorActual.habilidades : [];

  const disponibles = todas.filter(s => {
    const estadoOk = s.estado === "pendiente_derivar" || s.estado === "nuevo";
    const habilidadOk = habilidades.includes(s.servicio);
    return estadoOk && habilidadOk;
  });

  if (!disponibles.length) {
    listaSolicitudesPrestador.innerHTML = `
      <article class="ms-item">
        <p>No hay solicitudes disponibles para tus habilidades en este momento.</p>
      </article>
    `;
    return;
  }

  listaSolicitudesPrestador.innerHTML = disponibles.map(s => renderSolicitudItem(s, "prestador")).join("");
  activarBotonesDeSolicitudes(disponibles);
}

function renderEstadoPrestador() {
  if (!estadoPrestador) return;

  if (!prestadorActual) {
    estadoPrestador.innerHTML = "";
    return;
  }

  if (prestadorActual.habilitado) {
    estadoPrestador.innerHTML = `
      <div class="ms-item">
        <h4>Prestador habilitado</h4>
        <p>Ya podés ver solicitudes disponibles según tus habilidades.</p>
        <span class="ms-status">Habilitado</span>
      </div>
    `;
    return;
  }

  estadoPrestador.innerHTML = `
    <div class="ms-item">
      <h4>Inscripción recibida</h4>
      <p>Estado: pendiente de entrevista y aprobación.</p>
      <span class="ms-status red">Pendiente</span>
    </div>
  `;
}

async function renderPaneles() {
  const logueado = !!usuarioActual;
  const esVistaPanelInterno = vistaActual === "panelInterno";
  const puedeVerInterno = puedeVerPanelEquipo();

  if (linkPanelInterno) {
    linkPanelInterno.classList.toggle("hidden", !puedeVerInterno);
  }

   if (linkMiEspacio) {
  linkMiEspacio.classList.toggle("hidden", puedeVerInterno);
}

if (logueado && puedeVerInterno && vistaActual === "paneles") {
  vistaActual = "panelInterno";

  if (window.location.hash !== "#panelInterno") {
    window.location.hash = "panelInterno";
    return;
  }
}

  if (boxSinLogin) {
    boxSinLogin.classList.toggle("hidden", logueado || esVistaPanelInterno);
  }

  if (panelUsuario) {
    panelUsuario.classList.toggle("hidden", !logueado || esVistaPanelInterno);
  }

  if (!logueado) {
    if (panelPrestador) panelPrestador.classList.add("hidden");
    if (panelEquipo) panelEquipo.classList.add("hidden");

    if (esVistaPanelInterno) {
      toastMsg("Primero ingresá con Google");
      vistaActual = "paneles";

      if (window.location.hash !== "#paneles") {
        window.location.hash = "paneles";
      }
    }

    return;
  }

  if (txtUsuarioActual) {
    txtUsuarioActual.textContent = `${perfilActual?.nombre || usuarioActual.displayName || "Usuario"} · ${perfilActual?.rol || "usuario"}`;
  }

  renderEstadoPrestador();

  if (esVistaPanelInterno) {
    if (!puedeVerInterno) {
      if (panelEquipo) panelEquipo.classList.add("hidden");
      if (panelUsuario) panelUsuario.classList.remove("hidden");

      toastMsg("No tenés permiso para ver el panel interno");

      vistaActual = "paneles";

      if (window.location.hash !== "#paneles") {
        window.location.hash = "paneles";
      }

      return;
    }

    if (panelUsuario) panelUsuario.classList.add("hidden");
    if (panelPrestador) panelPrestador.classList.add("hidden");
    if (panelEquipo) panelEquipo.classList.remove("hidden");

    await renderEquipo();
    return;
  }

  if (panelEquipo) {
    panelEquipo.classList.add("hidden");
  }

  await renderMisSolicitudes();
  await renderPrestador();
}

/* =========================================================
   BOTONES DE SOLICITUDES
========================================================= */

function activarBotonesDeSolicitudes(solicitudes) {
  const mapa = new Map();
  solicitudes.forEach(s => mapa.set(s.id, s));

  document.querySelectorAll("[data-wa-solicitud]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.waSolicitud;
      const solicitud = mapa.get(id);
      if (!solicitud) return;

      abrirWhatsAppConMensaje(mensajeWhatsAppSolicitud(solicitud, id));
    };
  });

  document.querySelectorAll("[data-estado-solicitud]").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.estadoSolicitud;
      const estado = btn.dataset.estado;

      try {
        await updateDoc(doc(db, "solicitudes", id), {
          estado,
          actualizadoEn: serverTimestamp()
        });

        toastMsg(`Estado actualizado: ${estadoBonito(estado)}`);
        await renderPaneles();
      } catch (error) {
        console.error(error);
        toastMsg("No se pudo actualizar el estado");
      }
    };
  });

  document.querySelectorAll("[data-postular]").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.postular;
      const solicitud = mapa.get(id);
      if (!solicitud) return;

      await postularmeASolicitud(solicitud);
    };
  });
}

/* =========================================================
   VISTAS / NAVEGACIÓN
========================================================= */

function obtenerVistaDesdeHash() {
  const hash = String(window.location.hash || "").replace("#", "");

  if (hash === "comoFunciona") return "comoFunciona";
  if (hash === "paneles") return "paneles";
  if (hash === "panelInterno") return "panelInterno";

  return "inicio";
}

async function mostrarVista(vista) {
  const vistasValidas = ["inicio", "comoFunciona", "paneles", "panelInterno"];

  if (!vistasValidas.includes(vista)) {
    vista = "inicio";
  }

  vistaActual = vista;

  vistaInicio?.classList.add("hidden");
  vistaComoFunciona?.classList.add("hidden");
  vistaPaneles?.classList.add("hidden");
  bloqueContactoBetween?.classList.add("hidden");

  if (vista === "inicio") {
    vistaInicio?.classList.remove("hidden");
    bloqueContactoBetween?.classList.remove("hidden");
  }

  if (vista === "comoFunciona") {
    vistaComoFunciona?.classList.remove("hidden");
  }

  if (vista === "paneles" || vista === "panelInterno") {
    vistaPaneles?.classList.remove("hidden");
  }

  document.querySelectorAll("[data-vista-link]").forEach(link => {
    link.classList.toggle("active", link.dataset.vistaLink === vista);
  });

  await renderPaneles();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   EVENTOS UI
========================================================= */

btnMenuMobile?.addEventListener("click", () => {
  msNav?.classList.toggle("open");
});

msNav?.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    msNav.classList.remove("open");
  });
});

window.addEventListener("hashchange", () => {
  mostrarVista(obtenerVistaDesdeHash());
});

document.querySelectorAll("[data-close-modal]").forEach(btn => {
  btn.addEventListener("click", () => {
    cerrarModal($(btn.dataset.closeModal));
  });
});

document.querySelectorAll(".ms-modal").forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModal(modal);
  });
});

btnCuenta?.addEventListener("click", () => abrirModal(modalCuenta));
btnLoginDesdePanel?.addEventListener("click", () => abrirModal(modalCuenta));
btnLoginGoogle?.addEventListener("click", loginGoogle);
btnCerrarSesion?.addEventListener("click", cerrarSesionActual);

btnAbrirContacto?.addEventListener("click", () => abrirModal(modalContacto));
btnAbrirSolicitud?.addEventListener("click", () => abrirModal(modalSolicitud));
btnPanelNuevaSolicitud?.addEventListener("click", () => abrirModal(modalSolicitud));

btnLlamadaRapida?.addEventListener("click", () => {
  const acepta = window.confirm("¿Desea realizar una consulta por llamada?");

  if (!acepta) return;

  window.location.href = "tel:+5491130042287";
});

btnCompartirApp?.addEventListener("click", async () => {
  const url = "https://multi24.github.io/multiservice24/";
  const texto = "Te comparto Multi24 para solicitar servicios programados y emergencias.";

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Multi24",
        text: texto,
        url
      });
      return;
    } catch (error) {
      console.warn("Compartir cancelado o no disponible", error);
    }
  }

  const mensaje = encodeURIComponent(`${texto}\n${url}`);
  window.open(`https://wa.me/?text=${mensaje}`, "_blank");
});

let eventoInstalacionPWA = null;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();

  eventoInstalacionPWA = e;

  if (btnInstalarApp) {
    btnInstalarApp.classList.remove("hidden");
  }
});

btnInstalarApp?.addEventListener("click", async () => {
  if (!eventoInstalacionPWA) {
    toastMsg("La instalación todavía no está lista. Actualizá la página y esperá unos segundos.");
    return;
  }

  eventoInstalacionPWA.prompt();

  try {
    await eventoInstalacionPWA.userChoice;
  } catch (error) {
    console.warn("Instalación cancelada o no disponible", error);
  }

  eventoInstalacionPWA = null;

  if (btnInstalarApp) {
    btnInstalarApp.classList.add("hidden");
  }
});

window.addEventListener("appinstalled", () => {
  eventoInstalacionPWA = null;

  if (btnInstalarApp) {
    btnInstalarApp.classList.add("hidden");
  }

  toastMsg("App instalada");
});

btnInscripcionPrestador?.addEventListener("click", () => {
  if (!usuarioActual) {
    toastMsg("Primero ingresá con Google");
    abrirModal(modalCuenta);
    return;
  }

  abrirModal(modalPrestador);
});

btnWhatsappFlotante?.addEventListener("click", (e) => {
  e.preventDefault();

  abrirWhatsAppConMensaje(
    "Hola, quiero hacer una consulta por un servicio de Multi24."
  );
});

btnSubirArriba?.addEventListener("click", () => {
  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
});

let timerMostrarSubir = null;

function actualizarBotonSubirArriba() {
  if (!btnSubirArriba) return;

  const estoyArriba = window.scrollY <= 80;

  btnSubirArriba.classList.remove("is-visible");

  if (timerMostrarSubir) {
    clearTimeout(timerMostrarSubir);
  }

  if (estoyArriba) return;

  timerMostrarSubir = setTimeout(() => {
    if (window.scrollY > 80) {
      btnSubirArriba.classList.add("is-visible");
    }
  }, 450);
}

window.addEventListener("scroll", actualizarBotonSubirArriba, { passive:true });
actualizarBotonSubirArriba();

solEmergencia?.addEventListener("change", actualizarNotaEmergencia);

$("solArchivos")?.addEventListener("change", () => {
  const resumen = $("solArchivosResumen");
  const archivos = Array.from($("solArchivos")?.files || []);

  if (!resumen) return;

  if (!archivos.length) {
    resumen.classList.add("hidden");
    resumen.textContent = "";
    return;
  }

  const fotos = archivos.filter(a => a.type.startsWith("image/")).length;
  const videos = archivos.filter(a => a.type.startsWith("video/")).length;
  const audios = archivos.filter(a => a.type.startsWith("audio/")).length;
  const otros = archivos.length - fotos - videos - audios;

  resumen.classList.remove("hidden");
  resumen.textContent =
    `Seleccionaste ${archivos.length} archivo(s): ` +
    `${fotos} foto(s), ${videos} video(s), ${audios} audio(s)` +
    `${otros ? `, ${otros} otro(s)` : ""}.`;
});

/* =========================================================
   FORM CONTACTO RÁPIDO
========================================================= */

formContactoRapido?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = formContactoRapido.querySelector("button[type='submit']");
  const ventanaWhatsApp = window.open("about:blank", "_blank");

  const data = {
    nombre: limpiar($("contactoNombre")?.value),
    telefono: normalizarTelefono($("contactoTelefono")?.value),
    zona: limpiar($("contactoZona")?.value),
    mensaje: limpiar($("contactoMensaje")?.value) || "Quiero que me contacten."
  };

  if (!data.nombre || !data.telefono) {
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg("Completá nombre y WhatsApp");
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

    const id = await guardarContactoRapido(data);

    abrirWhatsAppConMensaje(
      mensajeWhatsAppContacto({
        clienteNombre: data.nombre,
        clienteTelefono: data.telefono,
        zona: data.zona,
        descripcion: data.mensaje
      }, id),
      ventanaWhatsApp
    );

    formContactoRapido.reset();
    cerrarModal(modalContacto);
    toastMsg("Contacto guardado y WhatsApp preparado");
    await renderPaneles();
  } catch (error) {
    console.error(error);
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg("No se pudo guardar el contacto. Revisá reglas de Firestore.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Enviar y abrir WhatsApp`;
  }
});

/* =========================================================
   FORM SOLICITUD
========================================================= */

formSolicitudServicio?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = formSolicitudServicio.querySelector("button[type='submit']");
  const ventanaWhatsApp = window.open("about:blank", "_blank");

  const archivosSeleccionados = Array.from($("solArchivos")?.files || []);

  const data = {
    nombre: limpiar($("solNombre")?.value),
    telefono: normalizarTelefono($("solTelefono")?.value),
    servicio: limpiar($("solServicio")?.value),
    zona: limpiar($("solZona")?.value),
    direccion: limpiar($("solDireccion")?.value),
    fechaDeseada: limpiar($("solFechaDeseada")?.value),
    horarioDeseado: limpiar($("solHorarioDeseado")?.value),
    emergencia: !!$("solEmergencia")?.checked,
    descripcion: limpiar($("solDescripcion")?.value),
    archivos: [],
    archivosVencenEn: ""
  };

  if (!data.nombre || !data.telefono || !data.servicio) {
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg("Completá nombre, WhatsApp y servicio");
    return;
  }

  if (archivosSeleccionados.length > MAX_ARCHIVOS_SOLICITUD) {
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg(`Por ahora cargá hasta ${MAX_ARCHIVOS_SOLICITUD} archivos por solicitud`);
    return;
  }

  const archivoMuyGrande = archivosSeleccionados.find(archivo => {
    return archivo.size > MAX_BYTES_ARCHIVO_SOLICITUD;
  });

  if (archivoMuyGrande) {
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg(`El archivo ${archivoMuyGrande.name} supera ${MAX_MB_ARCHIVO_SOLICITUD}MB`);
    return;
  }

  const archivoNoPermitido = archivosSeleccionados.find(archivo => {
    const tipo = archivo.type || "";
    return !tipo.startsWith("image/") && !tipo.startsWith("video/") && !tipo.startsWith("audio/");
  });

  if (archivoNoPermitido) {
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg(`Archivo no permitido: ${archivoNoPermitido.name}`);
    return;
  }

  try {
    btn.disabled = true;

    if (archivosSeleccionados.length) {
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Subiendo archivos...`;

      const subida = await subirArchivosSolicitud(archivosSeleccionados);

      data.archivos = subida.archivos;
      data.archivosVencenEn = subida.vencenEn;
    }

    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando solicitud...`;

    const id = await guardarSolicitudServicio(data);

    abrirWhatsAppConMensaje(
      mensajeWhatsAppSolicitud({
        clienteNombre: data.nombre,
        clienteTelefono: data.telefono,
        servicio: data.servicio,
        emergencia: data.emergencia,
        zona: data.zona,
        direccion: data.direccion,
        fechaDeseada: data.fechaDeseada,
        horarioDeseado: data.horarioDeseado,
        descripcion: data.descripcion,
        archivos: data.archivos
      }, id),
      ventanaWhatsApp
    );

    formSolicitudServicio.reset();
    actualizarNotaEmergencia();

    if ($("solArchivosResumen")) {
      $("solArchivosResumen").classList.add("hidden");
      $("solArchivosResumen").textContent = "";
    }

    cerrarModal(modalSolicitud);
    toastMsg("Solicitud guardada con archivos");
    await renderPaneles();
  } catch (error) {
    console.error(error);

    if (ventanaWhatsApp) ventanaWhatsApp.close();

    toastMsg(error.message || "No se pudo guardar la solicitud");
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Guardar solicitud y abrir WhatsApp`;
  }
});

/* =========================================================
   FORM PRESTADOR
========================================================= */

formPrestador?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const seleccionados = Array.from(
    prestadorHabilidades?.querySelectorAll("input:checked") || []
  ).map(input => input.value);

  const zonasSeleccionadas = Array.from(
    document.querySelectorAll("[data-prestador-zona]:checked")
  ).map(input => input.value);

  const data = {
    nombre: limpiar($("prestadorNombre")?.value),
    telefono: normalizarTelefono($("prestadorTelefono")?.value),
    zona: zonasSeleccionadas.join(", "),
    movilidadHerramientas: !!$("prestadorRecursos")?.checked,
    habilidades: seleccionados,
    comentario: limpiar($("prestadorComentario")?.value)
  };

  if (!data.nombre || !data.telefono) {
    toastMsg("Completá nombre y WhatsApp");
    return;
  }

  if (!data.zona) {
    toastMsg("Elegí al menos una zona de trabajo");
    return;
  }

  if (!data.movilidadHerramientas) {
    toastMsg("Confirmá que contás con movilidad y herramientas propias");
    return;
  }

  if (!data.habilidades.length) {
    toastMsg("Elegí al menos una habilidad");
    return;
  }

  try {
    await guardarInscripcionPrestador(data);
    formPrestador.reset();
  } catch (error) {
    console.error(error);
    toastMsg("No se pudo enviar la inscripción");
  }
});

/* =========================================================
   AUTH STATE
========================================================= */

onAuthStateChanged(auth, async (user) => {
  usuarioActual = user || null;
  perfilActual = null;
  prestadorActual = null;

  if (!user) {
    if (btnCuenta) {
      btnCuenta.innerHTML = `<i class="fa-brands fa-google"></i> Ingresar`;
    }

    if (cuentaNombre) cuentaNombre.textContent = "Multi24";
    if (cuentaEmail) cuentaEmail.textContent = "Sin sesión iniciada";
    if (cuentaRol) cuentaRol.textContent = "Público";

    btnLoginGoogle?.classList.remove("hidden");
    btnCerrarSesion?.classList.add("hidden");

    await renderPaneles();
    return;
  }

  try {
    perfilActual = await obtenerOCrearPerfil(user);
    prestadorActual = await obtenerPrestador(user.uid);

    if (btnCuenta) {
      btnCuenta.innerHTML = `<i class="fa-solid fa-user-check"></i> Cuenta`;
    }

    if (cuentaNombre) cuentaNombre.textContent = perfilActual.nombre || user.displayName || "Usuario";
    if (cuentaEmail) cuentaEmail.textContent = perfilActual.email || user.email || "";
    if (cuentaRol) cuentaRol.textContent = `Rol: ${perfilActual.rol || "usuario"}`;

    btnLoginGoogle?.classList.add("hidden");
    btnCerrarSesion?.classList.remove("hidden");

    await renderPaneles();
  } catch (error) {
    console.error(error);
    toastMsg("Hubo un problema cargando tu perfil");
  }
});

/* =========================================================
   INIT
========================================================= */

renderServicios();
renderSelectServicios();
actualizarNotaEmergencia();
mostrarVista(obtenerVistaDesdeHash());

const SW_VERSION = "2026-06-12-02";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("reset-sw")) {
      const registros = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registros.map((registro) => registro.unregister()));

      const clavesCache = await caches.keys();
      await Promise.all(clavesCache.map((clave) => caches.delete(clave)));

      window.location.replace("./?v=" + Date.now());
      return;
    }

    navigator.serviceWorker.register(`./service-worker.js?v=${SW_VERSION}`)
      .then((registro) => {
        console.log("Service Worker registrado");

        registro.update();

        if (registro.waiting) {
          registro.waiting.postMessage({ type: "SKIP_WAITING" });
        }
      })
      .catch((error) => {
        console.error("Error registrando Service Worker:", error);
      });
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (window.__multi24RecargadoPorSW) return;

    window.__multi24RecargadoPorSW = true;
    window.location.reload();
  });
}
