/* =========================================================
   MULTI24 - APP V1 SERIA
   GitHub Pages + Firebase Auth Google + Firestore
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
  apiKey: "AIzaSyAMgWRboQ7HBVMxji4sAl7UOjzrMCOyI",
  authDomain: "multiservice24-77177.firebaseapp.com",
  projectId: "multiservice24-77177",
  storageBucket: "multiservice24-77177.firebasestorage.app",
  messagingSenderId: "806441507371",
  appId: "1:806441507371:web:4226d7cf6a71932cd081a1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const providerGoogle = new GoogleAuthProvider();

/* =========================================================
   CONFIG MULTI24
========================================================= */

const WHATSAPP_NUMERO = "5491130042287";

const ADMIN_EMAILS = [
  "vidaabundante.tristansuarez@gmail.com"
];

/*
  Roles posibles:
  usuario
  prestador
  colaborador
  admin
*/

const SERVICIOS = [
  {
    nombre: "Cerrajería",
    icono: "fa-solid fa-key",
    emergencia: true
  },
  {
    nombre: "Electricidad",
    icono: "fa-solid fa-bolt"
  },
  {
    nombre: "Plomería",
    icono: "fa-solid fa-faucet-drip"
  },
  {
    nombre: "Destapaciones",
    icono: "fa-solid fa-toilet"
  },
  {
    nombre: "Gas",
    icono: "fa-solid fa-fire-flame-curved"
  },
  {
    nombre: "Seguridad",
    icono: "fa-solid fa-shield-halved"
  },
  {
    nombre: "Fumigación",
    icono: "fa-solid fa-bug"
  },
  {
    nombre: "Aire acondicionado",
    icono: "fa-solid fa-snowflake"
  },
  {
    nombre: "Albañilería",
    icono: "fa-solid fa-trowel-bricks"
  },
  {
    nombre: "Pintura",
    icono: "fa-solid fa-paint-roller"
  },
  {
    nombre: "Colocación de cerámicas",
    icono: "fa-solid fa-border-all"
  },
  {
    nombre: "Corte de pasto",
    icono: "fa-solid fa-seedling"
  },
  {
    nombre: "Maestranza",
    icono: "fa-solid fa-broom"
  },
  {
    nombre: "Envíos",
    icono: "fa-solid fa-truck-fast"
  }
];

/* =========================================================
   SELECTORES
========================================================= */

const $ = (id) => document.getElementById(id);

const btnMenuMobile = $("btnMenuMobile");
const msNav = $("msNav");

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
const btnPanelNuevaSolicitud = $("btnPanelNuevaSolicitud");
const btnInscripcionPrestador = $("btnInscripcionPrestador");

const serviciosGrid = $("serviciosGrid");
const solServicio = $("solServicio");
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
const estadoPrestador = $("estadoPrestador");
const contadorAvisos = $("contadorAvisos");

const btnWhatsappFlotante = $("btnWhatsappFlotante");
const toast = $("toast");

/* =========================================================
   ESTADO
========================================================= */

let usuarioActual = null;
let perfilActual = null;
let prestadorActual = null;

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

function mensajeWhatsAppSolicitud(data, id = "") {
  const partes = [];

  partes.push("Hola, quiero solicitar un servicio en Multi24.");
  partes.push("");

  if (id) partes.push(`Solicitud: ${id}`);

  partes.push(`Nombre: ${data.clienteNombre || "Sin nombre"}`);
  partes.push(`WhatsApp: ${data.clienteTelefono || "Sin teléfono"}`);
  partes.push(`Servicio: ${data.servicio || "Sin servicio"}`);

  if (data.emergencia) partes.push("Emergencia: Sí");
  if (data.zona) partes.push(`Zona: ${data.zona}`);
  if (data.direccion) partes.push(`Dirección: ${data.direccion}`);
  if (data.fechaDeseada) partes.push(`Fecha deseada: ${data.fechaDeseada}`);
  if (data.horarioDeseado) partes.push(`Horario deseado: ${data.horarioDeseado}`);

  if (data.descripcion) {
    partes.push("");
    partes.push(`Detalle: ${data.descripcion}`);
  }

  return partes.join("\n");
}

function mensajeWhatsAppContacto(data, id = "") {
  const partes = [];

  partes.push("Hola, quiero que me contacten por Multi24.");
  partes.push("");

  if (id) partes.push(`Consulta: ${id}`);

  partes.push(`Nombre: ${data.clienteNombre || "Sin nombre"}`);
  partes.push(`WhatsApp: ${data.clienteTelefono || "Sin teléfono"}`);

  if (data.zona) partes.push(`Zona: ${data.zona}`);

  if (data.descripcion) {
    partes.push("");
    partes.push(`Mensaje: ${data.descripcion}`);
  }

  return partes.join("\n");
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
    habilitado: "Habilitado"
  };

  return mapa[estado] || estado || "Nuevo";
}

function escaparHtml(texto) {
  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   RENDER BASE
========================================================= */

function renderServicios() {
  if (!serviciosGrid) return;

  serviciosGrid.innerHTML = SERVICIOS.map(servicio => {
    return `
      <article class="ms-service-card ${servicio.emergencia ? "emergencia" : ""}">
        <div class="ms-service-icon">
          <i class="${servicio.icono}"></i>
        </div>
        <h3>${servicio.nombre}</h3>
        ${
          servicio.emergencia
            ? `<span class="ms-status red">Emergencias</span>`
            : `<span class="ms-status">Programado</span>`
        }
      </article>
    `;
  }).join("");
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

/* =========================================================
   FIRESTORE: USUARIOS / ROLES
========================================================= */

async function obtenerOCrearPerfil(user) {
  const ref = doc(db, "usuarios", user.uid);
  const snap = await getDoc(ref);

  const ahoraAdmin = esEmailAdmin(user.email);

  if (!snap.exists()) {
    const nuevoPerfil = {
      uid: user.uid,
      nombre: user.displayName || "",
      email: user.email || "",
      foto: user.photoURL || "",
      rol: ahoraAdmin ? "admin" : "usuario",
      creadoEn: serverTimestamp(),
      actualizadoEn: serverTimestamp()
    };

    await setDoc(ref, nuevoPerfil, { merge: true });
    return nuevoPerfil;
  }

  const perfil = snap.data();

  if (ahoraAdmin && perfil.rol !== "admin") {
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
   AUTH GOOGLE
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

async function cerrarSesion() {
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
   SOLICITUDES / AVISOS
========================================================= */

async function crearAvisoInterno(data) {
  await addDoc(collection(db, "notificaciones"), {
    tipo: data.tipoAviso || "nueva_solicitud",
    titulo: data.titulo || "Nueva solicitud",
    mensaje: data.mensaje || "",
    solicitudId: data.solicitudId || "",
    rolesDestino: ["admin", "colaborador"],
    visto: false,
    creadoEn: serverTimestamp()
  });
}

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
   PRESTADORES
========================================================= */

async function guardarInscripcionPrestador(data) {
  if (!usuarioActual) {
    toastMsg("Primero tenés que ingresar con Google");
    abrirModal(modalCuenta);
    return;
  }

  const refPrestador = doc(db, "prestadores", usuarioActual.uid);

  await setDoc(refPrestador, {
    uid: usuarioActual.uid,
    email: usuarioActual.email || "",
    nombre: data.nombre,
    telefono: data.telefono,
    zona: data.zona,
    habilidades: data.habilidades,
    comentario: data.comentario,
    habilitado: false,
    entrevistaEstado: "pendiente_entrevista",
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  }, { merge: true });

  const refUsuario = doc(db, "usuarios", usuarioActual.uid);

  await setDoc(refUsuario, {
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
   CARGAS DE DATOS
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
    return s.clienteUid === usuarioActual.uid || emailLower(s.clienteEmail) === emailLower(usuarioActual.email);
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

function renderSolicitudItem(s, modo = "usuario") {
  const fecha = fechaTexto(s.creadoEn);
  const nombreSeguro = escaparHtml(s.clienteNombre || "Sin nombre");
  const telSeguro = escaparHtml(s.clienteTelefono || "Sin teléfono");
  const servicioSeguro = escaparHtml(s.servicio || "Solicitud");
  const estado = estadoBonito(s.estado);
  const emergencia = s.emergencia ? `<span class="ms-status red">Emergencia</span>` : "";

  return `
    <article class="ms-item" data-solicitud-id="${s.id}">
      <h4>${servicioSeguro}</h4>

      <p><strong>Cliente:</strong> ${nombreSeguro}</p>
      <p><strong>WhatsApp:</strong> ${telSeguro}</p>
      <p><strong>Zona:</strong> ${escaparHtml(s.zona || "Sin zona")}</p>
      <p><strong>Dirección:</strong> ${escaparHtml(s.direccion || "Sin dirección")}</p>
      <p><strong>Detalle:</strong> ${escaparHtml(s.descripcion || "Sin detalle")}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
        <span class="ms-status">${estado}</span>
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

  if (boxSinLogin) boxSinLogin.classList.toggle("hidden", logueado);
  if (panelUsuario) panelUsuario.classList.toggle("hidden", !logueado);

  if (!logueado) {
    if (panelPrestador) panelPrestador.classList.add("hidden");
    if (panelEquipo) panelEquipo.classList.add("hidden");
    return;
  }

  if (txtUsuarioActual) {
    txtUsuarioActual.textContent = `${perfilActual?.nombre || usuarioActual.displayName || "Usuario"} · ${perfilActual?.rol || "usuario"}`;
  }

  if (panelEquipo) {
    panelEquipo.classList.toggle("hidden", !puedeVerPanelEquipo());
  }

  renderEstadoPrestador();

  await renderMisSolicitudes();
  await renderPrestador();
  await renderEquipo();
}

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

document.querySelectorAll("[data-close-modal]").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.dataset.closeModal;
    cerrarModal($(id));
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
btnCerrarSesion?.addEventListener("click", cerrarSesion);

btnAbrirContacto?.addEventListener("click", () => abrirModal(modalContacto));
btnAbrirSolicitud?.addEventListener("click", () => abrirModal(modalSolicitud));
btnPanelNuevaSolicitud?.addEventListener("click", () => abrirModal(modalSolicitud));

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
    toastMsg("No se pudo guardar el contacto");
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

  const data = {
    nombre: limpiar($("solNombre")?.value),
    telefono: normalizarTelefono($("solTelefono")?.value),
    servicio: limpiar($("solServicio")?.value),
    zona: limpiar($("solZona")?.value),
    direccion: limpiar($("solDireccion")?.value),
    fechaDeseada: limpiar($("solFechaDeseada")?.value),
    horarioDeseado: limpiar($("solHorarioDeseado")?.value),
    emergencia: !!$("solEmergencia")?.checked,
    descripcion: limpiar($("solDescripcion")?.value)
  };

  if (!data.nombre || !data.telefono || !data.servicio) {
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg("Completá nombre, WhatsApp y servicio");
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando...`;

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
        descripcion: data.descripcion
      }, id),
      ventanaWhatsApp
    );

    formSolicitudServicio.reset();
    cerrarModal(modalSolicitud);
    toastMsg("Solicitud guardada y WhatsApp preparado");
    await renderPaneles();
  } catch (error) {
    console.error(error);
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg("No se pudo guardar la solicitud");
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

  const data = {
    nombre: limpiar($("prestadorNombre")?.value),
    telefono: normalizarTelefono($("prestadorTelefono")?.value),
    zona: limpiar($("prestadorZona")?.value),
    habilidades: seleccionados,
    comentario: limpiar($("prestadorComentario")?.value)
  };

  if (!data.nombre || !data.telefono) {
    toastMsg("Completá nombre y WhatsApp");
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
