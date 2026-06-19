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
  deleteDoc,
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

const WORKER_UPLOAD_URL = "https://archivos.multiservice24.com.ar/upload";
const WORKER_GEO_URL = "https://geo.multi24pro.workers.dev";

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
const solZona = $("solZona");
const solDireccion = $("solDireccion");
const solZonaSugerencias = $("solZonaSugerencias");
const solDireccionSugerencias = $("solDireccionSugerencias");

const solEmergencia = $("solEmergencia");
const emergenciaNota = $("emergenciaNota");

const solArchivos = $("solArchivos");
const solArchivosResumen = $("solArchivosResumen");

const btnAudioGrabar = $("btnAudioGrabar");
const btnAudioDetener = $("btnAudioDetener");
const btnAudioBorrar = $("btnAudioBorrar");
const solAudioPreview = $("solAudioPreview");
const solAudioEstado = $("solAudioEstado");

const btnAgregarServicioSolicitud = $("btnAgregarServicioSolicitud");
const solServiciosTabs = $("solServiciosTabs");
const solServiciosDetalle = $("solServiciosDetalle");
const solServiciosPicker = $("solServiciosPicker");
const btnSolServiciosDropdown = $("btnSolServiciosDropdown");

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

const panelEquipoSolicitudes = $("panelEquipoSolicitudes");
const panelEquipoUsuarios = $("panelEquipoUsuarios");
const panelEquipoPlanillasArchivo = $("panelEquipoPlanillasArchivo");

const btnPanelSolicitudes = $("btnPanelSolicitudes");
const btnPanelAdminUsuarios = $("btnPanelAdminUsuarios");
const btnPanelArchivoPlanillas = $("btnPanelArchivoPlanillas");

const listaPlanillasArchivadas = $("listaPlanillasArchivadas");

const modalPrestadoresServicio = $("modalPrestadoresServicio");
const prestadoresServicioTitulo = $("prestadoresServicioTitulo");
const prestadoresServicioSubtitulo = $("prestadoresServicioSubtitulo");
const listaPrestadoresServicio = $("listaPrestadoresServicio");

const modalInformeServicio = $("modalInformeServicio");
const formInformeServicio = $("formInformeServicio");
const informeSolicitudId = $("informeSolicitudId");
const informeClienteTitulo = $("informeClienteTitulo");
const informeSolicitudTexto = $("informeSolicitudTexto");
const informeTrabajo = $("informeTrabajo");
const informeObservaciones = $("informeObservaciones");
const informeCostoManoObra = $("informeCostoManoObra");
const informeCostoMateriales = $("informeCostoMateriales");
const informeCostoTotal = $("informeCostoTotal");
const informeGarantiaTiempo = $("informeGarantiaTiempo");
const informeGarantiaVencimiento = $("informeGarantiaVencimiento");
const informeArchivos = $("informeArchivos");
const informeArchivosResumen = $("informeArchivosResumen");
const canvasFirmaCliente = $("canvasFirmaCliente");
const btnLimpiarFirma = $("btnLimpiarFirma");
const btnVistaInformePdf = $("btnVistaInformePdf");

const btnEditarInforme = $("btnEditarInforme");

const btnInformeAudioGrabar = $("btnInformeAudioGrabar");
const btnInformeAudioDetener = $("btnInformeAudioDetener");
const btnInformeAudioBorrar = $("btnInformeAudioBorrar");
const informeAudioPreview = $("informeAudioPreview");
const informeAudioEstado = $("informeAudioEstado");

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
let hojaRutaSeleccion = new Set();

let subVistaPanelInterno = "solicitudes";
let solicitudesVisiblesPanel = [];

let planillaActivaId = "general";

let planillasPanel = [
  {
    id: "general",
    nombre: "General",
    color: "#e11f2a",
    ids: null,
    archivada: false,
    creadaEn: Date.now()
  }
];

let solicitudEditandoId = "";
let solicitudEditandoData = null;
let informeSolicitudActual = null;
let informeServicioDetalleActual = null;
let informeFirmaDataUrl = "";
let informeArchivosSeleccionados = [];
let informeCargadoId = "";
let informeCargadoData = null;
let informeModoLectura = false;
let informeTotalEditadoManual = false;
let informeGarantiaEditando = false;
let prestadorAltaManualServicio = "";

let mediaRecorderInforme = null;
let streamAudioInforme = null;
let audioChunksInforme = [];
let audioInformeBlob = null;
let audioInformeFile = null;
let audioInformeUrl = "";

let mediaRecorderSolicitud = null;
let streamAudioSolicitud = null;
let audioChunksSolicitud = [];
let audioSolicitudBlob = null;
let audioSolicitudFile = null;
let audioSolicitudUrl = "";

let serviciosDetalleSolicitud = [];
let servicioActivoSolicitudId = "";

let audioServicioSolicitud = {
  id: "",
  recorder: null,
  stream: null,
  chunks: []
};

/* =========================================================
   HELPERS
========================================================= */
function numeroInforme(valor) {
  const n = Number(String(valor || "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function hoyInputFecha() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const y = hoy.getFullYear();
  const m = String(hoy.getMonth() + 1).padStart(2, "0");
  const d = String(hoy.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function fechaInputDesdeDate(fecha) {
  const f = new Date(fecha);
  f.setHours(0, 0, 0, 0);

  const y = f.getFullYear();
  const m = String(f.getMonth() + 1).padStart(2, "0");
  const d = String(f.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

function dateDesdeInputFecha(valor) {
  if (!valor) return null;

  const partes = String(valor).split("-");
  if (partes.length !== 3) return null;

  const fecha = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
  fecha.setHours(0, 0, 0, 0);

  return fecha;
}

function extraerDiasGarantia(texto) {
  const t = String(texto || "").toLowerCase().trim();
  const numero = Number((t.match(/\d+/) || [0])[0]);

  if (!numero) return 0;

  if (t.includes("mes")) {
    return numero * 30;
  }

  if (t.includes("año") || t.includes("ano")) {
    return numero * 365;
  }

  return numero;
}

function calcularDiasEntreHoy(fechaInput) {
  const destino = dateDesdeInputFecha(fechaInput);
  if (!destino) return 0;

  const hoy = dateDesdeInputFecha(hoyInputFecha());
  const diff = destino.getTime() - hoy.getTime();

  return Math.max(0, Math.round(diff / 86400000));
}

function actualizarTotalInforme() {
  if (!informeCostoManoObra || !informeCostoMateriales || !informeCostoTotal) return;
  if (informeTotalEditadoManual) return;

  const mano = numeroInforme(informeCostoManoObra.value);
  const materiales = numeroInforme(informeCostoMateriales.value);
  const total = mano + materiales;

  informeCostoTotal.value = total ? String(total) : "";
}

function actualizarVencimientoGarantiaDesdeTiempo() {
  if (informeGarantiaEditando) return;
  if (!informeGarantiaTiempo || !informeGarantiaVencimiento) return;

  const dias = extraerDiasGarantia(informeGarantiaTiempo.value);

  if (!dias) {
    informeGarantiaVencimiento.value = "";
    return;
  }

  informeGarantiaEditando = true;

  const base = dateDesdeInputFecha(hoyInputFecha());
  base.setDate(base.getDate() + dias);

  informeGarantiaVencimiento.value = fechaInputDesdeDate(base);

  informeGarantiaEditando = false;
}

function actualizarTiempoGarantiaDesdeVencimiento() {
  if (informeGarantiaEditando) return;
  if (!informeGarantiaTiempo || !informeGarantiaVencimiento) return;

  const dias = calcularDiasEntreHoy(informeGarantiaVencimiento.value);

  informeGarantiaEditando = true;

  informeGarantiaTiempo.value = dias
    ? String(dias)
    : "";

  informeGarantiaEditando = false;
}

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

function esDispositivoMovil() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}

function encodeWhatsAppText(texto) {
  return String(texto || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .split("\n")
    .map(linea => encodeURIComponent(linea))
    .join("%0A");
}

function cerrarPanelWhatsApp() {
  const viejo = document.getElementById("multi24WhatsAppOverlay");
  if (viejo) viejo.remove();
}

function prepararVentanaWhatsApp() {
  cerrarPanelWhatsApp();

  const overlay = document.createElement("div");
  overlay.id = "multi24WhatsAppOverlay";

  overlay.innerHTML = `
    <div class="multi24-wa-card">
      <div class="multi24-wa-spinner"></div>
      <h2>Preparando WhatsApp...</h2>
      <p>Estamos guardando la solicitud, subiendo archivos y armando el mensaje.</p>
    </div>
  `;

  document.body.appendChild(overlay);

  return {
    __multi24Overlay: true,
    closed: false,
    close() {
      cerrarPanelWhatsApp();
      this.closed = true;
    }
  };
}

function mostrarOpcionesWhatsApp(mensaje, overlayControl = null) {
  const mensajeFinal = String(mensaje || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  const texto = encodeWhatsAppText(mensajeFinal);

  const urlWeb = `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
  const urlApp = `whatsapp://send?phone=${WHATSAPP_NUMERO}&text=${texto}`;
  const urlBusiness = `intent://send?phone=${WHATSAPP_NUMERO}&text=${texto}#Intent;scheme=whatsapp;package=com.whatsapp.w4b;end`;

  const overlay = document.getElementById("multi24WhatsAppOverlay");

  if (!overlay) {
    window.open(urlWeb, "_blank");
    return;
  }

  overlay.innerHTML = `
    <div class="multi24-wa-card multi24-wa-card-ready">
      <button class="multi24-wa-x" type="button" data-wa-cerrar>
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="multi24-wa-ok">
        <i class="fa-brands fa-whatsapp"></i>
      </div>

      <h2>Solicitud guardada</h2>
      <p>
        Ahora elegí dónde abrir el mensaje. Si tu celular tiene WhatsApp común y Business,
        probá primero con el que usás para Multi24.
      </p>

      <div class="multi24-wa-actions">
        <button type="button" class="multi24-wa-btn primary" data-wa-app>
          Abrir WhatsApp
        </button>

        <button type="button" class="multi24-wa-btn business" data-wa-business>
          Abrir WhatsApp Business
        </button>

        <button type="button" class="multi24-wa-btn" data-wa-web>
          Abrir en navegador
        </button>

        <button type="button" class="multi24-wa-btn light" data-wa-copiar>
          Copiar mensaje
        </button>
      </div>

      <textarea class="multi24-wa-textarea" readonly>${mensajeFinal.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</textarea>
    </div>
  `;

  overlay.querySelector("[data-wa-app]")?.addEventListener("click", () => {
    window.location.href = urlApp;
  });

  overlay.querySelector("[data-wa-business]")?.addEventListener("click", () => {
    window.location.href = urlBusiness;
  });

  overlay.querySelector("[data-wa-web]")?.addEventListener("click", () => {
    window.open(urlWeb, "_blank");
  });

  overlay.querySelector("[data-wa-copiar]")?.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(mensajeFinal);
      toastMsg("Mensaje copiado");
    } catch (error) {
      const textarea = overlay.querySelector(".multi24-wa-textarea");
      textarea?.select();
      document.execCommand("copy");
      toastMsg("Mensaje copiado");
    }
  });

  overlay.querySelector("[data-wa-cerrar]")?.addEventListener("click", () => {
    if (overlayControl) overlayControl.closed = true;
    cerrarPanelWhatsApp();
  });
}

function abrirWhatsAppConMensaje(mensaje, ventanaPrevia = null) {
  if (ventanaPrevia?.__multi24Overlay) {
    mostrarOpcionesWhatsApp(mensaje, ventanaPrevia);
    return;
  }

  const texto = encodeWhatsAppText(mensaje);
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
  window.open(url, "_blank");
}

async function subirArchivosSolicitud(archivosSeleccionados, telefono = "", meta = {}) {
  if (!archivosSeleccionados.length) {
    return {
      archivos: [],
      vencenEn: ""
    };
  }

  const formData = new FormData();

  formData.append("telefono", normalizarTelefono(telefono));

  if (meta.titulo) {
    formData.append("titulo", limpiar(meta.titulo));
  }

  if (meta.descripcion) {
    formData.append("descripcion", limpiar(meta.descripcion));
  }

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
    galeriaId: data.galeriaId || "",
    galeriaUrl: data.galeriaUrl || "",
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
    pendiente_derivar: "Pendiente",
    contactado: "Contactado",
    derivado: "Derivado",
    cotizando: "Cotizando",
    programado: "Coordinado",
    en_lugar: "Técnico en lugar",
    realizado: "Realizado",
    cerrado: "Terminado",
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

function capitalizarPrimera(texto) {
  const t = String(texto || "").trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function fechaDeseadaBonita(valor) {
  if (!valor) return "";

  const partes = String(valor).split("-");

  if (partes.length !== 3) {
    return valor;
  }

  const anio = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const dia = Number(partes[2]);

  const fecha = new Date(anio, mes, dia);

  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado"
  ];

  const meses = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
  ];

  return `${capitalizarPrimera(dias[fecha.getDay()])} ${dia} de ${meses[mes]}`;
}

function linkUbicacionSolicitud(data) {
  if (data.lat && data.lon) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.lat},${data.lon}`)}`;
  }

  const direccion = [
    data.direccion,
    data.localidad,
    data.partido,
    data.provincia || "Buenos Aires",
    "Argentina"
  ].filter(Boolean).join(", ");

  if (!direccion) return "";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion)}`;
}

function mensajeWhatsAppSolicitud(data, id = "") {
  const partes = [];
  const serviciosDetalle = Array.isArray(data.serviciosDetalle) ? data.serviciosDetalle : [];
  const archivos = Array.isArray(data.archivos) ? data.archivos : [];
  const galeriaUrl = data.archivosGaleriaUrl || data.galeriaUrl || "";

  partes.push("*MULTI24 - Solicitud de servicio*");
  partes.push("");

  partes.push(`*Nombre:* ${data.clienteNombre || "Sin nombre"}`);
  partes.push(`*WhatsApp:* ${data.clienteTelefono || "Sin teléfono"}`);

  if (serviciosDetalle.length) {
    partes.push(`*Servicios:* ${serviciosDetalle.map(s => s.servicio).filter(Boolean).join(" + ")}`);
  } else {
    partes.push(`*Servicio:* ${data.servicio || "Sin servicio"}`);
  }

  if (data.emergencia) {
    partes.push("");
    partes.push("*Emergencia:* Sí");
  }

  partes.push("");

  if (data.zona) partes.push(`*Zona:* ${data.zona}`);
  if (data.localidad) partes.push(`*Localidad:* ${data.localidad}`);
  if (data.partido) partes.push(`*Partido:* ${data.partido}`);

  if (data.direccion) {
    partes.push(`*Dirección:* ${data.direccion}`);

    const linkMapa = linkUbicacionSolicitud(data);

    if (linkMapa) {
      partes.push(`*Ubicación:* ${linkMapa}`);
    }
  }

  if (serviciosDetalle.length) {
    partes.push("");
    partes.push("*Detalle por servicio:*");

    serviciosDetalle.forEach((item, index) => {
      partes.push("");
      partes.push(`${index + 1}. *${item.servicio || "Servicio"}*`);

      if (item.fechaDeseada) {
        partes.push(`Fecha: ${fechaDeseadaBonita(item.fechaDeseada)}`);
      }

      if (item.horarioDeseado) {
        partes.push(`Horario: ${item.horarioDeseado}`);
      }

      if (item.descripcion) {
        partes.push(`Detalle: ${item.descripcion}`);
      }

      if (item.archivosGaleriaUrl) {
        partes.push(`Archivos de ${item.servicio}: ${item.archivosGaleriaUrl}`);
      }
    });
  } else {
    if (data.fechaDeseada) {
      partes.push(`*Fecha deseada:* ${fechaDeseadaBonita(data.fechaDeseada)}`);
    }

    if (data.horarioDeseado) {
      partes.push(`*Horario deseado:* ${data.horarioDeseado}`);
    }

    if (data.descripcion) {
      partes.push("");
      partes.push("*Detalle del trabajo:*");
      partes.push(data.descripcion);
    }

    if (archivos.length) {
      partes.push("");
      partes.push("*Archivos cargados:*");

      if (galeriaUrl) {
        partes.push(galeriaUrl);
      } else {
        archivos.forEach((archivo, index) => {
          const url = archivo.urlCorta || archivo.shortUrl || archivo.url || "";
          if (!url) return;

          const tipo = archivo.tipoGeneral || "Archivo";
          partes.push(`${index + 1}. ${tipo}: ${url}`);
        });
      }
    }
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
  solServicio.value = "";
}

if (!solicitudEditandoId) {
  reiniciarServiciosDetalleSolicitud(servicio);
  actualizarPickerServiciosSolicitud();
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

  if (solServiciosPicker) {
    solServiciosPicker.innerHTML = `
      <div class="ms-servicios-picker-head">
        <strong>Elegí uno o más servicios</strong>

        <button data-cerrar-servicios-picker type="button" title="Cerrar">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      ${SERVICIOS.map(s => `
        <label class="ms-servicio-pick">
          <input type="checkbox" value="${s.nombre}" data-servicio-pick="${s.nombre}" />
          <span>
            <i class="${s.icono}"></i>
            ${s.nombre}
          </span>
        </label>
      `).join("")}
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

  actualizarPickerServiciosSolicitud();
}

function actualizarNotaEmergencia() {
  if (!solEmergencia || !emergenciaNota) return;

  emergenciaNota.classList.toggle("hidden", !solEmergencia.checked);
}

let geoZonaSeleccionada = null;
let geoDireccionSeleccionada = null;

function crearSessionTokenGoogle() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `multi24-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

let sessionTokenDireccion = crearSessionTokenGoogle();
let sessionTokenZona = crearSessionTokenGoogle();

function cerrarCajaSugerencias(contenedor) {
  if (!contenedor) return;
  contenedor.classList.add("hidden");
  contenedor.innerHTML = "";
}

function obtenerContextoGeoParaDireccion() {
  /*
    Ya no usamos campo Zona en la solicitud.
    Si alguna vez existe solZona por compatibilidad, lo lee.
    Si no existe, Google resuelve todo desde Dirección.
  */
  if (geoZonaSeleccionada?.zonaLocalidad) {
    return geoZonaSeleccionada.zonaLocalidad;
  }

  if (geoZonaSeleccionada?.localidad) {
    return geoZonaSeleccionada.localidad;
  }

  const zonaEscrita = limpiar(solZona?.value);

  if (zonaEscrita) {
    return zonaEscrita;
  }

  return "";
}

async function buscarGeoapify(texto, modo) {
  const params = new URLSearchParams();

  params.set("modo", modo);
  params.set("text", texto);

  if (modo === "direccion") {
    params.set("sessionToken", sessionTokenDireccion);

    const contexto = obtenerContextoGeoParaDireccion();

    if (contexto) {
      params.set("contexto", contexto);
    }
  }

  if (modo === "zona") {
    params.set("sessionToken", sessionTokenZona);
  }

  const url = `${WORKER_GEO_URL}/autocomplete?${params.toString()}`;

  const respuesta = await fetch(url);
  const data = await respuesta.json();

  if (!respuesta.ok || !data.ok) {
    throw new Error(data.error || "No se pudieron buscar direcciones");
  }

  return Array.isArray(data.resultados) ? data.resultados : [];
}

async function obtenerDetalleGoogleLugar(placeId, modo) {
  const params = new URLSearchParams();

  params.set("placeId", placeId);

  if (modo === "direccion") {
    params.set("sessionToken", sessionTokenDireccion);
  }

  if (modo === "zona") {
    params.set("sessionToken", sessionTokenZona);
  }

  const url = `${WORKER_GEO_URL}/place-details?${params.toString()}`;

  const respuesta = await fetch(url);
  const data = await respuesta.json();

  if (!respuesta.ok || !data.ok) {
    throw new Error(data.error || "No se pudo obtener el detalle de la dirección");
  }

  return data.detalle || null;
}

async function resolverDireccionEscritaGoogle(texto) {
  const params = new URLSearchParams();

  params.set("text", texto);

  const contexto = obtenerContextoGeoParaDireccion();

  if (contexto) {
    params.set("contexto", contexto);
  }

  const url = `${WORKER_GEO_URL}/geocode?${params.toString()}`;

  const respuesta = await fetch(url);
  const data = await respuesta.json();

  if (!respuesta.ok || !data.ok) {
    throw new Error(data.error || "No se pudo validar la dirección escrita");
  }

  return data.detalle || null;
}

function configurarSugerenciasGeo(input, contenedor, modo) {
  if (!input || !contenedor) return;

  let timer = null;
  let resultadosActuales = [];

  function mostrarCargando() {
    contenedor.innerHTML = `
      <div class="ms-suggest-loading">
        <i class="fa-solid fa-spinner fa-spin"></i>
        Buscando...
      </div>
    `;
    contenedor.classList.remove("hidden");
  }

  function renderResultados(resultados) {
    resultadosActuales = resultados;

    if (!resultados.length) {
      cerrarCajaSugerencias(contenedor);
      return;
    }

    contenedor.innerHTML = resultados.map((item, index) => {
      const principal = item.label || item.direccion || item.localidad || "Ubicación";
      const secundario = item.secondary || "";

      return `
        <button class="ms-suggest-item" type="button" data-geo-index="${index}">
          <i class="fa-solid fa-location-dot"></i>

          <span class="ms-suggest-text">
            <strong>${escaparHtml(principal)}</strong>
            ${secundario ? `<small>${escaparHtml(secundario)}</small>` : ""}
          </span>
        </button>
      `;
    }).join("");

    contenedor.classList.remove("hidden");
  }

  async function seleccionarResultado(item) {
    if (!item) return;

    try {
      let detalle = item;

      if (item.placeId) {
        detalle = await obtenerDetalleGoogleLugar(item.placeId, modo);
      }

      if (!detalle) return;

      if (modo === "zona") {
        geoZonaSeleccionada = detalle;
        input.value = detalle.zonaLocalidad || detalle.label || "";
        sessionTokenZona = crearSessionTokenGoogle();
      }

      if (modo === "direccion") {
        geoDireccionSeleccionada = detalle;
        input.value = detalle.direccion || detalle.label || "";

        if (solZona && (detalle.zonaLocalidad || detalle.localidad || detalle.zona)) {
          solZona.value = detalle.zonaLocalidad || `${detalle.zona || "GBA"} · ${detalle.localidad || ""}`.trim();
          geoZonaSeleccionada = detalle;
        }

        sessionTokenDireccion = crearSessionTokenGoogle();
      }

      cerrarCajaSugerencias(contenedor);
    } catch (error) {
      console.error(error);
      toastMsg(error.message || "No se pudo seleccionar la dirección");
    }
  }

  async function ejecutarBusqueda() {
    const texto = input.value || "";

    if (modo === "zona") {
      geoZonaSeleccionada = null;
    }

    if (modo === "direccion") {
      geoDireccionSeleccionada = null;
    }

    if (limpiar(texto).length < 1) {
      cerrarCajaSugerencias(contenedor);
      return;
    }

    mostrarCargando();

    try {
      const resultados = await buscarGeoapify(texto, modo);
      renderResultados(resultados);
    } catch (error) {
      console.error(error);
      cerrarCajaSugerencias(contenedor);
      toastMsg(error.message || "No se pudieron cargar sugerencias");
    }
  }

  input.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(ejecutarBusqueda, 300);
  });

  input.addEventListener("focus", () => {
    if (limpiar(input.value).length >= 1) {
      clearTimeout(timer);
      timer = setTimeout(ejecutarBusqueda, 150);
    }
  });

  contenedor.addEventListener("mousedown", (e) => {
    const btn = e.target.closest("[data-geo-index]");
    if (!btn) return;

    e.preventDefault();

    const index = Number(btn.dataset.geoIndex);
    seleccionarResultado(resultadosActuales[index]);
  });

  document.addEventListener("click", (e) => {
    if (e.target === input || contenedor.contains(e.target)) return;
    cerrarCajaSugerencias(contenedor);
  });
}

function limpiarFormularioSolicitud() {
  formSolicitudServicio?.reset();

     solicitudEditandoId = "";
  solicitudEditandoData = null;

  const titulo = modalSolicitud?.querySelector("h2");
  const texto = modalSolicitud?.querySelector(".ms-muted");
  const submit = formSolicitudServicio?.querySelector("button[type='submit']");

  if (titulo) {
    titulo.textContent = "Programar un servicio";
  }

  if (texto) {
    texto.textContent = "La solicitud queda registrada y el equipo puede verla desde el panel interno.";
  }

  if (submit) {
    submit.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Guardar solicitud y abrir WhatsApp`;
  }
   
  geoZonaSeleccionada = null;
  geoDireccionSeleccionada = null;

  cerrarCajaSugerencias(solZonaSugerencias);
  cerrarCajaSugerencias(solDireccionSugerencias);

  actualizarNotaEmergencia();
  reiniciarServiciosDetalleSolicitud("");
  borrarAudioSolicitud(false);

  if (solArchivosResumen) {
    solArchivosResumen.classList.add("hidden");
    solArchivosResumen.textContent = "";
  }

  if (typeof crearSessionTokenGoogle === "function") {
    if (typeof sessionTokenDireccion !== "undefined") {
      sessionTokenDireccion = crearSessionTokenGoogle();
    }

    if (typeof sessionTokenZona !== "undefined") {
      sessionTokenZona = crearSessionTokenGoogle();
    }
  }
}

function cerrarModalControlado(modal) {
  if (modal === modalSolicitud) {
    limpiarFormularioSolicitud();
  }

  cerrarModal(modal);
}

function obtenerExtensionAudio(tipo) {
  if (tipo.includes("mp4")) return "m4a";
  if (tipo.includes("mpeg")) return "mp3";
  if (tipo.includes("ogg")) return "ogg";
  if (tipo.includes("wav")) return "wav";
  return "webm";
}

function crearIdServicioSolicitud() {
  return `serv-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function servicioIcono(nombre) {
  const item = SERVICIOS.find(s => s.nombre === nombre);
  return item?.icono || "fa-solid fa-screwdriver-wrench";
}

function crearServicioDetalleSolicitud(nombre = "") {
  const id = crearIdServicioSolicitud();

  const primerServicio = serviciosDetalleSolicitud[0] || {};

  serviciosDetalleSolicitud.push({
    id,
    servicio: nombre || "",
    descripcion: "",

    fechaDeseada: primerServicio.fechaDeseada || "",
    horarioDeseado: primerServicio.horarioDeseado || "",

    audioFile: null,
    audioUrl: "",

    archivosLocales: [],
    archivosSubidos: [],
    archivosGaleriaUrl: "",
    archivosGaleriaId: "",

    prestadorAsignadoUid: "",
    prestadorAsignadoNombre: "",
    estado: "pendiente_derivar",
    tieneInforme: false,
    informeId: ""
  });

  servicioActivoSolicitudId = id;
  renderServiciosDetalleSolicitud();

  return id;
}

function obtenerServicioActivoSolicitud() {
  return serviciosDetalleSolicitud.find(s => s.id === servicioActivoSolicitudId)
    || serviciosDetalleSolicitud[0]
    || null;
}

function asegurarUnServicioSolicitud() {
  if (!serviciosDetalleSolicitud.length) {
    crearServicioDetalleSolicitud(solServicio?.value || "");
  }
}

function reiniciarServiciosDetalleSolicitud(servicioInicial = "") {
  serviciosDetalleSolicitud = [];
  servicioActivoSolicitudId = "";
  crearServicioDetalleSolicitud(servicioInicial || "");
}

function cargarServiciosDetalleDesdeSolicitud(solicitud) {
  const detalles = Array.isArray(solicitud?.serviciosDetalle)
    ? solicitud.serviciosDetalle
    : [];

  if (detalles.length) {
    serviciosDetalleSolicitud = detalles.map(item => ({
      id: item.id || crearIdServicioSolicitud(),
      servicio: item.servicio || "",
      descripcion: item.descripcion || "",

      fechaDeseada: item.fechaDeseada || solicitud?.fechaDeseada || "",
      horarioDeseado: item.horarioDeseado || solicitud?.horarioDeseado || "",

      audioFile: null,
      audioUrl: "",

      archivosLocales: [],
      archivosSubidos: Array.isArray(item.archivos) ? item.archivos : [],
      archivosGaleriaUrl: item.archivosGaleriaUrl || "",
      archivosGaleriaId: item.archivosGaleriaId || "",

      prestadorAsignadoUid: item.prestadorAsignadoUid || "",
      prestadorAsignadoNombre: item.prestadorAsignadoNombre || "",
      estado: item.estado || "pendiente_derivar",
      tieneInforme: !!item.tieneInforme,
      informeId: item.informeId || ""
    }));
  } else {
    serviciosDetalleSolicitud = [{
      id: crearIdServicioSolicitud(),
      servicio: solicitud?.servicio || "",
      descripcion: solicitud?.descripcion || "",

      fechaDeseada: solicitud?.fechaDeseada || "",
      horarioDeseado: solicitud?.horarioDeseado || "",

      audioFile: null,
      audioUrl: "",

      archivosLocales: [],
      archivosSubidos: Array.isArray(solicitud?.archivos) ? solicitud.archivos : [],
      archivosGaleriaUrl: solicitud?.archivosGaleriaUrl || "",
      archivosGaleriaId: solicitud?.archivosGaleriaId || "",

      prestadorAsignadoUid: solicitud?.prestadorAsignadoUid || "",
      prestadorAsignadoNombre: solicitud?.prestadorAsignadoNombre || "",
      estado: solicitud?.estado || "pendiente_derivar",
      tieneInforme: !!solicitud?.tieneInforme,
      informeId: solicitud?.informeId || ""
    }];
  }

  servicioActivoSolicitudId = serviciosDetalleSolicitud[0]?.id || "";
  renderServiciosDetalleSolicitud();
}

function sincronizarServicioDesdeDom(id) {
  const item = serviciosDetalleSolicitud.find(s => s.id === id);
  if (!item) return;

  const textarea = document.querySelector(`[data-servicio-descripcion="${id}"]`);
  const fecha = document.querySelector(`[data-servicio-fecha="${id}"]`);
  const horario = document.querySelector(`[data-servicio-horario="${id}"]`);

  if (textarea) item.descripcion = limpiar(textarea.value);
  if (fecha) item.fechaDeseada = limpiar(fecha.value);
  if (horario) item.horarioDeseado = limpiar(horario.value);
}

function sincronizarTodosLosServiciosDesdeDom() {
  serviciosDetalleSolicitud.forEach(item => {
    sincronizarServicioDesdeDom(item.id);
  });
}

function actualizarPickerServiciosSolicitud() {
  if (!solServiciosPicker) return;

  const activos = new Set(
    serviciosDetalleSolicitud
      .map(item => item.servicio)
      .filter(Boolean)
  );

  solServiciosPicker.querySelectorAll("[data-servicio-pick]").forEach(input => {
    input.checked = activos.has(input.value);
  });
}

function agregarServicioDesdePicker(nombre) {
  const servicio = limpiar(nombre);

  if (!servicio) return;

  sincronizarTodosLosServiciosDesdeDom();

  const existe = serviciosDetalleSolicitud.some(item => item.servicio === servicio);

  if (existe) {
    actualizarPickerServiciosSolicitud();
    return;
  }

  crearServicioDetalleSolicitud(servicio);
}

function quitarServicioDesdePicker(nombre) {
  const servicio = limpiar(nombre);

  if (!servicio) return;

  sincronizarTodosLosServiciosDesdeDom();

  serviciosDetalleSolicitud = serviciosDetalleSolicitud.filter(item => item.servicio !== servicio);

  if (servicioActivoSolicitudId && !serviciosDetalleSolicitud.some(item => item.id === servicioActivoSolicitudId)) {
    servicioActivoSolicitudId = serviciosDetalleSolicitud[0]?.id || "";
  }

  renderServiciosDetalleSolicitud();
}

function opcionesHorarioServicio(actual = "") {
  const horarios = [
    "7 a 11hs",
    "8 a 12hs",
    "9 a 13hs",
    "10 a 14hs",
    "11 a 15hs",
    "12 a 16hs",
    "13 a 17hs",
    "14 a 18hs",
    "15 a 19hs",
    "16 a 20hs",
    "17 a 21hs",
    "18 a 22hs"
  ];

  return `
    <option value="">Elegir franja</option>
    ${horarios.map(h => `
      <option value="${h}" ${actual === h ? "selected" : ""}>${h}</option>
    `).join("")}
  `;
}

function urlArchivoSolicitud(archivo) {
  return archivo?.urlCorta || archivo?.shortUrl || archivo?.url || "";
}

function renderMiniGaleriaArchivosSolicitud(archivos = []) {
  const lista = Array.isArray(archivos)
    ? archivos.filter(archivo => urlArchivoSolicitud(archivo))
    : [];

  if (!lista.length) return "";

  return `
    <div class="ms-mini-galeria-solicitud">
      ${lista.map((archivo, index) => {
        const url = urlArchivoSolicitud(archivo);
        const nombre = archivo.nombre || `Archivo ${index + 1}`;
        const tipo = archivo.tipo || archivo.mime || "";
        const tipoGeneral = archivo.tipoGeneral || "";

        const esImagen = String(tipo).startsWith("image/") || tipoGeneral === "Foto";
        const esVideo = String(tipo).startsWith("video/") || tipoGeneral === "Video";
        const esAudio = String(tipo).startsWith("audio/") || tipoGeneral === "Audio";

        let preview = `<i class="fa-solid fa-file"></i>`;

        if (esImagen) {
          preview = `<img src="${escaparHtml(url)}" alt="${escaparHtml(nombre)}" loading="lazy" />`;
        } else if (esVideo) {
          preview = `<i class="fa-solid fa-video"></i>`;
        } else if (esAudio) {
          preview = `<i class="fa-solid fa-microphone-lines"></i>`;
        }

        return `
          <a
            class="ms-mini-galeria-card"
            href="${escaparHtml(url)}"
            target="_blank"
            rel="noopener"
            title="Abrir archivo"
          >
            <div class="ms-mini-galeria-preview">
              ${preview}
            </div>
          </a>
        `;
      }).join("")}
    </div>
  `;
}

function renderServiciosDetalleSolicitud() {
  if (!solServiciosTabs || !solServiciosDetalle) return;

  if (!serviciosDetalleSolicitud.length) {
    solServiciosTabs.innerHTML = "";

    solServiciosDetalle.innerHTML = `
      <div class="ms-servicio-panel ms-servicio-empty">
        <p>Seleccioná uno o más servicios desde “Elegir servicios”.</p>
      </div>
    `;

    actualizarPickerServiciosSolicitud();
    return;
  }

  solServiciosTabs.innerHTML = serviciosDetalleSolicitud.map((item, index) => {
    const nombre = item.servicio || `Servicio ${index + 1}`;

    return `
      <button
        class="ms-servicio-tab ${item.id === servicioActivoSolicitudId ? "active" : ""}"
        data-servicio-tab="${item.id}"
        type="button"
      >
        <i class="${servicioIcono(item.servicio)}"></i>
        <span>${escaparHtml(nombre)}</span>
      </button>
    `;
  }).join("");

  solServiciosDetalle.innerHTML = serviciosDetalleSolicitud.map((item, index) => {
    const activo = item.id === servicioActivoSolicitudId;
    const archivosLocales = Array.isArray(item.archivosLocales) ? item.archivosLocales : [];
    const archivosGuardados = Array.isArray(item.archivosSubidos) ? item.archivosSubidos : [];

    return `
      <div class="ms-servicio-panel ${activo ? "" : "hidden"}" data-servicio-panel="${item.id}">
        <div class="ms-servicio-panel-head">
          <strong>${escaparHtml(item.servicio || `Servicio ${index + 1}`)}</strong>

          <button class="ms-mini-btn" data-servicio-quitar="${item.id}" type="button">
            <i class="fa-solid fa-trash"></i>
            Quitar
          </button>
        </div>

        <div class="ms-servicio-agenda">
          <label>
            Fecha deseada
            <input
              type="date"
              data-servicio-fecha="${item.id}"
              value="${escaparHtml(item.fechaDeseada || "")}"
            />
          </label>

          <label>
            Horario deseado
            <select data-servicio-horario="${item.id}">
              ${opcionesHorarioServicio(item.horarioDeseado || "")}
            </select>
          </label>
        </div>

        <label>
          Descripción del problema
          <textarea
            data-servicio-descripcion="${item.id}"
            rows="4"
            placeholder="Contanos qué necesitás para este servicio, qué pasó, desde cuándo ocurre y cualquier detalle importante"
          >${escaparHtml(item.descripcion || "")}</textarea>
        </label>

        <div class="ms-audio-box">
          <strong class="ms-label-title">Audio de este servicio</strong>

          <p class="ms-form-note">
            Grabá un audio específico para este servicio.
          </p>

          <div class="ms-audio-actions">
            <button class="ms-btn ms-btn-light" data-servicio-audio-grabar="${item.id}" type="button">
              <i class="fa-solid fa-microphone"></i>
              Grabar audio
            </button>

            <button class="ms-btn ms-btn-primary hidden" data-servicio-audio-detener="${item.id}" type="button">
              <i class="fa-solid fa-stop"></i>
              Detener
            </button>

            <button class="ms-btn ms-btn-light ${item.audioFile || item.audioUrl ? "" : "hidden"}" data-servicio-audio-borrar="${item.id}" type="button">
              <i class="fa-solid fa-trash"></i>
              Borrar audio
            </button>
          </div>

          <audio
            class="ms-audio-preview ${item.audioUrl ? "" : "hidden"}"
            data-servicio-audio-preview="${item.id}"
            ${item.audioUrl ? `src="${item.audioUrl}"` : ""}
            controls
          ></audio>

          <p class="ms-file-note" data-servicio-audio-estado="${item.id}">
            ${item.audioFile ? "Audio grabado listo para enviar." : "Sin audio grabado."}
          </p>
        </div>

        <div class="ms-file-box">
          <strong class="ms-label-title">Fotos, videos o audios de este servicio</strong>

          <p class="ms-form-note">
            Cargá archivos específicos para ${escaparHtml(item.servicio || "este servicio")}.
          </p>

          <label class="ms-file-input-row">
            <i class="fa-solid fa-cloud-arrow-up"></i>
            <span>Seleccionar archivos</span>
            <input data-servicio-archivos="${item.id}" type="file" accept="image/*,video/*,audio/*" multiple />
          </label>

          ${
            archivosLocales.length
              ? `<p class="ms-file-summary">Archivos seleccionados para guardar: ${archivosLocales.length}</p>`
              : ""
          }

          ${
            item.archivosGaleriaUrl
              ? `
                <p class="ms-file-note">
                  Galería de ${escaparHtml(item.servicio || "servicio")}:
                  <a href="${escaparHtml(item.archivosGaleriaUrl)}" target="_blank" rel="noopener">
                    Abrir galería
                  </a>
                </p>
              `
              : ""
          }

${renderMiniGaleriaArchivosSolicitud(archivosGuardados)}
       
          ${
            archivosGuardados.length && !item.archivosGaleriaUrl
              ? `<p class="ms-file-note">Este servicio ya tiene ${archivosGuardados.length} archivo(s) guardado(s).</p>`
              : ""
          }

          <p class="ms-file-summary hidden" data-servicio-archivos-resumen="${item.id}"></p>
        </div>
      </div>
    `;
  }).join("");

  actualizarPickerServiciosSolicitud();
}

function actualizarResumenArchivosServicio(id) {
  const resumen = document.querySelector(`[data-servicio-archivos-resumen="${id}"]`);
  const item = serviciosDetalleSolicitud.find(s => s.id === id);

  if (!resumen || !item) return;

  const archivos = Array.isArray(item.archivosLocales) ? item.archivosLocales : [];
  const total = archivos.length + (item.audioFile ? 1 : 0);

  if (!total) {
    resumen.classList.add("hidden");
    resumen.textContent = "";
    return;
  }

  const fotos = archivos.filter(a => a.type.startsWith("image/")).length;
  const videos = archivos.filter(a => a.type.startsWith("video/")).length;
  const audiosSubidos = archivos.filter(a => a.type.startsWith("audio/")).length;
  const audioGrabado = item.audioFile ? 1 : 0;
  const otros = archivos.length - fotos - videos - audiosSubidos;

  resumen.classList.remove("hidden");
  resumen.textContent =
    `Seleccionaste ${total} archivo(s): ` +
    `${fotos} foto(s), ${videos} video(s), ${audiosSubidos + audioGrabado} audio(s)` +
    `${otros ? `, ${otros} otro(s)` : ""}.`;
}

function borrarAudioServicioSolicitud(id, mostrarMensaje = true) {
  const item = serviciosDetalleSolicitud.find(s => s.id === id);
  if (!item) return;

  if (audioServicioSolicitud.stream && audioServicioSolicitud.id === id) {
    audioServicioSolicitud.stream.getTracks().forEach(track => track.stop());
  }

  if (item.audioUrl) {
    URL.revokeObjectURL(item.audioUrl);
  }

  item.audioFile = null;
  item.audioUrl = "";

  audioServicioSolicitud = {
    id: "",
    recorder: null,
    stream: null,
    chunks: []
  };

  renderServiciosDetalleSolicitud();

  if (mostrarMensaje) {
    toastMsg("Audio borrado");
  }
}

async function iniciarAudioServicioSolicitud(id) {
  const item = serviciosDetalleSolicitud.find(s => s.id === id);
  if (!item) return;

  try {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      toastMsg("Tu navegador no permite grabar audio desde la web");
      return;
    }

    borrarAudioServicioSolicitud(id, false);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const opciones = {};
    if (MediaRecorder.isTypeSupported("audio/webm")) {
      opciones.mimeType = "audio/webm";
    }

    const recorder = new MediaRecorder(stream, opciones);
    const chunks = [];

    audioServicioSolicitud = {
      id,
      recorder,
      stream,
      chunks
    };

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener("stop", () => {
      const tipo = recorder.mimeType || "audio/webm";
      const extension = obtenerExtensionAudio(tipo);

      const blob = new Blob(chunks, { type: tipo });
      const file = new File(
        [blob],
        `audio-servicio-${Date.now()}.${extension}`,
        { type: tipo }
      );

      item.audioFile = file;
      item.audioUrl = URL.createObjectURL(blob);

      stream.getTracks().forEach(track => track.stop());

      audioServicioSolicitud = {
        id: "",
        recorder: null,
        stream: null,
        chunks: []
      };

      renderServiciosDetalleSolicitud();
    });

    recorder.start();

    const btnGrabar = document.querySelector(`[data-servicio-audio-grabar="${id}"]`);
    const btnDetener = document.querySelector(`[data-servicio-audio-detener="${id}"]`);
    const estado = document.querySelector(`[data-servicio-audio-estado="${id}"]`);

    btnGrabar?.classList.add("hidden");
    btnDetener?.classList.remove("hidden");

    if (estado) {
      estado.textContent = "Grabando audio...";
    }

  } catch (error) {
    console.error(error);
    toastMsg("No se pudo iniciar la grabación");
  }
}

function detenerAudioServicioSolicitud(id) {
  if (audioServicioSolicitud.id !== id) return;

  const recorder = audioServicioSolicitud.recorder;

  if (recorder && recorder.state === "recording") {
    recorder.stop();
  }
}

function obtenerArchivosServicioSolicitud(id) {
  const item = serviciosDetalleSolicitud.find(s => s.id === id);

  const archivos = Array.isArray(item?.archivosLocales)
    ? [...item.archivosLocales]
    : [];

  if (item?.audioFile) {
    archivos.push(item.audioFile);
  }

  return archivos;
}

function validarArchivoServicio(archivo) {
  const tipo = archivo.type || "";

  if (!tipo.startsWith("image/") && !tipo.startsWith("video/") && !tipo.startsWith("audio/")) {
    throw new Error(`Archivo no permitido: ${archivo.name}`);
  }

  if (archivo.size > MAX_BYTES_ARCHIVO_SOLICITUD) {
    throw new Error(`El archivo ${archivo.name} supera ${MAX_MB_ARCHIVO_SOLICITUD}MB`);
  }
}

async function obtenerServiciosDetalleParaGuardar(telefono) {
  sincronizarTodosLosServiciosDesdeDom();

  const limpios = serviciosDetalleSolicitud
    .map(item => ({
      ...item,
      servicio: limpiar(item.servicio),
      descripcion: limpiar(item.descripcion),
      fechaDeseada: limpiar(item.fechaDeseada),
      horarioDeseado: limpiar(item.horarioDeseado)
    }))
    .filter(item => item.servicio);

  if (!limpios.length) {
    throw new Error("Agregá al menos un servicio");
  }

  const resultado = [];

  for (const item of limpios) {
    const archivosLocales = obtenerArchivosServicioSolicitud(item.id);

    if (archivosLocales.length > MAX_ARCHIVOS_SOLICITUD) {
      throw new Error(`En ${item.servicio}, cargá hasta ${MAX_ARCHIVOS_SOLICITUD} archivos`);
    }

    archivosLocales.forEach(validarArchivoServicio);

    let subida = {
      archivos: [],
      galeriaId: item.archivosGaleriaId || "",
      galeriaUrl: item.archivosGaleriaUrl || "",
      vencenEn: ""
    };

    if (archivosLocales.length) {
  subida = await subirArchivosSolicitud(
  archivosLocales,
  telefono,
  {
    titulo: `Archivos de ${item.servicio}`,
    descripcion: item.descripcion || ""
  }
);
    }

    const archivosFinales = [
      ...(Array.isArray(item.archivosSubidos) ? item.archivosSubidos : []),
      ...(subida.archivos || [])
    ];

    resultado.push({
      id: item.id,
      servicio: item.servicio,
      descripcion: item.descripcion,

      fechaDeseada: item.fechaDeseada || "",
      horarioDeseado: item.horarioDeseado || "",

      archivos: archivosFinales,
      archivosCantidad: archivosFinales.length,

      archivosGaleriaId: subida.galeriaId || item.archivosGaleriaId || "",
      archivosGaleriaUrl: subida.galeriaUrl || item.archivosGaleriaUrl || "",
      archivosVencenEn: subida.vencenEn || "",

      prestadorAsignadoUid: item.prestadorAsignadoUid || "",
      prestadorAsignadoNombre: item.prestadorAsignadoNombre || "",
      estado: item.estado || "pendiente_derivar",
      tieneInforme: !!item.tieneInforme,
      informeId: item.informeId || ""
    });
  }

  return resultado;
}

function servicioResumenDesdeDetalle(serviciosDetalle) {
  const nombres = (Array.isArray(serviciosDetalle) ? serviciosDetalle : [])
    .map(s => s.servicio)
    .filter(Boolean);

  return nombres.length ? nombres.join(" + ") : "";
}

function descripcionResumenDesdeDetalle(serviciosDetalle) {
  return (Array.isArray(serviciosDetalle) ? serviciosDetalle : [])
    .map(item => {
      const texto = limpiar(item.descripcion);
      return texto ? `[${item.servicio}]\n${texto}` : `[${item.servicio}]`;
    })
    .join("\n\n");
}

function archivosPlanosDesdeDetalle(serviciosDetalle) {
  return (Array.isArray(serviciosDetalle) ? serviciosDetalle : [])
    .flatMap(item => Array.isArray(item.archivos) ? item.archivos : []);
}

function galeriaPrincipalDesdeDetalle(serviciosDetalle) {
  const item = (Array.isArray(serviciosDetalle) ? serviciosDetalle : [])
    .find(s => s.archivosGaleriaUrl);

  return item?.archivosGaleriaUrl || "";
}

function actualizarResumenArchivosSolicitud() {
  if (!solArchivosResumen) return;

  const archivos = Array.from(solArchivos?.files || []);
  const total = archivos.length + (audioSolicitudFile ? 1 : 0);

  if (!total) {
    solArchivosResumen.classList.add("hidden");
    solArchivosResumen.textContent = "";
    return;
  }

  const fotos = archivos.filter(a => a.type.startsWith("image/")).length;
  const videos = archivos.filter(a => a.type.startsWith("video/")).length;
  const audiosSubidos = archivos.filter(a => a.type.startsWith("audio/")).length;
  const audioGrabado = audioSolicitudFile ? 1 : 0;
  const otros = archivos.length - fotos - videos - audiosSubidos;

  solArchivosResumen.classList.remove("hidden");
  solArchivosResumen.textContent =
    `Seleccionaste ${total} archivo(s): ` +
    `${fotos} foto(s), ${videos} video(s), ${audiosSubidos + audioGrabado} audio(s)` +
    `${otros ? `, ${otros} otro(s)` : ""}.`;
}

function borrarAudioSolicitud(mostrarMensaje = true) {
  if (streamAudioSolicitud) {
    streamAudioSolicitud.getTracks().forEach(track => track.stop());
  }

  streamAudioSolicitud = null;
  mediaRecorderSolicitud = null;
  audioChunksSolicitud = [];
  audioSolicitudBlob = null;
  audioSolicitudFile = null;

  if (audioSolicitudUrl) {
    URL.revokeObjectURL(audioSolicitudUrl);
  }

  audioSolicitudUrl = "";

  if (solAudioPreview) {
    solAudioPreview.pause();
    solAudioPreview.removeAttribute("src");
    solAudioPreview.classList.add("hidden");
  }

  btnAudioGrabar?.classList.remove("hidden");
  btnAudioDetener?.classList.add("hidden");
  btnAudioBorrar?.classList.add("hidden");

  if (solAudioEstado) {
    solAudioEstado.textContent = "Sin audio grabado.";
  }

  actualizarResumenArchivosSolicitud();

  if (mostrarMensaje) {
    toastMsg("Audio borrado");
  }
}

async function iniciarGrabacionSolicitud() {
  try {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      toastMsg("Tu navegador no permite grabar audio desde la web");
      return;
    }

    borrarAudioSolicitud(false);

    streamAudioSolicitud = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const opciones = {};

    if (MediaRecorder.isTypeSupported("audio/webm")) {
      opciones.mimeType = "audio/webm";
    }

    mediaRecorderSolicitud = new MediaRecorder(streamAudioSolicitud, opciones);
    audioChunksSolicitud = [];

    mediaRecorderSolicitud.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) {
        audioChunksSolicitud.push(event.data);
      }
    });

    mediaRecorderSolicitud.addEventListener("stop", () => {
      const tipo = mediaRecorderSolicitud?.mimeType || "audio/webm";
      const extension = obtenerExtensionAudio(tipo);

      audioSolicitudBlob = new Blob(audioChunksSolicitud, {
        type: tipo
      });

      audioSolicitudFile = new File(
        [audioSolicitudBlob],
        `audio-solicitud-${Date.now()}.${extension}`,
        { type: tipo }
      );

      audioSolicitudUrl = URL.createObjectURL(audioSolicitudBlob);

      if (solAudioPreview) {
        solAudioPreview.src = audioSolicitudUrl;
        solAudioPreview.classList.remove("hidden");
      }

      if (solAudioEstado) {
        solAudioEstado.textContent = "Audio grabado listo para enviar.";
      }

      btnAudioGrabar?.classList.remove("hidden");
      btnAudioDetener?.classList.add("hidden");
      btnAudioBorrar?.classList.remove("hidden");

      if (streamAudioSolicitud) {
        streamAudioSolicitud.getTracks().forEach(track => track.stop());
      }

      streamAudioSolicitud = null;

      actualizarResumenArchivosSolicitud();
    });

    mediaRecorderSolicitud.start();

    btnAudioGrabar?.classList.add("hidden");
    btnAudioDetener?.classList.remove("hidden");
    btnAudioBorrar?.classList.add("hidden");

    if (solAudioEstado) {
      solAudioEstado.textContent = "Grabando audio...";
    }
  } catch (error) {
    console.error(error);
    toastMsg("No se pudo iniciar la grabación");
    borrarAudioSolicitud(false);
  }
}

function detenerGrabacionSolicitud() {
  if (!mediaRecorderSolicitud) return;

  if (mediaRecorderSolicitud.state === "recording") {
    mediaRecorderSolicitud.stop();
  }
}

function obtenerArchivosSolicitudParaSubir() {
  const archivos = Array.from(solArchivos?.files || []);

  if (audioSolicitudFile) {
    archivos.push(audioSolicitudFile);
  }

  return archivos;
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
    serviciosDetalle: Array.isArray(data.serviciosDetalle) ? data.serviciosDetalle : [],
    serviciosCantidad: Array.isArray(data.serviciosDetalle) ? data.serviciosDetalle.length : 0,

    emergencia: data.emergencia,
    zona: data.zona,
    localidad: data.localidad || "",
    partido: data.partido || "",
    provincia: data.provincia || "",
    direccion: data.direccion,
    lat: data.lat || null,
    lon: data.lon || null,
    geo: data.geo || null,

    fechaDeseada: data.fechaDeseada,
    horarioDeseado: data.horarioDeseado,

    descripcion: data.descripcion,
    archivos: data.archivos || [],
    archivosCantidad: Array.isArray(data.archivos) ? data.archivos.length : 0,
    archivosGaleriaId: data.archivosGaleriaId || "",
    archivosGaleriaUrl: data.archivosGaleriaUrl || "",
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

async function guardarPrestadorManual(data, servicioSugerido = "") {
  if (!esAdminActual()) {
    toastMsg("Solo el admin puede agregar prestadores manualmente");
    return;
  }

  const ref = doc(collection(db, "prestadores"));

  const habilidades = Array.isArray(data.habilidades) ? [...data.habilidades] : [];

  if (servicioSugerido && !habilidades.includes(servicioSugerido)) {
    habilidades.push(servicioSugerido);
  }

  await setDoc(ref, {
    uid: ref.id,
    email: "",
    nombre: data.nombre,
    telefono: data.telefono,
    zona: data.zona,
    movilidadHerramientas: true,
    habilidades,
    comentario: data.comentario,
    habilitado: true,
    entrevistaEstado: "habilitado",
    altaManual: true,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp()
  });

  toastMsg("Prestador agregado y habilitado");
}

function abrirAltaManualPrestador(servicio = "") {
  prestadorAltaManualServicio = servicio || "";

  formPrestador?.reset();

  document.querySelectorAll("[data-prestador-zona]").forEach(input => {
    input.checked = false;
  });

  prestadorHabilidades?.querySelectorAll("input").forEach(input => {
    input.checked = servicio && input.value === servicio;
  });

  const titulo = modalPrestador?.querySelector("h2");
  const texto = modalPrestador?.querySelector(".ms-muted");
  const submit = formPrestador?.querySelector("button[type='submit']");

  if (titulo) {
    titulo.textContent = servicio
      ? `Agregar prestador para ${servicio}`
      : "Agregar prestador";
  }

  if (texto) {
    texto.textContent = "Alta manual desde el panel interno. El prestador quedará habilitado.";
  }

  if (submit) {
    submit.innerHTML = `<i class="fa-solid fa-user-plus"></i> Agregar prestador`;
  }

  abrirModal(modalPrestador);
}

function restaurarModalPrestadorPublico() {
  prestadorAltaManualServicio = "";

  const titulo = modalPrestador?.querySelector("h2");
  const texto = modalPrestador?.querySelector(".ms-muted");
  const submit = formPrestador?.querySelector("button[type='submit']");

  if (titulo) {
    titulo.textContent = "Inscripción para prestar servicios";
  }

  if (texto) {
    texto.textContent = "Esta inscripción no habilita automáticamente. Primero queda pendiente para entrevista y aprobación del admin.";
  }

  if (submit) {
    submit.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar inscripción`;
  }
}

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

const ESTADOS_OPERATIVOS = [
  { id: "pendiente_derivar", label: "Pendiente" },
  { id: "programado", label: "Coordinado" },
  { id: "derivado", label: "Derivado" },
  { id: "en_lugar", label: "Técnico en el lugar" },
  { id: "cerrado", label: "Terminado" },
  { id: "garantia", label: "Garantía" },
  { id: "cancelado", label: "Cancelado" }
];

let filtrosPanelEquipo = {
  fecha: "",
  horario: "",
  servicio: "",
  estado: "",
  prestador: "",
  texto: "",
  rapido: ""
};

let resumenPanelEquipoAbierto = false;
let filtrosManualEquipoAbierto = false;

function filtrosPanelEquipoVacios() {
  return {
    fecha: "",
    horario: "",
    servicio: "",
    estado: "",
    prestador: "",
    texto: "",
    rapido: ""
  };
}

function obtenerEstadoOperativo(estado) {
  const normalizado = estado || "pendiente_derivar";

  return ESTADOS_OPERATIVOS.find(e => e.id === normalizado)
    || ESTADOS_OPERATIVOS[0];
}

function serviciosDetallePanel(s) {
  const detalles = Array.isArray(s?.serviciosDetalle)
    ? s.serviciosDetalle.filter(item => item && item.servicio)
    : [];

  if (detalles.length) {
    return detalles.map((item, index) => ({
      ...item,
      id: item.id || `servicio-${index}`,
      servicio: item.servicio || s.servicio || "Servicio",
      descripcion: item.descripcion || "",
      fechaDeseada: item.fechaDeseada || s.fechaDeseada || "",
      horarioDeseado: item.horarioDeseado || s.horarioDeseado || "",
      estado: item.estado || s.estado || "pendiente_derivar",
      prestadorAsignadoUid: item.prestadorAsignadoUid || "",
      prestadorAsignadoNombre: item.prestadorAsignadoNombre || "",
      archivos: Array.isArray(item.archivos) ? item.archivos : [],
      archivosGaleriaUrl: item.archivosGaleriaUrl || "",
      archivosGaleriaId: item.archivosGaleriaId || "",
      tieneInforme: !!item.tieneInforme,
      informeId: item.informeId || ""
    }));
  }

  return [{
    id: "principal",
    servicio: s.servicio || "Servicio",
    descripcion: s.descripcion || "",
    fechaDeseada: s.fechaDeseada || "",
    horarioDeseado: s.horarioDeseado || "",
    estado: s.estado || "pendiente_derivar",
    prestadorAsignadoUid: s.prestadorAsignadoUid || "",
    prestadorAsignadoNombre: s.prestadorAsignadoNombre || "",
    archivos: Array.isArray(s.archivos) ? s.archivos : [],
    archivosGaleriaUrl: s.archivosGaleriaUrl || s.galeriaUrl || "",
    archivosGaleriaId: s.archivosGaleriaId || "",
    tieneInforme: !!s.tieneInforme,
    informeId: s.informeId || ""
  }];
}

function servicioDetallePorId(solicitud, servicioId) {
  return serviciosDetallePanel(solicitud).find(item => String(item.id) === String(servicioId))
    || serviciosDetallePanel(solicitud)[0]
    || null;
}

function serviciosMarcadosParaWhatsApp(solicitud) {
  if (!solicitud?.id) return [];

  const marcados = Array.from(document.querySelectorAll("[data-ruta-check]"))
    .filter(check => check.checked && check.dataset.rutaCheck === solicitud.id)
    .map(check => check.dataset.servicioId || "principal");

  if (!marcados.length) return [];

  const ids = new Set(marcados.map(String));

  return serviciosDetallePanel(solicitud).filter(item => {
    return ids.has(String(item.id || "principal"));
  });
}

function fechaServicioPanel(s, item) {
  return item?.fechaDeseada || s.fechaDeseada || "";
}

function textoFechaServicioPanel(s, item) {
  const fecha = fechaServicioPanel(s, item);

  if (fecha) {
    return fechaDeseadaBonita(fecha);
  }

  return "Sin coordinar";
}

function horarioServicioPanel(s, item) {
  return item?.horarioDeseado || s.horarioDeseado || "Sin horario";
}

function estadoServicioPanel(s, item) {
  return item?.estado || s.estado || "pendiente_derivar";
}

function prestadorServicioPanel(s, item) {
  return item?.prestadorAsignadoNombre
    || item?.prestadorAsignadoUid
    || s.prestadorAsignadoNombre
    || s.prestadorNombre
    || s.prestadorAsignadoUid
    || "Sin prestador";
}

function galeriaServicioPanel(s, item) {
  return item?.archivosGaleriaUrl || s.archivosGaleriaUrl || s.galeriaUrl || "";
}

function tieneArchivosServicioPanel(s, item) {
  return !!galeriaServicioPanel(s, item)
    || (Array.isArray(item?.archivos) && item.archivos.length > 0)
    || (Array.isArray(s.archivos) && s.archivos.length > 0);
}

function servicioSinCoordinar(s, item) {
  return !fechaServicioPanel(s, item) || horarioServicioPanel(s, item) === "Sin horario";
}

function claseFilaServicioEstado(s, item) {
  if (servicioSinCoordinar(s, item)) {
    return "estado-sin-coordinar";
  }

  return claseFilaEstado(estadoServicioPanel(s, item), null);
}

function actualizarServicioDetalleLocal(solicitud, servicioId, cambios) {
  const detallesOriginales = Array.isArray(solicitud.serviciosDetalle)
    ? solicitud.serviciosDetalle
    : [];

  if (!detallesOriginales.length || servicioId === "principal") {
    return null;
  }

  return detallesOriginales.map(item => {
    if (String(item.id) !== String(servicioId)) return item;

    return {
      ...item,
      ...cambios
    };
  });
}

function obtenerServiciosMarcadosParaBorrar() {
  return Array.from(document.querySelectorAll("[data-ruta-check]:checked"))
    .map(check => ({
      solicitudId: check.dataset.rutaCheck || "",
      servicioId: check.dataset.servicioId || ""
    }))
    .filter(item => item.solicitudId);
}

async function borrarServiciosMarcados(solicitudes) {
  const marcados = obtenerServiciosMarcadosParaBorrar();

  if (!marcados.length) {
    toastMsg("Marcá al menos un servicio para borrar");
    return;
  }

  const confirma = window.confirm(
    `¿Borrar ${marcados.length} servicio(s) marcado(s)? Esta acción no se puede deshacer.`
  );

  if (!confirma) return;

  const mapa = new Map();
  solicitudes.forEach(s => mapa.set(s.id, s));

  const porSolicitud = new Map();

  marcados.forEach(item => {
    if (!porSolicitud.has(item.solicitudId)) {
      porSolicitud.set(item.solicitudId, new Set());
    }

    porSolicitud.get(item.solicitudId).add(item.servicioId);
  });

  try {
    for (const [solicitudId, serviciosIds] of porSolicitud.entries()) {
      const solicitud = mapa.get(solicitudId);
      if (!solicitud) continue;

      const detalles = Array.isArray(solicitud.serviciosDetalle)
        ? solicitud.serviciosDetalle
        : [];

      /*
        Si es una solicitud vieja sin serviciosDetalle,
        o si se marcaron todos los servicios,
        borramos la solicitud completa.
      */
      if (!detalles.length || serviciosIds.has("principal")) {
        await deleteDoc(doc(db, "solicitudes", solicitudId));
        continue;
      }

      const restantes = detalles.filter(item => !serviciosIds.has(String(item.id)));

      if (!restantes.length) {
        await deleteDoc(doc(db, "solicitudes", solicitudId));
        continue;
      }

      const primerServicio = restantes[0];

      await updateDoc(doc(db, "solicitudes", solicitudId), {
        serviciosDetalle: restantes,
        serviciosCantidad: restantes.length,
        servicio: primerServicio.servicio || "",
        fechaDeseada: primerServicio.fechaDeseada || "",
        horarioDeseado: primerServicio.horarioDeseado || "",
        descripcion: primerServicio.descripcion || "",
        actualizadoEn: serverTimestamp()
      });
    }

    hojaRutaSeleccion.clear();
    toastMsg("Servicios borrados");
    await renderEquipo();

  } catch (error) {
    console.error(error);
    toastMsg("No se pudieron borrar los servicios");
  }
}

function fechaSolicitudFiltro(s) {
  const servicios = serviciosDetallePanel(s);
  const primerConFecha = servicios.find(item => item.fechaDeseada);

  return primerConFecha?.fechaDeseada || s.fechaDeseada || "";
}

function textoFechaDeseadaPanel(s) {
  if (s.fechaDeseada) {
    return fechaDeseadaBonita(s.fechaDeseada);
  }

  return "Sin coordinar";
}

function zonaSolicitudPanel(s) {
  return s.zona || s.localidad || s.partido || "Sin zona";
}

function horarioSolicitudPanel(s) {
  const servicios = serviciosDetallePanel(s);
  const primerConHorario = servicios.find(item => item.horarioDeseado);

  return primerConHorario?.horarioDeseado || s.horarioDeseado || "Sin horario";
}

function prestadorSolicitudPanel(s) {
  const servicios = serviciosDetallePanel(s);
  const primerConPrestador = servicios.find(item => item.prestadorAsignadoNombre || item.prestadorAsignadoUid);

  return primerConPrestador?.prestadorAsignadoNombre
    || primerConPrestador?.prestadorAsignadoUid
    || s.prestadorAsignadoNombre
    || s.prestadorNombre
    || s.prestadorAsignadoUid
    || "Sin prestador";
}

function obtenerOpcionesUnicas(items, getter) {
  return Array.from(
    new Set(
      items
        .map(getter)
        .filter(Boolean)
        .filter(x => x !== "Sin zona" && x !== "Sin horario" && x !== "Sin prestador")
    )
  ).sort((a, b) => String(a).localeCompare(String(b), "es"));
}

function filtrarSolicitudesEquipo(solicitudes) {
  const f = filtrosPanelEquipo;

  return solicitudes.filter(s => {
    const servicios = serviciosDetallePanel(s);

    const textoTodo = [
      s.clienteNombre,
      s.clienteTelefono,
      s.servicio,
      s.zona,
      s.localidad,
      s.partido,
      s.direccion,
      s.descripcion,
      prestadorSolicitudPanel(s),
      s.estado,
      ...servicios.flatMap(item => [
        item.servicio,
        item.descripcion,
        item.fechaDeseada,
        item.horarioDeseado,
        item.estado,
        prestadorServicioPanel(s, item)
      ])
    ].filter(Boolean).join(" ").toLowerCase();

    if (f.rapido === "hoy") {
      const hoy = hoyInputFecha();
      if (!servicios.some(item => fechaServicioPanel(s, item) === hoy)) return false;
    }

    if (f.rapido === "emergencias" && !s.emergencia) return false;

    if (f.rapido === "sinPrestador") {
      const sinPrestador = servicios.some(item => {
        return prestadorServicioPanel(s, item) === "Sin prestador";
      });

      if (!sinPrestador) return false;
    }

    if (f.rapido === "coordinados") {
      if (!servicios.some(item => estadoServicioPanel(s, item) === "programado")) return false;
    }

    if (f.rapido === "pendientes") {
      const pendiente = servicios.some(item => {
        const estado = estadoServicioPanel(s, item);
        return estado === "pendiente_derivar" || estado === "nuevo";
      });

      if (!pendiente) return false;
    }

    if (f.rapido === "terminados") {
      if (!servicios.some(item => estadoServicioPanel(s, item) === "cerrado")) return false;
    }

    if (f.fecha && !servicios.some(item => fechaServicioPanel(s, item) === f.fecha)) return false;
    if (f.horario && !servicios.some(item => horarioServicioPanel(s, item) === f.horario)) return false;
    if (f.servicio && !servicios.some(item => item.servicio === f.servicio)) return false;
    if (f.estado && !servicios.some(item => estadoServicioPanel(s, item) === f.estado)) return false;
    if (f.prestador && !servicios.some(item => prestadorServicioPanel(s, item) === f.prestador)) return false;
    if (f.texto && !textoTodo.includes(f.texto.toLowerCase())) return false;

    return true;
  });
}

function resumenSolicitudesEquipo(solicitudes) {
  const hoyKey = hoyInputFecha();

  return {
    total: solicitudes.length,

    hoy: solicitudes.filter(s => {
      return serviciosDetallePanel(s).some(item => fechaServicioPanel(s, item) === hoyKey);
    }).length,

    pendientes: solicitudes.filter(s => {
      return serviciosDetallePanel(s).some(item => {
        const estado = estadoServicioPanel(s, item);
        return estado === "pendiente_derivar" || estado === "nuevo";
      });
    }).length,

    coordinados: solicitudes.filter(s => {
      return serviciosDetallePanel(s).some(item => estadoServicioPanel(s, item) === "programado");
    }).length,

    emergencias: solicitudes.filter(s => !!s.emergencia).length,

    sinPrestador: solicitudes.filter(s => {
      return serviciosDetallePanel(s).some(item => prestadorServicioPanel(s, item) === "Sin prestador");
    }).length,

    terminados: solicitudes.filter(s => {
      return serviciosDetallePanel(s).some(item => estadoServicioPanel(s, item) === "cerrado");
    }).length
  };
}

function renderResumenEquipo(solicitudes) {
  const r = resumenSolicitudesEquipo(solicitudes);

  const items = [
    {
      id: "hoy",
      label: "Hoy",
      valor: r.hoy,
      clase: "",
      icono: "fa-calendar-day"
    },
    {
      id: "emergencias",
      label: "Emergencias",
      valor: r.emergencias,
      clase: "soft-red",
      icono: "fa-triangle-exclamation"
    },
    {
      id: "sinPrestador",
      label: "Sin prestador",
      valor: r.sinPrestador,
      clase: "",
      icono: "fa-user-slash"
    },
    {
      id: "coordinados",
      label: "Coordinados",
      valor: r.coordinados,
      clase: "soft-blue",
      icono: "fa-calendar-check"
    },
    {
      id: "pendientes",
      label: "Pendientes",
      valor: r.pendientes,
      clase: "soft-yellow",
      icono: "fa-clock"
    },
    {
      id: "terminados",
      label: "Terminados",
      valor: r.terminados,
      clase: "soft-green",
      icono: "fa-circle-check"
    }
  ];

  return `
    <div
      class="ms-board-summary-wrap ${resumenPanelEquipoAbierto ? "open" : ""}"
      data-resumen-equipo-box
    >
      <button class="ms-board-summary-main" data-toggle-resumen-equipo type="button">
        <span>
          <i class="fa-solid fa-table-list"></i>
          Solicitudes recibidas
        </span>

        <strong>${r.total}</strong>

        <i class="fa-solid ${resumenPanelEquipoAbierto ? "fa-chevron-up" : "fa-chevron-down"}"></i>
      </button>

      <div class="ms-board-summary">
        ${items.map(item => `
          <button
            class="ms-board-summary-card ${item.clase} ${filtrosPanelEquipo.rapido === item.id ? "active" : ""}"
            data-filtro-rapido-equipo="${item.id}"
            type="button"
          >
            <span>
              <i class="fa-solid ${item.icono}"></i>
              ${item.label}
            </span>

            <strong>${item.valor}</strong>
          </button>
        `).join("")}

        <div class="ms-board-summary-extra">
          <button class="ms-board-summary-action" data-ver-todo-equipo type="button">
            <i class="fa-solid fa-list"></i>
            <span>Ver todo</span>
          </button>

          <button class="ms-board-summary-action" data-abrir-filtros-manual-equipo type="button">
            <i class="fa-solid fa-sliders"></i>
            <span>Filtro manual</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderSelectFiltro(nombre, valorActual, opciones, placeholder) {
  return `
    <select data-filtro-equipo="${nombre}">
      <option value="">${placeholder}</option>
      ${opciones.map(op => `
        <option value="${escaparHtml(op)}" ${op === valorActual ? "selected" : ""}>
          ${escaparHtml(op)}
        </option>
      `).join("")}
    </select>
  `;
}

function renderFiltrosEquipo(solicitudes) {
  const serviciosFlat = solicitudes.flatMap(s => {
    return serviciosDetallePanel(s).map(item => ({
      solicitud: s,
      item
    }));
  });

  const horarios = obtenerOpcionesUnicas(serviciosFlat, x => horarioServicioPanel(x.solicitud, x.item));
  const servicios = obtenerOpcionesUnicas(serviciosFlat, x => x.item.servicio || "");
  const prestadores = obtenerOpcionesUnicas(serviciosFlat, x => prestadorServicioPanel(x.solicitud, x.item));

  return `
    <div
      id="modalFiltrosEquipo"
      class="ms-modal ms-filtros-equipo-modal ${filtrosManualEquipoAbierto ? "" : "hidden"}"
    >
      <div class="ms-modal-card ms-modal-wide">
        <button
          class="ms-modal-close"
          data-cerrar-filtros-manual-equipo
          type="button"
          aria-label="Cerrar filtros"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <span class="ms-kicker">Filtro manual</span>
        <h2>Filtrar solicitudes</h2>
        <p class="ms-muted">
          Elegí día, horario, servicio, estado, prestador o buscá por cliente, teléfono o dirección.
        </p>

        <div class="ms-board-filters">
          <label>
            Día
            <input type="date" data-filtro-equipo="fecha" value="${escaparHtml(filtrosPanelEquipo.fecha)}" />
          </label>

          <label>
            Horario
            ${renderSelectFiltro("horario", filtrosPanelEquipo.horario, horarios, "Todos")}
          </label>

          <label>
            Servicio
            ${renderSelectFiltro("servicio", filtrosPanelEquipo.servicio, servicios, "Todos")}
          </label>

          <label>
            Estado
            <select data-filtro-equipo="estado">
              <option value="">Todos</option>
              ${ESTADOS_OPERATIVOS.map(e => `
                <option value="${e.id}" ${filtrosPanelEquipo.estado === e.id ? "selected" : ""}>
                  ${e.label}
                </option>
              `).join("")}
            </select>
          </label>

          <label>
            Prestador
            ${renderSelectFiltro("prestador", filtrosPanelEquipo.prestador, prestadores, "Todos")}
          </label>

          <label class="ms-board-search">
            Buscar
            <input type="search" data-filtro-equipo="texto" value="${escaparHtml(filtrosPanelEquipo.texto)}" placeholder="Cliente, teléfono, dirección..." />
          </label>

          <button class="ms-mini-btn" data-limpiar-filtros-equipo type="button">
            <i class="fa-solid fa-eraser"></i>
            Limpiar filtros
          </button>

          <button class="ms-mini-btn red" data-ver-planilla-equipo type="button">
            <i class="fa-solid fa-table-list"></i>
            Ver planilla
          </button>
        </div>
      </div>
    </div>
  `;
}

function tieneArchivosSolicitud(s) {
  return Array.isArray(s.archivos) && s.archivos.length > 0;
}

function urlGaleriaSolicitud(s) {
  return s.archivosGaleriaUrl || s.galeriaUrl || "";
}

function solicitudSinCoordinar(s) {
  return !s?.fechaDeseada || !s?.horarioDeseado;
}

function claseFilaEstado(estado, solicitud = null) {
  if (solicitud && solicitudSinCoordinar(solicitud)) {
    return "estado-sin-coordinar";
  }

  const e = estado || "pendiente_derivar";

  if (e === "programado") return "estado-coordinado";
  if (e === "derivado") return "estado-derivado";
  if (e === "en_lugar") return "estado-en-lugar";
  if (e === "cerrado") return "estado-terminado";
  if (e === "garantia") return "estado-garantia";
  if (e === "cancelado") return "estado-cancelado";

  return "estado-pendiente";
}

function renderEstadoSelect(s, servicioItem = null) {
  const actual = servicioItem
    ? estadoServicioPanel(s, servicioItem)
    : (s.estado || "pendiente_derivar");

  const clase = servicioItem
    ? claseFilaServicioEstado(s, servicioItem)
    : claseFilaEstado(actual, s);

  const servicioId = servicioItem?.id || "";

  return `
    <select
      class="ms-estado-select ${clase}"
      data-estado-servicio="${s.id}"
      data-servicio-id="${escaparHtml(servicioId)}"
    >
      ${ESTADOS_OPERATIVOS.map(e => `
        <option value="${e.id}" ${e.id === actual ? "selected" : ""}>
          ${e.label}
        </option>
      `).join("")}
    </select>
  `;
}

function renderSolicitudFila(s) {
  const servicios = serviciosDetallePanel(s);

  const cliente = s.clienteNombre || "Sin cliente";
  const telefono = s.clienteTelefono || "Sin teléfono";
  const direccion = s.direccion || "Sin dirección";
  const zona = [s.localidad, s.partido].filter(Boolean).join(" · ");
  const destino = s.lat && s.lon
    ? `${s.lat},${s.lon}`
    : direccion;

  const header = `
    <tr class="ms-solicitud-grupo-row">
      <td colspan="7">
        <div class="ms-solicitud-grupo-head">
          <div>
            <strong>${escaparHtml(cliente)}</strong>
            <small>${escaparHtml(telefono)} · ${escaparHtml(direccion)}${zona ? ` · ${escaparHtml(zona)}` : ""}</small>
          </div>

          <div class="ms-solicitud-grupo-actions">
            <button
              class="ms-mini-btn ms-mini-btn-whatsapp ms-client-action-btn"
              data-wa-solicitud-marcados="${s.id}"
              type="button"
              title="Enviar WhatsApp con los servicios marcados"
              aria-label="Enviar WhatsApp con los servicios marcados"
            >
              <i class="fa-brands fa-whatsapp"></i>
              <span class="ms-action-text">WhatsApp</span>
            </button>

            <button
              class="ms-mini-btn ms-client-action-btn"
              data-editar-solicitud="${s.id}"
              type="button"
              title="Editar solicitud"
              aria-label="Editar solicitud"
            >
              <i class="fa-solid fa-pen-to-square"></i>
              <span class="ms-action-text">Editar solicitud</span>
            </button>
          </div>
        </div>
      </td>
    </tr>
  `;

  const rows = servicios.map(item => {
    const galeria = galeriaServicioPanel(s, item);
    const tieneArchivos = tieneArchivosServicioPanel(s, item);
    const filaClase = claseFilaServicioEstado(s, item);
    const servicioId = item.id || "principal";

    return `
      <tr class="${filaClase} ms-servicio-subfila">
        <td class="td-check">
          <input
            type="checkbox"
            data-ruta-check="${s.id}"
            data-servicio-id="${escaparHtml(servicioId)}"
            ${hojaRutaSeleccion.has(s.id) ? "checked" : ""}
          />
        </td>

        <td class="td-ruta-icon">
          ${
            destino
              ? `
                <button class="ms-icon-btn" data-ruta-solicitud="${s.id}" type="button" title="Ver ruta">
                  <i class="fa-solid fa-location-dot"></i>
                </button>
              `
              : `
                <button class="ms-icon-btn disabled" type="button" title="Sin dirección">
                  <i class="fa-solid fa-location-dot"></i>
                </button>
              `
          }
        </td>

        <td class="td-horario">
          <strong>${escaparHtml(horarioServicioPanel(s, item))}</strong>
        </td>

        <td>
          <div class="td-service-line">
            <span>
              <strong>${escaparHtml(item.servicio || "Servicio")}</strong>
            </span>

            ${
              galeria
                ? `
                  <a class="ms-icon-btn" href="${escaparHtml(galeria)}" target="_blank" rel="noopener" title="Archivos de ${escaparHtml(item.servicio)}">
                    <i class="fa-solid fa-images"></i>
                  </a>
                `
                : tieneArchivos
                  ? `
                    <button class="ms-icon-btn disabled" type="button" title="Archivos guardados sin galería">
                      <i class="fa-solid fa-images"></i>
                    </button>
                  `
                  : `
                    <button class="ms-icon-btn disabled" type="button" title="Sin archivos">
                      <i class="fa-regular fa-image"></i>
                    </button>
                  `
            }
          </div>
        </td>

        <td>
          <div class="td-state-line">
            ${renderEstadoSelect(s, item)}
          </div>
        </td>

        <td>
          <button
            class="ms-prestador-cell-btn"
            data-ver-prestadores-servicio="${s.id}"
            data-servicio-id="${escaparHtml(servicioId)}"
            type="button"
          >
            ${escaparHtml(prestadorServicioPanel(s, item))}
          </button>
        </td>

        <td>
<button
  class="ms-icon-btn ${item.tieneInforme ? "informe-ok" : ""}"
  data-informe-solicitud="${s.id}"
  data-servicio-id="${escaparHtml(servicioId)}"
  type="button"
  title="${item.tieneInforme ? "Ver informe" : "Cargar informe"}"
>
            <i class="fa-solid ${item.tieneInforme ? "fa-file-circle-check" : "fa-file-signature"}"></i>
          </button>
        </td>
      </tr>
    `;
  }).join("");

  return header + rows;
}

function millisSolicitudOrden(s) {
  if (s.fechaDeseada) {
    const t = new Date(`${s.fechaDeseada}T23:59:59`).getTime();
    if (!Number.isNaN(t)) return t;
  }

  if (s.creadoEn?.toMillis) return s.creadoEn.toMillis();

  const creado = new Date(s.creadoEn || 0).getTime();
  return Number.isNaN(creado) ? 0 : creado;
}

function ordenarSolicitudesPanel(items) {
  return [...items].sort((a, b) => {
    const aSinCoordinar = solicitudSinCoordinar(a);
    const bSinCoordinar = solicitudSinCoordinar(b);

    if (aSinCoordinar && !bSinCoordinar) return -1;
    if (!aSinCoordinar && bSinCoordinar) return 1;

    return millisSolicitudOrden(b) - millisSolicitudOrden(a);
  });
}

function fechaGrupoSolicitud(s) {
  return s.fechaDeseada || "sin-coordinar";
}

function tituloGrupoSolicitud(fechaKey) {
  if (!fechaKey || fechaKey === "sin-coordinar") {
    return "Sin coordinar";
  }

  return fechaDeseadaBonita(fechaKey);
}

function renderFilasSolicitudesAgrupadas(items) {
  let grupoActual = "";

  return items.map(s => {
    const grupo = fechaGrupoSolicitud(s);
    let separador = "";

    if (grupo !== grupoActual) {
      grupoActual = grupo;

      separador = `
        <tr class="ms-day-divider">
          <td colspan="7">
            <span>
              <i class="fa-solid fa-calendar-check"></i>
              ${escaparHtml(tituloGrupoSolicitud(grupo))}
            </span>
          </td>
        </tr>
      `;
    }

    return separador + renderSolicitudFila(s);
  }).join("");
}

function obtenerPlanillaActiva() {
  return planillasPanel.find(p => p.id === planillaActivaId) || planillasPanel[0];
}

function solicitudesBasePlanilla(solicitudes) {
  const planilla = obtenerPlanillaActiva();

  if (!planilla || planilla.id === "general" || !Array.isArray(planilla.ids)) {
    return solicitudes;
  }

  const ids = new Set(planilla.ids);
  return solicitudes.filter(s => ids.has(s.id));
}

function colorSeguroPlanilla(color) {
  const c = String(color || "").trim();

  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c;

  return "#e11f2a";
}

function sugerirNombrePlanilla() {
  const partes = [];

  if (filtrosPanelEquipo.fecha) {
    partes.push(fechaDeseadaBonita(filtrosPanelEquipo.fecha));
  }

  if (filtrosPanelEquipo.servicio) {
    partes.push(filtrosPanelEquipo.servicio);
  }

  if (filtrosPanelEquipo.prestador) {
    partes.push(filtrosPanelEquipo.prestador);
  }

  if (filtrosPanelEquipo.horario) {
    partes.push(filtrosPanelEquipo.horario);
  }

  return partes.length ? partes.join(" · ") : "Nueva planilla";
}

function renderTabsPlanillas() {
  const activas = planillasPanel.filter(p => !p.archivada);

  return `
    <div class="ms-planillas-tabs">
      ${activas.map(p => `
        <button
          class="ms-planilla-tab ${p.id === planillaActivaId ? "active" : ""}"
          data-planilla-tab="${p.id}"
          type="button"
          style="--tab-color:${colorSeguroPlanilla(p.color)}"
        >
          <span>${escaparHtml(p.nombre)}</span>
        </button>
      `).join("")}

      ${
        planillaActivaId !== "general"
          ? `
            <button class="ms-mini-btn" data-archivar-planilla="${planillaActivaId}" type="button">
              <i class="fa-solid fa-box-archive"></i>
              Archivar planilla
            </button>
          `
          : ""
      }
    </div>
  `;
}

function renderPlanillasArchivadas() {
  if (!listaPlanillasArchivadas) return;

  const archivadas = planillasPanel.filter(p => p.archivada);

  if (!archivadas.length) {
    listaPlanillasArchivadas.innerHTML = `
      <article class="ms-item">
        <p>Todavía no hay planillas archivadas.</p>
      </article>
    `;
    return;
  }

  listaPlanillasArchivadas.innerHTML = archivadas.map(p => `
    <article class="ms-item">
      <h4>${escaparHtml(p.nombre)}</h4>
      <p><strong>Solicitudes:</strong> ${Array.isArray(p.ids) ? p.ids.length : "Todas"}</p>

      <div class="ms-item-actions">
        <button class="ms-mini-btn red" data-restaurar-planilla="${p.id}" type="button">
          Restaurar
        </button>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-restaurar-planilla]").forEach(btn => {
    btn.onclick = async () => {
      const id = btn.dataset.restaurarPlanilla;
      const planilla = planillasPanel.find(p => p.id === id);

      if (!planilla) return;

      planilla.archivada = false;
      planillaActivaId = id;
      subVistaPanelInterno = "solicitudes";

      await renderEquipo();
    };
  });
}

function renderTablaEquipo(solicitudes) {
  const base = solicitudesBasePlanilla(solicitudes);
  const filtradas = ordenarSolicitudesPanel(filtrarSolicitudesEquipo(base));

  solicitudesVisiblesPanel = filtradas;

  return `
    ${renderResumenEquipo(base)}

    <div class="ms-route-toolbar">
      <button class="ms-mini-btn red" data-abrir-hoja-ruta type="button" title="Abrir hoja de ruta">
        <i class="fa-solid fa-route"></i>
        <span>Abrir hoja de ruta</span>
      </button>

      <button class="ms-mini-btn" data-seleccionar-todo-ruta type="button" title="Seleccionar todos">
        <i class="fa-solid fa-check-double"></i>
        <span>Seleccionar todos</span>
      </button>

      <button class="ms-mini-btn" data-limpiar-hoja-ruta type="button" title="Limpiar selección">
        <i class="fa-solid fa-broom"></i>
        <span>Limpiar selección</span>
      </button>

      <button class="ms-mini-btn" data-crear-planilla type="button" title="Crear planilla">
        <i class="fa-solid fa-table"></i>
        <span>Crear planilla</span>
      </button>

      <button class="ms-mini-btn red" data-borrar-servicios-marcados type="button" title="Borrar marcados">
        <i class="fa-solid fa-trash"></i>
        <span>Borrar marcados</span>
      </button>

      <span id="hojaRutaContador" class="ms-status ms-route-counter">
        <strong class="ms-route-count-number">${hojaRutaSeleccion.size}</strong>
        <span class="ms-route-count-text">
          seleccionada${hojaRutaSeleccion.size === 1 ? "" : "s"}
        </span>
      </span>
    </div>

    ${renderFiltrosEquipo(base)}

    ${renderTabsPlanillas()}

    <div class="ms-board-table-wrap">
      <table class="ms-board-table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Horario</th>
            <th>Servicio / archivos</th>
            <th>Estado</th>
            <th>Prestador</th>
            <th>Informe</th>
          </tr>
        </thead>

        <tbody>
          ${
            filtradas.length
              ? renderFilasSolicitudesAgrupadas(filtradas)
              : `
                <tr>
                  <td colspan="7" class="td-empty">
                    No hay solicitudes con esos filtros.
                  </td>
                </tr>
              `
          }
        </tbody>
      </table>
    </div>
  `;
}

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

function obtenerDestinoSolicitudMaps(solicitud) {
  if (!solicitud) return "";

  if (solicitud.lat && solicitud.lon) {
    return `${solicitud.lat},${solicitud.lon}`;
  }

  return [
    solicitud.direccion,
    solicitud.localidad,
    solicitud.partido,
    solicitud.provincia || "Buenos Aires",
    "Argentina"
  ].filter(Boolean).join(", ");
}

function actualizarContadorHojaRuta() {
  const contador = $("hojaRutaContador");
  if (!contador) return;

  const cantidad = hojaRutaSeleccion.size;

  contador.innerHTML = `
    <strong class="ms-route-count-number">${cantidad}</strong>
    <span class="ms-route-count-text">
      seleccionada${cantidad === 1 ? "" : "s"}
    </span>
  `;
}

function abrirHojaRutaGoogleMaps(solicitudes) {
  const mapa = new Map();
  solicitudes.forEach(s => mapa.set(s.id, s));

  const seleccionadas = Array.from(hojaRutaSeleccion)
    .map(id => mapa.get(id))
    .filter(Boolean)
    .filter(s => obtenerDestinoSolicitudMaps(s));

  if (!seleccionadas.length) {
    toastMsg("Marcá al menos una dirección para armar la hoja de ruta");
    return;
  }

  if (seleccionadas.length > 10) {
    toastMsg("Google Maps permite hasta 10 paradas en este enlace. Marcá menos direcciones.");
    return;
  }

  if (seleccionadas.length === 1) {
    const destinoUnico = obtenerDestinoSolicitudMaps(seleccionadas[0]);
    const urlUnico = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinoUnico)}&travelmode=driving`;
    window.open(urlUnico, "_blank");
    return;
  }

  const destinos = seleccionadas.map(obtenerDestinoSolicitudMaps);

  const destinoFinal = destinos[destinos.length - 1];
  const paradasIntermedias = destinos.slice(0, -1);

  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("travelmode", "driving");
  url.searchParams.set("destination", destinoFinal);

  if (paradasIntermedias.length) {
    url.searchParams.set("waypoints", paradasIntermedias.join("|"));
  }

  window.open(url.toString(), "_blank");
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
<p><strong>Localidad:</strong> ${escaparHtml(s.localidad || "Sin localidad")}</p>
<p><strong>Partido:</strong> ${escaparHtml(s.partido || "Sin partido")}</p>
<p><strong>Dirección:</strong> ${escaparHtml(s.direccion || "Sin dirección")}</p>
<p><strong>Detalle:</strong> ${escaparHtml(s.descripcion || "Sin detalle")}</p>
${renderArchivosSolicitud(s)}
<p><strong>Fecha:</strong> ${fecha}</p>

      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px;">
        <span class="ms-status">${estadoBonito(s.estado)}</span>
        ${emergencia}
      </div>

<div class="ms-item-actions">

        ${
          modo === "equipo"
            ? `
              <label class="ms-route-check">
                <input
                  type="checkbox"
                  data-ruta-check="${s.id}"
                  ${hojaRutaSeleccion.has(s.id) ? "checked" : ""}
                />
                <span>Agregar a hoja de ruta</span>
              </label>
            `
            : ""
        }

        <button class="ms-mini-btn red" data-wa-solicitud="${s.id}" type="button">
          <i class="fa-brands fa-whatsapp"></i>
          WhatsApp
        </button>

  <button class="ms-mini-btn" data-ruta-solicitud="${s.id}" type="button">
    <i class="fa-solid fa-route"></i>
    Ver ruta
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

  panelEquipoSolicitudes?.classList.toggle("hidden", subVistaPanelInterno !== "solicitudes");
  panelEquipoUsuarios?.classList.toggle("hidden", subVistaPanelInterno !== "usuarios");
  panelEquipoPlanillasArchivo?.classList.toggle("hidden", subVistaPanelInterno !== "archivo");

  btnPanelSolicitudes?.classList.toggle("active", subVistaPanelInterno === "solicitudes");
  btnPanelAdminUsuarios?.classList.toggle("active", subVistaPanelInterno === "usuarios");
  btnPanelArchivoPlanillas?.classList.toggle("active", subVistaPanelInterno === "archivo");

  if (subVistaPanelInterno === "solicitudes") {
    if (listaSolicitudesEquipo) {
      listaSolicitudesEquipo.innerHTML = solicitudes.length
        ? renderTablaEquipo(solicitudes)
        : `<article class="ms-item"><p>No hay solicitudes todavía.</p></article>`;
    }

    activarFiltrosEquipo(solicitudes);
    activarBotonesDeSolicitudes(solicitudes);
  }

  if (subVistaPanelInterno === "usuarios") {
    if (!esAdminActual()) {
      toastMsg("Solo el admin puede ver usuarios y roles");
      subVistaPanelInterno = "solicitudes";
      await renderEquipo();
      return;
    }

    await renderUsuariosRoles();
    await renderPrestadoresAdmin();
  }

  if (subVistaPanelInterno === "archivo") {
    renderPlanillasArchivadas();
  }

  activarBotonesPanelInterno();
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

function abrirRutaSolicitud(solicitud) {
  if (!solicitud) return;

  let destino = "";

  if (solicitud.lat && solicitud.lon) {
    destino = `${solicitud.lat},${solicitud.lon}`;
  } else {
    destino = [
      solicitud.direccion,
      solicitud.localidad,
      solicitud.partido,
      solicitud.provincia || "Buenos Aires",
      "Argentina"
    ].filter(Boolean).join(", ");
  }

  if (!destino) {
    toastMsg("Esta solicitud no tiene dirección para abrir la ruta");
    return;
  }

  const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}&travelmode=driving`;

  window.open(url, "_blank");
}

function scrollAPlanillaEquipo() {
  const destino =
    document.querySelector(".ms-planillas-tabs") ||
    document.querySelector(".ms-board-table-wrap");

  if (!destino) return;

  setTimeout(() => {
    destino.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 80);
}

function quitarBloqueoBodySiNoHayModales() {
  const hayAbierto = document.querySelector(".ms-modal:not(.hidden)");

  if (!hayAbierto) {
    document.body.classList.remove("modal-open");
  }
}

function cerrarResumenEquipoSiClickAfuera(e) {
  const box = document.querySelector("[data-resumen-equipo-box]");

  if (!box || !resumenPanelEquipoAbierto) return;
  if (box.contains(e.target)) return;

  resumenPanelEquipoAbierto = false;
  renderEquipo();
}

function activarFiltrosEquipo(solicitudes) {
  document.querySelectorAll("[data-filtro-equipo]").forEach(control => {
    control.onchange = async () => {
      const nombre = control.dataset.filtroEquipo;

      filtrosPanelEquipo[nombre] = control.value;
      filtrosPanelEquipo.rapido = "";

      await renderEquipo();

      if (filtrosManualEquipoAbierto) {
        document.body.classList.add("modal-open");
      }
    };

    if (control.type === "search") {
      control.oninput = async () => {
        const nombre = control.dataset.filtroEquipo;

        filtrosPanelEquipo[nombre] = control.value;
        filtrosPanelEquipo.rapido = "";

        clearTimeout(control.__timerFiltro);
        control.__timerFiltro = setTimeout(async () => {
          await renderEquipo();

          if (filtrosManualEquipoAbierto) {
            document.body.classList.add("modal-open");
          }
        }, 250);
      };
    }
  });

  document.querySelectorAll("[data-limpiar-filtros-equipo]").forEach(btn => {
    btn.onclick = async () => {
      filtrosPanelEquipo = filtrosPanelEquipoVacios();
      await renderEquipo();

      if (filtrosManualEquipoAbierto) {
        document.body.classList.add("modal-open");
      }
    };
  });

  document.querySelectorAll("[data-toggle-resumen-equipo]").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();

      resumenPanelEquipoAbierto = !resumenPanelEquipoAbierto;
      await renderEquipo();
    };
  });

  document.querySelectorAll("[data-filtro-rapido-equipo]").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();

      const tipo = btn.dataset.filtroRapidoEquipo || "";
      const estabaActivo = filtrosPanelEquipo.rapido === tipo;

      filtrosPanelEquipo = filtrosPanelEquipoVacios();
      filtrosPanelEquipo.rapido = estabaActivo ? "" : tipo;
      resumenPanelEquipoAbierto = false;
      filtrosManualEquipoAbierto = false;

      await renderEquipo();
      quitarBloqueoBodySiNoHayModales();
      scrollAPlanillaEquipo();
    };
  });

  document.querySelectorAll("[data-ver-todo-equipo]").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();

      filtrosPanelEquipo = filtrosPanelEquipoVacios();
      resumenPanelEquipoAbierto = false;
      filtrosManualEquipoAbierto = false;

      await renderEquipo();
      quitarBloqueoBodySiNoHayModales();
      scrollAPlanillaEquipo();
    };
  });

  document.querySelectorAll("[data-abrir-filtros-manual-equipo]").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();

      filtrosManualEquipoAbierto = true;
      resumenPanelEquipoAbierto = false;

      await renderEquipo();
      document.body.classList.add("modal-open");
    };
  });

  document.querySelectorAll("[data-cerrar-filtros-manual-equipo]").forEach(btn => {
    btn.onclick = async () => {
      filtrosManualEquipoAbierto = false;

      await renderEquipo();
      quitarBloqueoBodySiNoHayModales();
    };
  });

  document.querySelectorAll("[data-ver-planilla-equipo]").forEach(btn => {
    btn.onclick = async () => {
      filtrosManualEquipoAbierto = false;

      await renderEquipo();
      quitarBloqueoBodySiNoHayModales();
      scrollAPlanillaEquipo();
    };
  });

  const modalFiltrosEquipo = $("modalFiltrosEquipo");

  if (modalFiltrosEquipo) {
    modalFiltrosEquipo.onclick = async (e) => {
      if (e.target !== modalFiltrosEquipo) return;

      filtrosManualEquipoAbierto = false;

      await renderEquipo();
      quitarBloqueoBodySiNoHayModales();
    };
  }

  document.removeEventListener("click", cerrarResumenEquipoSiClickAfuera);
  document.addEventListener("click", cerrarResumenEquipoSiClickAfuera);
}

function normalizarServicioTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function prestadorTieneServicio(prestador, servicio) {
  const objetivo = normalizarServicioTexto(servicio);

  if (!objetivo) return false;

  const habilidades = Array.isArray(prestador?.habilidades)
    ? prestador.habilidades
    : [];

  return habilidades.some(habilidad => {
    return normalizarServicioTexto(habilidad) === objetivo;
  });
}

async function abrirPrestadoresParaSolicitud(solicitud, servicioDetalle = null) {
  if (!solicitud) return;

const servicio = servicioDetalle?.servicio || solicitud.servicio || "";

  if (!servicio) {
    toastMsg("Esta solicitud no tiene servicio cargado");
    return;
  }

  if (prestadoresServicioTitulo) {
    prestadoresServicioTitulo.textContent = `Prestadores para ${servicio}`;
  }

  if (prestadoresServicioSubtitulo) {
    prestadoresServicioSubtitulo.textContent = [
      solicitud.clienteNombre || "Cliente",
      solicitud.direccion || "Sin dirección",
      solicitud.fechaDeseada || "Sin fecha",
      solicitud.horarioDeseado || "Sin horario"
    ].join(" · ");
  }

if (listaPrestadoresServicio) {
  listaPrestadoresServicio.innerHTML = `
    <div class="ms-prestadores-toolbar">
      <button class="ms-mini-btn red" data-agregar-prestador-servicio="${escaparHtml(servicio)}" type="button">
        <i class="fa-solid fa-user-plus"></i>
        Agregar prestador
      </button>
    </div>

    <article class="ms-item">
      <p>Buscando prestadores habilitados...</p>
    </article>
  `;
}

  abrirModal(modalPrestadoresServicio);

  try {
    const prestadores = await obtenerPrestadoresTodos();

    const disponibles = prestadores.filter(prestador => {
      return prestador.habilitado && prestadorTieneServicio(prestador, servicio);
    });

if (!disponibles.length) {
  listaPrestadoresServicio.innerHTML = `
    <div class="ms-prestadores-toolbar">
      <button class="ms-mini-btn red" data-agregar-prestador-servicio="${escaparHtml(servicio)}" type="button">
        <i class="fa-solid fa-user-plus"></i>
        Agregar prestador
      </button>
    </div>

    <article class="ms-item">
      <h4>No hay prestadores habilitados para ${escaparHtml(servicio)}</h4>
      <p>
        Podés agregar un prestador desde este mismo panel y quedará habilitado para este servicio.
      </p>
    </article>
  `;

  document.querySelectorAll("[data-agregar-prestador-servicio]").forEach(btn => {
    btn.onclick = () => {
      abrirAltaManualPrestador(btn.dataset.agregarPrestadorServicio || servicio);
    };
  });

  return;
}

listaPrestadoresServicio.innerHTML = `
  <div class="ms-prestadores-toolbar">
    <button class="ms-mini-btn red" data-agregar-prestador-servicio="${escaparHtml(servicio)}" type="button">
      <i class="fa-solid fa-user-plus"></i>
      Agregar prestador
    </button>
  </div>
` + disponibles.map(prestador => {
      const habilidades = Array.isArray(prestador.habilidades)
        ? prestador.habilidades.join(", ")
        : "Sin habilidades cargadas";

      return `
        <article class="ms-item ms-prestador-servicio-item">
          <div>
            <h4>${escaparHtml(prestador.nombre || "Prestador")}</h4>
            <p><strong>WhatsApp:</strong> ${escaparHtml(prestador.telefono || "Sin teléfono")}</p>
            <p><strong>Zona:</strong> ${escaparHtml(prestador.zona || "Sin zona")}</p>
            <p><strong>Habilidades:</strong> ${escaparHtml(habilidades)}</p>
          </div>

          <div class="ms-item-actions">
            <button
              class="ms-mini-btn red"
              data-asignar-prestador="${escaparHtml(prestador.uid || prestador.id)}"
              type="button"
            >
              <i class="fa-solid fa-user-check"></i>
              Asignar
            </button>

            ${
              prestador.telefono
                ? `
                  <a
                    class="ms-mini-btn"
                    href="https://wa.me/549${escaparHtml(prestador.telefono)}"
                    target="_blank"
                    rel="noopener"
                  >
                    <i class="fa-brands fa-whatsapp"></i>
                    WhatsApp
                  </a>
                `
                : ""
            }
          </div>
        </article>
      `;
    }).join("");

    document.querySelectorAll("[data-asignar-prestador]").forEach(btn => {
      btn.onclick = async () => {
        const uid = btn.dataset.asignarPrestador;
        const prestador = disponibles.find(p => String(p.uid || p.id) === String(uid));

        if (!prestador) {
          toastMsg("No se encontró el prestador");
          return;
        }

        try {
const cambiosServicio = actualizarServicioDetalleLocal(solicitud, servicioDetalle?.id || "", {
  prestadorAsignadoUid: prestador.uid || prestador.id || "",
  prestadorAsignadoNombre: prestador.nombre || "",
  estado: "derivado"
});

if (cambiosServicio) {
  await updateDoc(doc(db, "solicitudes", solicitud.id), {
    serviciosDetalle: cambiosServicio,
    actualizadoEn: serverTimestamp()
  });
} else {
  await updateDoc(doc(db, "solicitudes", solicitud.id), {
    prestadorAsignadoUid: prestador.uid || prestador.id || "",
    prestadorAsignadoNombre: prestador.nombre || "",
    estado: "derivado",
    actualizadoEn: serverTimestamp()
  });
}

          toastMsg("Prestador asignado");
          cerrarModal(modalPrestadoresServicio);
          await renderEquipo();

        } catch (error) {
          console.error(error);
          toastMsg("No se pudo asignar el prestador");
        }
      };
    });

     document.querySelectorAll("[data-agregar-prestador-servicio]").forEach(btn => {
  btn.onclick = () => {
    abrirAltaManualPrestador(btn.dataset.agregarPrestadorServicio || servicio);
  };
});

  } catch (error) {
    console.error(error);

    if (listaPrestadoresServicio) {
      listaPrestadoresServicio.innerHTML = `
        <article class="ms-item">
          <p>No se pudieron cargar los prestadores.</p>
        </article>
      `;
    }
  }
}

function cargarSolicitudEnModalEdicion(solicitud) {
  if (!solicitud) return;

  solicitudEditandoId = solicitud.id;
  solicitudEditandoData = solicitud;

  if ($("solNombre")) $("solNombre").value = solicitud.clienteNombre || "";
  if ($("solTelefono")) $("solTelefono").value = solicitud.clienteTelefono || "";
  if ($("solServicio")) $("solServicio").value = solicitud.servicio || "";
  if ($("solDireccion")) $("solDireccion").value = solicitud.direccion || "";
  if ($("solFechaDeseada")) $("solFechaDeseada").value = solicitud.fechaDeseada || "";
  if ($("solHorarioDeseado")) $("solHorarioDeseado").value = solicitud.horarioDeseado || "";
  if ($("solEmergencia")) $("solEmergencia").checked = !!solicitud.emergencia;
  cargarServiciosDetalleDesdeSolicitud(solicitud);

  geoDireccionSeleccionada = solicitud.geo || {
    zona: solicitud.zona || "",
    zonaLocalidad: solicitud.zona || "",
    localidad: solicitud.localidad || "",
    partido: solicitud.partido || "",
    provincia: solicitud.provincia || "",
    direccion: solicitud.direccion || "",
    lat: solicitud.lat || null,
    lon: solicitud.lon || null
  };

  geoZonaSeleccionada = geoDireccionSeleccionada;

  actualizarNotaEmergencia();

  const titulo = modalSolicitud?.querySelector("h2");
  const texto = modalSolicitud?.querySelector(".ms-muted");
  const submit = formSolicitudServicio?.querySelector("button[type='submit']");

  if (titulo) {
    titulo.textContent = "Editar solicitud";
  }

  if (texto) {
    texto.textContent = "Modificá los datos de coordinación, dirección, servicio o detalle.";
  }

  if (submit) {
    submit.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar cambios`;
  }

  abrirModal(modalSolicitud);
}

async function obtenerInformePorSolicitudId(solicitudId, servicioId = "") {
  if (!solicitudId) return null;

  const snap = await getDocs(collection(db, "informesServicio"));

  const informes = snap.docs
    .map(d => ({
      id: d.id,
      ...d.data()
    }))
    .filter(informe => {
      if (informe.solicitudId !== solicitudId) return false;

      const sid = String(servicioId || "");

      if (!sid || sid === "principal") {
        return !informe.servicioId || informe.servicioId === "principal";
      }

      return String(informe.servicioId || "") === sid;
    });

  informes.sort((a, b) => {
    const fa = a.creadoEn?.toMillis ? a.creadoEn.toMillis() : 0;
    const fb = b.creadoEn?.toMillis ? b.creadoEn.toMillis() : 0;
    return fb - fa;
  });

  return informes[0] || null;
}

function cargarAudioExistenteInforme(informe) {
  const archivos = Array.isArray(informe?.archivos) ? informe.archivos : [];

  const audio = archivos.find(archivo => {
    const tipo = String(archivo.tipo || "").toLowerCase();
    const tipoGeneral = String(archivo.tipoGeneral || "").toLowerCase();

    return tipo.startsWith("audio/") || tipoGeneral === "audio";
  });

  if (!audio) {
    if (informeAudioPreview) {
      informeAudioPreview.pause();
      informeAudioPreview.removeAttribute("src");
      informeAudioPreview.classList.add("hidden");
    }

    if (informeAudioEstado) {
      informeAudioEstado.textContent = "Sin audio grabado.";
    }

    return;
  }

  const url = audio.urlCorta || audio.shortUrl || audio.url || "";

  if (informeAudioPreview && url) {
    informeAudioPreview.src = url;
    informeAudioPreview.classList.remove("hidden");
  }

  if (informeAudioEstado) {
    informeAudioEstado.textContent = "Este informe ya tiene una nota de voz cargada.";
  }
}

function aplicarModoLecturaInforme(lectura) {
  informeModoLectura = !!lectura;

  if (informeTrabajo) informeTrabajo.readOnly = informeModoLectura;
  if (informeObservaciones) informeObservaciones.readOnly = informeModoLectura;
if (informeCostoManoObra) informeCostoManoObra.readOnly = informeModoLectura;
if (informeCostoMateriales) informeCostoMateriales.readOnly = informeModoLectura;
if (informeCostoTotal) informeCostoTotal.readOnly = informeModoLectura;
if (informeGarantiaTiempo) informeGarantiaTiempo.readOnly = informeModoLectura;
if (informeGarantiaVencimiento) informeGarantiaVencimiento.readOnly = informeModoLectura;
   
  if (informeArchivos) informeArchivos.disabled = informeModoLectura;

  if (canvasFirmaCliente) {
    canvasFirmaCliente.style.pointerEvents = informeModoLectura ? "none" : "auto";
  }

  btnInformeAudioGrabar?.classList.toggle("hidden", informeModoLectura);
  btnInformeAudioDetener?.classList.add("hidden");
  btnInformeAudioBorrar?.classList.toggle("hidden", informeModoLectura || !audioInformeFile);

  const submit = formInformeServicio?.querySelector("button[type='submit']");

  if (submit) {
    submit.classList.toggle("hidden", informeModoLectura);
  }

  btnEditarInforme?.classList.toggle("hidden", !informeModoLectura);
}

function limpiarAudioInforme(mostrarMensaje = true) {
  if (streamAudioInforme) {
    streamAudioInforme.getTracks().forEach(track => track.stop());
  }

  streamAudioInforme = null;
  mediaRecorderInforme = null;
  audioChunksInforme = [];
  audioInformeBlob = null;
  audioInformeFile = null;

  if (audioInformeUrl) {
    URL.revokeObjectURL(audioInformeUrl);
  }

  audioInformeUrl = "";

  if (informeAudioPreview) {
    informeAudioPreview.pause();
    informeAudioPreview.removeAttribute("src");
    informeAudioPreview.classList.add("hidden");
  }

  btnInformeAudioGrabar?.classList.remove("hidden");
  btnInformeAudioDetener?.classList.add("hidden");
  btnInformeAudioBorrar?.classList.add("hidden");

  if (informeAudioEstado) {
    informeAudioEstado.textContent = "Sin audio grabado.";
  }

  actualizarResumenArchivosInforme();

  if (mostrarMensaje) {
    toastMsg("Audio del informe borrado");
  }
}

async function iniciarGrabacionInforme() {
  try {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      toastMsg("Tu navegador no permite grabar audio desde la web");
      return;
    }

    limpiarAudioInforme(false);

    streamAudioInforme = await navigator.mediaDevices.getUserMedia({
      audio: true
    });

    const opciones = {};

    if (MediaRecorder.isTypeSupported("audio/webm")) {
      opciones.mimeType = "audio/webm";
    }

    mediaRecorderInforme = new MediaRecorder(streamAudioInforme, opciones);
    audioChunksInforme = [];

    mediaRecorderInforme.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) {
        audioChunksInforme.push(event.data);
      }
    });

    mediaRecorderInforme.addEventListener("stop", () => {
      const tipo = mediaRecorderInforme?.mimeType || "audio/webm";
      const extension = obtenerExtensionAudio(tipo);

      audioInformeBlob = new Blob(audioChunksInforme, {
        type: tipo
      });

      audioInformeFile = new File(
        [audioInformeBlob],
        `audio-informe-${Date.now()}.${extension}`,
        { type: tipo }
      );

      audioInformeUrl = URL.createObjectURL(audioInformeBlob);

      if (informeAudioPreview) {
        informeAudioPreview.src = audioInformeUrl;
        informeAudioPreview.classList.remove("hidden");
      }

      if (informeAudioEstado) {
        informeAudioEstado.textContent = "Audio del informe listo para guardar.";
      }

      btnInformeAudioGrabar?.classList.remove("hidden");
      btnInformeAudioDetener?.classList.add("hidden");
      btnInformeAudioBorrar?.classList.remove("hidden");

      if (streamAudioInforme) {
        streamAudioInforme.getTracks().forEach(track => track.stop());
      }

      streamAudioInforme = null;

      actualizarResumenArchivosInforme();
    });

    mediaRecorderInforme.start();

    btnInformeAudioGrabar?.classList.add("hidden");
    btnInformeAudioDetener?.classList.remove("hidden");
    btnInformeAudioBorrar?.classList.add("hidden");

    if (informeAudioEstado) {
      informeAudioEstado.textContent = "Grabando audio del informe...";
    }
  } catch (error) {
    console.error(error);
    toastMsg("No se pudo iniciar la grabación del informe");
    limpiarAudioInforme(false);
  }
}

function detenerGrabacionInforme() {
  if (!mediaRecorderInforme) return;

  if (mediaRecorderInforme.state === "recording") {
    mediaRecorderInforme.stop();
  }
}

function obtenerArchivosInformeParaSubir() {
  const archivos = Array.from(informeArchivos?.files || []);

  if (audioInformeFile) {
    archivos.push(audioInformeFile);
  }

  return archivos;
}

function actualizarResumenArchivosInforme() {
  if (!informeArchivosResumen) return;

  const archivos = Array.from(informeArchivos?.files || []);
  const total = archivos.length + (audioInformeFile ? 1 : 0);

  if (!total) {
    informeArchivosResumen.classList.add("hidden");
    informeArchivosResumen.textContent = "";
    return;
  }

  const fotos = archivos.filter(a => a.type.startsWith("image/")).length;
  const videos = archivos.filter(a => a.type.startsWith("video/")).length;
  const audiosSubidos = archivos.filter(a => a.type.startsWith("audio/")).length;
  const audioGrabado = audioInformeFile ? 1 : 0;
  const otros = archivos.length - fotos - videos - audiosSubidos;

  informeArchivosResumen.classList.remove("hidden");
  informeArchivosResumen.textContent =
    `Seleccionaste ${total} archivo(s): ` +
    `${fotos} foto(s), ${videos} video(s), ${audiosSubidos + audioGrabado} audio(s)` +
    `${otros ? `, ${otros} otro(s)` : ""}.`;
}

function prepararCanvasFirma() {
  if (!canvasFirmaCliente) return;

  const ctx = canvasFirmaCliente.getContext("2d");
  let dibujando = false;

  function limpiarCanvas() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasFirmaCliente.width, canvasFirmaCliente.height);
    ctx.strokeStyle = "#071b3a";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    informeFirmaDataUrl = "";
  }

  function posicion(e) {
    const rect = canvasFirmaCliente.getBoundingClientRect();
    const touch = e.touches?.[0];

    return {
      x: ((touch?.clientX ?? e.clientX) - rect.left) * (canvasFirmaCliente.width / rect.width),
      y: ((touch?.clientY ?? e.clientY) - rect.top) * (canvasFirmaCliente.height / rect.height)
    };
  }

  function empezar(e) {
    e.preventDefault();
    dibujando = true;
    const p = posicion(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function mover(e) {
    if (!dibujando) return;
    e.preventDefault();
    const p = posicion(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    informeFirmaDataUrl = canvasFirmaCliente.toDataURL("image/png");
  }

  function terminar() {
    dibujando = false;
    informeFirmaDataUrl = canvasFirmaCliente.toDataURL("image/png");
  }

  limpiarCanvas();

  canvasFirmaCliente.onmousedown = empezar;
  canvasFirmaCliente.onmousemove = mover;
  canvasFirmaCliente.onmouseup = terminar;
  canvasFirmaCliente.onmouseleave = terminar;

  canvasFirmaCliente.ontouchstart = empezar;
  canvasFirmaCliente.ontouchmove = mover;
  canvasFirmaCliente.ontouchend = terminar;

if (btnLimpiarFirma) {
  btnLimpiarFirma.onclick = limpiarCanvas;
}
}

async function abrirInformeSolicitud(solicitud, servicioDetalle = null) {
  if (!solicitud) return;

  informeSolicitudActual = solicitud;
  informeServicioDetalleActual = servicioDetalle;
  informeCargadoId = "";
  informeCargadoData = null;
  informeArchivosSeleccionados = [];
  informeFirmaDataUrl = "";

  const servicioActual = servicioDetalle?.servicio || solicitud.servicio || "Servicio";
  const fechaActual = servicioDetalle?.fechaDeseada || solicitud.fechaDeseada || "";
  const horarioActual = servicioDetalle?.horarioDeseado || solicitud.horarioDeseado || "";
  const servicioIdActual = servicioDetalle?.id || "principal";

  if (informeSolicitudId) informeSolicitudId.value = solicitud.id;
  if (informeTrabajo) informeTrabajo.value = "";
  if (informeObservaciones) informeObservaciones.value = "";
  if (informeArchivos) informeArchivos.value = "";

informeTotalEditadoManual = false;

if (informeCostoManoObra) informeCostoManoObra.value = "";
if (informeCostoMateriales) informeCostoMateriales.value = "";
if (informeCostoTotal) informeCostoTotal.value = "";
if (informeGarantiaTiempo) informeGarantiaTiempo.value = "";
if (informeGarantiaVencimiento) informeGarantiaVencimiento.value = "";

  limpiarAudioInforme(false);

  if (informeClienteTitulo) {
    informeClienteTitulo.textContent = `${solicitud.clienteNombre || "Cliente"} · ${servicioActual}`;
  }

  if (informeSolicitudTexto) {
    informeSolicitudTexto.textContent = [
      solicitud.direccion || "Sin dirección",
      fechaActual || "Sin fecha",
      horarioActual || "Sin horario"
    ].join(" · ");
  }

  if (informeArchivosResumen) {
    informeArchivosResumen.classList.add("hidden");
    informeArchivosResumen.textContent = "";
  }

  prepararCanvasFirma();

  const informe = await obtenerInformePorSolicitudId(solicitud.id, servicioIdActual);

  if (informe) {
    informeCargadoId = informe.id;
    informeCargadoData = informe;

    if (informeTrabajo) informeTrabajo.value = informe.trabajo || "";
    if (informeObservaciones) informeObservaciones.value = informe.observaciones || "";

if (informeCostoManoObra) informeCostoManoObra.value = informe.costoManoObra || "";
if (informeCostoMateriales) informeCostoMateriales.value = informe.costoMateriales || "";
if (informeCostoTotal) informeCostoTotal.value = informe.costoTotal || "";
if (informeGarantiaTiempo) informeGarantiaTiempo.value = informe.garantiaTiempo || "";
if (informeGarantiaVencimiento) informeGarantiaVencimiento.value = informe.garantiaVencimiento || "";

    if (informe.firmaCliente) {
      informeFirmaDataUrl = informe.firmaCliente;

      const ctx = canvasFirmaCliente?.getContext("2d");
      const img = new Image();

      img.onload = () => {
        ctx.clearRect(0, 0, canvasFirmaCliente.width, canvasFirmaCliente.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasFirmaCliente.width, canvasFirmaCliente.height);
        ctx.drawImage(img, 0, 0, canvasFirmaCliente.width, canvasFirmaCliente.height);
      };

      img.src = informe.firmaCliente;
    }

    cargarAudioExistenteInforme(informe);
    aplicarModoLecturaInforme(true);
    abrirModal(modalInformeServicio);
    return;
  }

  aplicarModoLecturaInforme(false);
  abrirModal(modalInformeServicio);
}

function activarBotonesPanelInterno() {
  if (btnPanelSolicitudes) {
    btnPanelSolicitudes.onclick = async () => {
      subVistaPanelInterno = "solicitudes";
      await renderEquipo();
    };
  }

  if (btnPanelAdminUsuarios) {
    btnPanelAdminUsuarios.onclick = async () => {
      subVistaPanelInterno = "usuarios";
      await renderEquipo();
    };
  }

  if (btnPanelArchivoPlanillas) {
    btnPanelArchivoPlanillas.onclick = async () => {
      subVistaPanelInterno = "archivo";
      await renderEquipo();
    };
  }
}

function activarBotonesDeSolicitudes(solicitudes) {
  const mapa = new Map();
  solicitudes.forEach(s => mapa.set(s.id, s));

     document.querySelectorAll("[data-editar-solicitud]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.editarSolicitud;
      const solicitud = mapa.get(id);

      if (!solicitud) return;

      cargarSolicitudEnModalEdicion(solicitud);
    };
  });

document.querySelectorAll("[data-ver-prestadores-servicio]").forEach(btn => {
  btn.onclick = async () => {
    const id = btn.dataset.verPrestadoresServicio;
    const servicioId = btn.dataset.servicioId;
    const solicitud = mapa.get(id);

    if (!solicitud) return;

    const servicioDetalle = servicioDetallePorId(solicitud, servicioId);

    await abrirPrestadoresParaSolicitud(solicitud, servicioDetalle);
  };
});
   
document.querySelectorAll("[data-informe-solicitud]").forEach(btn => {
  btn.onclick = async () => {
    const id = btn.dataset.informeSolicitud;
    const servicioId = btn.dataset.servicioId || "";
    const solicitud = mapa.get(id);

    if (!solicitud) return;

    const servicioDetalle = servicioDetallePorId(solicitud, servicioId);

    await abrirInformeSolicitud(solicitud, servicioDetalle);
  };
});
   
document.querySelectorAll("[data-wa-solicitud-marcados]").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.waSolicitudMarcados;
    const solicitud = mapa.get(id);

    if (!solicitud) return;

    const serviciosMarcados = serviciosMarcadosParaWhatsApp(solicitud);

    if (!serviciosMarcados.length) {
      toastMsg("Marcá uno o más servicios de esta solicitud para enviar por WhatsApp");
      return;
    }

    abrirWhatsAppConMensaje(
      mensajeWhatsAppSolicitud({
        ...solicitud,
        servicio: serviciosMarcados.map(item => item.servicio).filter(Boolean).join(" + "),
        serviciosDetalle: serviciosMarcados,
        fechaDeseada: serviciosMarcados[0]?.fechaDeseada || solicitud.fechaDeseada || "",
        horarioDeseado: serviciosMarcados[0]?.horarioDeseado || solicitud.horarioDeseado || "",
        descripcion: serviciosMarcados.map(item => item.descripcion).filter(Boolean).join(" / "),
        archivos: serviciosMarcados.flatMap(item => Array.isArray(item.archivos) ? item.archivos : []),
        archivosGaleriaUrl: ""
      }, id)
    );
  };
});

   document.querySelectorAll("[data-ruta-check]").forEach(check => {
  check.onchange = () => {
    const id = check.dataset.rutaCheck;

    if (check.checked) {
      hojaRutaSeleccion.add(id);
    } else {
      hojaRutaSeleccion.delete(id);
    }

    actualizarContadorHojaRuta();
  };
});

document.querySelectorAll("[data-abrir-hoja-ruta]").forEach(btn => {
  btn.onclick = () => {
    abrirHojaRutaGoogleMaps(solicitudes);
  };
});

   document.querySelectorAll("[data-seleccionar-todo-ruta]").forEach(btn => {
  btn.onclick = () => {
    solicitudesVisiblesPanel.forEach(s => {
      hojaRutaSeleccion.add(s.id);
    });

    document.querySelectorAll("[data-ruta-check]").forEach(check => {
      check.checked = true;
    });

    actualizarContadorHojaRuta();
    toastMsg("Solicitudes visibles seleccionadas");
  };
});

document.querySelectorAll("[data-crear-planilla]").forEach(btn => {
  btn.onclick = async () => {
    let seleccionadas = Array.from(hojaRutaSeleccion);

    if (!seleccionadas.length) {
      const usarFiltro = window.confirm(
        "No marcaste solicitudes. ¿Querés crear una planilla con el filtro actual?"
      );

      if (!usarFiltro) return;

      seleccionadas = solicitudesVisiblesPanel.map(s => s.id);
    }

    if (!seleccionadas.length) {
      toastMsg("No hay solicitudes para crear la planilla");
      return;
    }

    const nombreSugerido = sugerirNombrePlanilla();

    const nombre = window.prompt(
      "Nombre de la planilla:",
      nombreSugerido
    );

    if (!nombre) return;

    const color = window.prompt(
      "Color de la pestaña en formato HEX. Ejemplo: #e11f2a",
      "#e11f2a"
    );

    const id = `planilla-${Date.now()}`;

    planillasPanel.push({
      id,
      nombre: limpiar(nombre),
      color: colorSeguroPlanilla(color),
      ids: seleccionadas,
      archivada: false,
      creadaEn: Date.now()
    });

    planillaActivaId = id;
    toastMsg("Planilla creada");
    await renderEquipo();
  };
});

document.querySelectorAll("[data-borrar-servicios-marcados]").forEach(btn => {
  btn.onclick = async () => {
    await borrarServiciosMarcados(solicitudes);
  };
});

document.querySelectorAll("[data-planilla-tab]").forEach(btn => {
  btn.onclick = async () => {
    planillaActivaId = btn.dataset.planillaTab || "general";
    await renderEquipo();
  };
});

document.querySelectorAll("[data-archivar-planilla]").forEach(btn => {
  btn.onclick = async () => {
    const id = btn.dataset.archivarPlanilla;
    const planilla = planillasPanel.find(p => p.id === id);

    if (!planilla || planilla.id === "general") return;

    const confirma = window.confirm(`¿Archivar la planilla "${planilla.nombre}"?`);

    if (!confirma) return;

    planilla.archivada = true;
    planillaActivaId = "general";

    toastMsg("Planilla archivada");
    await renderEquipo();
  };
});

document.querySelectorAll("[data-limpiar-hoja-ruta]").forEach(btn => {
  btn.onclick = async () => {
    hojaRutaSeleccion.clear();

    document.querySelectorAll("[data-ruta-check]").forEach(check => {
      check.checked = false;
    });

    actualizarContadorHojaRuta();
    toastMsg("Selección de hoja de ruta limpia");
  };
});

   document.querySelectorAll("[data-ruta-solicitud]").forEach(btn => {
  btn.onclick = () => {
    const id = btn.dataset.rutaSolicitud;
    const solicitud = mapa.get(id);
    if (!solicitud) return;

    abrirRutaSolicitud(solicitud);
  };
});

document.querySelectorAll("[data-estado-select]").forEach(select => {
  select.onchange = async () => {
    const id = select.dataset.estadoSelect;
    const nuevoEstado = select.value;

    try {
      await updateDoc(doc(db, "solicitudes", id), {
        estado: nuevoEstado,
        actualizadoEn: serverTimestamp()
      });

      toastMsg(`Estado actualizado: ${estadoBonito(nuevoEstado)}`);
      await renderEquipo();
    } catch (error) {
      console.error(error);
      toastMsg("No se pudo actualizar el estado");
    }
  };
});

   document.querySelectorAll("[data-estado-servicio]").forEach(control => {
  control.onchange = async () => {
    const id = control.dataset.estadoServicio;
    const servicioId = control.dataset.servicioId;
    const solicitud = mapa.get(id);

    if (!solicitud) return;

    const nuevosServicios = actualizarServicioDetalleLocal(solicitud, servicioId, {
      estado: control.value
    });

    try {
      if (nuevosServicios) {
        await updateDoc(doc(db, "solicitudes", id), {
          serviciosDetalle: nuevosServicios,
          actualizadoEn: serverTimestamp()
        });
      } else {
        await updateDoc(doc(db, "solicitudes", id), {
          estado: control.value,
          actualizadoEn: serverTimestamp()
        });
      }

      toastMsg("Estado actualizado");
      await renderEquipo();

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
   const mostrarWhatsappHome = vista === "inicio" || vista === "comoFunciona";
   btnWhatsappFlotante?.classList.toggle("hidden", !mostrarWhatsappHome);

  const mostrarHome = vista === "inicio" || vista === "comoFunciona";

  vistaInicio?.classList.add("hidden");
  vistaPaneles?.classList.add("hidden");
  bloqueContactoBetween?.classList.add("hidden");

  /*
    IMPORTANTE:
    "Cómo funciona" ahora vive dentro de #inicio.
    Por eso NO lo ocultamos como pantalla independiente.
  */
  vistaComoFunciona?.classList.remove("hidden");

  if (mostrarHome) {
    vistaInicio?.classList.remove("hidden");
    bloqueContactoBetween?.classList.remove("hidden");
  }

  if (vista === "paneles" || vista === "panelInterno") {
    vistaPaneles?.classList.remove("hidden");
  }

  document.querySelectorAll("[data-vista-link]").forEach(link => {
    link.classList.toggle("active", link.dataset.vistaLink === vista);
  });

  await renderPaneles();

  if (vista === "comoFunciona" && vistaComoFunciona) {
    const top = vistaComoFunciona.getBoundingClientRect().top + window.scrollY - 90;

    window.scrollTo({
      top: Math.max(0, top),
      behavior: "smooth"
    });

    return;
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   EVENTOS UI
========================================================= */

informeArchivos?.addEventListener("change", () => {
  informeArchivosSeleccionados = Array.from(informeArchivos.files || []);
  actualizarResumenArchivosInforme();
});

btnInformeAudioGrabar?.addEventListener("click", iniciarGrabacionInforme);
btnInformeAudioDetener?.addEventListener("click", detenerGrabacionInforme);
btnInformeAudioBorrar?.addEventListener("click", () => limpiarAudioInforme(true));

btnEditarInforme?.addEventListener("click", () => {
  aplicarModoLecturaInforme(false);
  btnEditarInforme.classList.add("hidden");
  toastMsg("Ahora podés editar el informe");
});

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
    cerrarModalControlado($(btn.dataset.closeModal));
  });
});

document.querySelectorAll(".ms-modal").forEach(modal => {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) cerrarModalControlado(modal);
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
  const url = "https://www.multiservice24.com.ar/";
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

  const mensajeCompartir = `${texto}\n${url}`;
  const mensaje = typeof encodeWhatsAppText === "function"
    ? encodeWhatsAppText(mensajeCompartir)
    : encodeURIComponent(mensajeCompartir);

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

  restaurarModalPrestadorPublico();
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

const prestadorRecursosInput = $("prestadorRecursos");

if (prestadorRecursosInput) {
  prestadorRecursosInput.checked = true;
  prestadorRecursosInput.disabled = true;
}

configurarSugerenciasGeo(solDireccion, solDireccionSugerencias, "direccion");

btnSolServiciosDropdown?.addEventListener("click", () => {
  solServiciosPicker?.classList.toggle("hidden");
});

solServiciosPicker?.addEventListener("click", (e) => {
  const cerrar = e.target.closest("[data-cerrar-servicios-picker]");

  if (cerrar) {
    solServiciosPicker.classList.add("hidden");
  }
});

solServiciosPicker?.addEventListener("change", (e) => {
  const input = e.target.closest("[data-servicio-pick]");
  if (!input) return;

  if (input.checked) {
    agregarServicioDesdePicker(input.value);
  } else {
    quitarServicioDesdePicker(input.value);
  }

  /* IMPORTANTE: No cerramos la lista al elegir un servicio. Se cierra con la X o tocando afuera. */
});

document.addEventListener("click", (e) => {
  if (!solServiciosPicker || !btnSolServiciosDropdown) return;

  if (
    e.target === btnSolServiciosDropdown ||
    btnSolServiciosDropdown.contains(e.target) ||
    solServiciosPicker.contains(e.target)
  ) {
    return;
  }

  solServiciosPicker.classList.add("hidden");
});

solServiciosTabs?.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-servicio-tab]");
  if (!btn) return;

  sincronizarTodosLosServiciosDesdeDom();
  servicioActivoSolicitudId = btn.dataset.servicioTab;
  renderServiciosDetalleSolicitud();
});

solServiciosDetalle?.addEventListener("change", (e) => {
  const inputArchivos = e.target.closest("[data-servicio-archivos]");
  const fecha = e.target.closest("[data-servicio-fecha]");
  const horario = e.target.closest("[data-servicio-horario]");

  if (inputArchivos) {
    const id = inputArchivos.dataset.servicioArchivos;
    const item = serviciosDetalleSolicitud.find(s => s.id === id);

    if (item) {
      item.archivosLocales = Array.from(inputArchivos.files || []);
    }

    actualizarResumenArchivosServicio(id);
    return;
  }

  if (fecha) {
    sincronizarServicioDesdeDom(fecha.dataset.servicioFecha);
    return;
  }

  if (horario) {
    sincronizarServicioDesdeDom(horario.dataset.servicioHorario);
  }
});

solServiciosDetalle?.addEventListener("input", (e) => {
  const textarea = e.target.closest("[data-servicio-descripcion]");
  if (!textarea) return;

  sincronizarServicioDesdeDom(textarea.dataset.servicioDescripcion);
});

solServiciosDetalle?.addEventListener("click", (e) => {
  const quitar = e.target.closest("[data-servicio-quitar]");
  const grabar = e.target.closest("[data-servicio-audio-grabar]");
  const detener = e.target.closest("[data-servicio-audio-detener]");
  const borrar = e.target.closest("[data-servicio-audio-borrar]");

  if (quitar) {
    const id = quitar.dataset.servicioQuitar;

    serviciosDetalleSolicitud = serviciosDetalleSolicitud.filter(item => item.id !== id);

    if (servicioActivoSolicitudId === id) {
      servicioActivoSolicitudId = serviciosDetalleSolicitud[0]?.id || "";
    }

    renderServiciosDetalleSolicitud();
    return;
  }

  if (grabar) {
    iniciarAudioServicioSolicitud(grabar.dataset.servicioAudioGrabar);
    return;
  }

  if (detener) {
    detenerAudioServicioSolicitud(detener.dataset.servicioAudioDetener);
    return;
  }

  if (borrar) {
    borrarAudioServicioSolicitud(borrar.dataset.servicioAudioBorrar, true);
  }
});

/* =========================================================
   FORM CONTACTO RÁPIDO
========================================================= */

formContactoRapido?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const btn = formContactoRapido.querySelector("button[type='submit']");
 const ventanaWhatsApp = prepararVentanaWhatsApp();

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
  const esEdicionSolicitud = !!solicitudEditandoId;
  const ventanaWhatsApp = esEdicionSolicitud ? null : prepararVentanaWhatsApp();

  const geoFinal = geoDireccionSeleccionada || geoZonaSeleccionada || null;

  const data = {
    nombre: limpiar($("solNombre")?.value),
    telefono: normalizarTelefono($("solTelefono")?.value),

    zona: geoFinal?.zonaLocalidad || geoFinal?.zona || "",
    localidad: geoFinal?.localidad || "",
    partido: geoFinal?.partido || "",
    provincia: geoFinal?.provincia || "",

    direccion: limpiar($("solDireccion")?.value),
    lat: geoFinal?.lat || null,
    lon: geoFinal?.lon || null,

    geo: geoFinal ? {
      zona: geoFinal.zona || "",
      zonaLocalidad: geoFinal.zonaLocalidad || "",
      localidad: geoFinal.localidad || "",
      partido: geoFinal.partido || "",
      provincia: geoFinal.provincia || "",
      direccion: geoFinal.direccion || "",
      lat: geoFinal.lat || null,
      lon: geoFinal.lon || null
    } : null,

    fechaDeseada: limpiar($("solFechaDeseada")?.value),
    horarioDeseado: limpiar($("solHorarioDeseado")?.value),
    emergencia: !!$("solEmergencia")?.checked,

    serviciosDetalle: [],
    servicio: "",
    descripcion: "",
    archivos: [],
    archivosGaleriaId: "",
    archivosGaleriaUrl: "",
    archivosVencenEn: ""
  };

  if (!data.nombre || !data.telefono || !data.direccion) {
    if (ventanaWhatsApp) ventanaWhatsApp.close();
    toastMsg("Completá nombre, WhatsApp y dirección");
    return;
  }

  try {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Preparando servicios...`;

    data.serviciosDetalle = await obtenerServiciosDetalleParaGuardar(data.telefono);

     const primerServicioConAgenda = data.serviciosDetalle.find(item => item.fechaDeseada || item.horarioDeseado)
  || data.serviciosDetalle[0]
  || null;

data.fechaDeseada = primerServicioConAgenda?.fechaDeseada || "";
data.horarioDeseado = primerServicioConAgenda?.horarioDeseado || "";

    data.servicio = servicioResumenDesdeDetalle(data.serviciosDetalle);
    data.descripcion = descripcionResumenDesdeDetalle(data.serviciosDetalle);
    data.archivos = archivosPlanosDesdeDetalle(data.serviciosDetalle);
    data.archivosGaleriaUrl = galeriaPrincipalDesdeDetalle(data.serviciosDetalle);
    data.archivosGaleriaId = "";

    if (esEdicionSolicitud) {
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando cambios...`;

      let direccionDetectada = null;

      if (data.direccion) {
        try {
          direccionDetectada = await resolverDireccionEscritaGoogle(data.direccion);
        } catch (error) {
          console.warn("No se pudo validar la dirección editada, se guarda el texto ingresado:", error);
        }
      }

      if (direccionDetectada) {
        data.zona = direccionDetectada.zonaLocalidad || direccionDetectada.zona || data.zona;
        data.localidad = direccionDetectada.localidad || "";
        data.partido = direccionDetectada.partido || "";
        data.provincia = direccionDetectada.provincia || "";
        data.direccion = direccionDetectada.direccion || data.direccion;
        data.lat = direccionDetectada.lat || null;
        data.lon = direccionDetectada.lon || null;

        data.geo = {
          zona: direccionDetectada.zona || "",
          zonaLocalidad: direccionDetectada.zonaLocalidad || "",
          localidad: direccionDetectada.localidad || "",
          partido: direccionDetectada.partido || "",
          provincia: direccionDetectada.provincia || "",
          direccion: direccionDetectada.direccion || "",
          lat: direccionDetectada.lat || null,
          lon: direccionDetectada.lon || null
        };
      }

      await updateDoc(doc(db, "solicitudes", solicitudEditandoId), {
        clienteNombre: data.nombre,
        clienteTelefono: data.telefono,

        servicio: data.servicio,
        serviciosDetalle: data.serviciosDetalle,
        serviciosCantidad: data.serviciosDetalle.length,

        emergencia: data.emergencia,
        zona: data.zona,
        localidad: data.localidad,
        partido: data.partido,
        provincia: data.provincia,
        direccion: data.direccion,
        lat: data.lat,
        lon: data.lon,
        geo: data.geo,

        fechaDeseada: data.fechaDeseada,
        horarioDeseado: data.horarioDeseado,

        descripcion: data.descripcion,
        archivos: data.archivos,
        archivosCantidad: data.archivos.length,
        archivosGaleriaUrl: data.archivosGaleriaUrl,

        actualizadoEn: serverTimestamp()
      });

      toastMsg("Solicitud actualizada");
      limpiarFormularioSolicitud();
      cerrarModal(modalSolicitud);
      await renderPaneles();
      return;
    }

    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando solicitud...`;

    const id = await guardarSolicitudServicio(data);

    abrirWhatsAppConMensaje(
      mensajeWhatsAppSolicitud({
        clienteNombre: data.nombre,
        clienteTelefono: data.telefono,
        servicio: data.servicio,
        serviciosDetalle: data.serviciosDetalle,
        emergencia: data.emergencia,
        zona: data.zona,
        localidad: data.localidad,
        partido: data.partido,
        provincia: data.provincia,
        direccion: data.direccion,
        lat: data.lat,
        lon: data.lon,
        fechaDeseada: data.fechaDeseada,
        horarioDeseado: data.horarioDeseado,
        descripcion: data.descripcion,
        archivos: data.archivos,
        archivosGaleriaId: data.archivosGaleriaId,
        archivosGaleriaUrl: data.archivosGaleriaUrl
      }, id),
      ventanaWhatsApp
    );

    limpiarFormularioSolicitud();
    cerrarModal(modalSolicitud);

    toastMsg("Solicitud guardada");
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
  movilidadHerramientas: true,
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

  if (!data.habilidades.length) {
    toastMsg("Elegí al menos una habilidad");
    return;
  }

try {
  if (prestadorAltaManualServicio && esAdminActual()) {
    await guardarPrestadorManual(data, prestadorAltaManualServicio);
    formPrestador.reset();
    restaurarModalPrestadorPublico();
    cerrarModal(modalPrestador);
    await renderEquipo();
    return;
  }

  await guardarInscripcionPrestador(data);
  formPrestador.reset();
} catch (error) {
    console.error(error);
    toastMsg("No se pudo enviar la inscripción");
  }
});

/* =========================================================
   FORM INFORME
========================================================= */

formInformeServicio?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!informeSolicitudActual) {
    toastMsg("No hay solicitud seleccionada");
    return;
  }

  const btn = formInformeServicio.querySelector("button[type='submit']");

  try {
    btn.disabled = true;
    btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Guardando informe...`;

const archivosInformeParaSubir = obtenerArchivosInformeParaSubir();

let subida = {
  archivos: [],
  galeriaUrl: "",
  galeriaId: ""
};

if (archivosInformeParaSubir.length) {
  subida = await subirArchivosSolicitud(
    archivosInformeParaSubir,
    informeSolicitudActual.clienteTelefono || ""
  );
}
const servicioInformeId = informeServicioDetalleActual?.id || "principal";
const servicioInformeNombre = informeServicioDetalleActual?.servicio || informeSolicitudActual.servicio || "";
const fechaInforme = informeServicioDetalleActual?.fechaDeseada || informeSolicitudActual.fechaDeseada || "";
const horarioInforme = informeServicioDetalleActual?.horarioDeseado || informeSolicitudActual.horarioDeseado || "";

const dataInforme = {
  solicitudId: informeSolicitudActual.id,
  servicioId: servicioInformeId,
  clienteNombre: informeSolicitudActual.clienteNombre || "",
  clienteTelefono: informeSolicitudActual.clienteTelefono || "",
  servicio: servicioInformeNombre,
  direccion: informeSolicitudActual.direccion || "",
  fechaDeseada: fechaInforme,
  horarioDeseado: horarioInforme,

costoManoObra: limpiar(informeCostoManoObra?.value),
costoMateriales: limpiar(informeCostoMateriales?.value),
costoTotal: limpiar(informeCostoTotal?.value),
garantiaTiempo: limpiar(informeGarantiaTiempo?.value),
garantiaVencimiento: limpiar(informeGarantiaVencimiento?.value),

  trabajo: limpiar(informeTrabajo?.value),
  observaciones: limpiar(informeObservaciones?.value),
  firmaCliente: informeFirmaDataUrl || "",

  archivos: [
    ...(Array.isArray(informeCargadoData?.archivos) ? informeCargadoData.archivos : []),
    ...(subida.archivos || [])
  ],

  archivosGaleriaId: subida.galeriaId || informeCargadoData?.archivosGaleriaId || "",
  archivosGaleriaUrl: subida.galeriaUrl || informeCargadoData?.archivosGaleriaUrl || "",
  actualizadoEn: serverTimestamp(),
  creadoEn: informeCargadoData?.creadoEn || serverTimestamp(),
  creadoPorUid: informeCargadoData?.creadoPorUid || usuarioActual?.uid || "",
  creadoPorEmail: informeCargadoData?.creadoPorEmail || usuarioActual?.email || ""
};

let informeRefId = informeCargadoId;

if (informeCargadoId) {
  await updateDoc(doc(db, "informesServicio", informeCargadoId), dataInforme);
} else {
  const informeRef = await addDoc(collection(db, "informesServicio"), dataInforme);
  informeRefId = informeRef.id;
}

const nuevosServiciosInforme = actualizarServicioDetalleLocal(
  informeSolicitudActual,
  servicioInformeId,
  {
    tieneInforme: true,
    informeId: informeRefId,
    estado: "cerrado"
  }
);

if (nuevosServiciosInforme) {
  await updateDoc(doc(db, "solicitudes", informeSolicitudActual.id), {
    serviciosDetalle: nuevosServiciosInforme,
    actualizadoEn: serverTimestamp()
  });
} else {
  await updateDoc(doc(db, "solicitudes", informeSolicitudActual.id), {
    tieneInforme: true,
    informeId: informeRefId,
    estado: "cerrado",
    actualizadoEn: serverTimestamp()
  });
}

toastMsg(informeCargadoId ? "Informe actualizado" : "Informe guardado");
    cerrarModal(modalInformeServicio);
    await renderPaneles();

  } catch (error) {
    console.error(error);
    toastMsg("No se pudo guardar el informe");

  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Guardar informe`;
  }
});

function abrirVistaInformePdf() {
  if (!informeSolicitudActual) {
    toastMsg("No hay solicitud seleccionada");
    return;
  }

  const trabajo = limpiar(informeTrabajo?.value);
  const observaciones = limpiar(informeObservaciones?.value);

const costoManoObra = limpiar(informeCostoManoObra?.value);
const costoMateriales = limpiar(informeCostoMateriales?.value);
const costoTotal = limpiar(informeCostoTotal?.value);
const garantiaTiempo = limpiar(informeGarantiaTiempo?.value);
const garantiaVencimiento = limpiar(informeGarantiaVencimiento?.value);

const servicioPdf = informeServicioDetalleActual?.servicio || informeSolicitudActual.servicio || "";
const fechaPdf = informeServicioDetalleActual?.fechaDeseada || informeSolicitudActual.fechaDeseada || "";
const horarioPdf = informeServicioDetalleActual?.horarioDeseado || informeSolicitudActual.horarioDeseado || "";

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <title>Informe Multi24</title>
      <style>
        body{
          margin:0;
          padding:28px;
          font-family:Arial, Helvetica, sans-serif;
          color:#071b3a;
          background:#fff;
        }

        .page{
          max-width:820px;
          margin:0 auto;
        }

        header{
          display:flex;
          justify-content:space-between;
          align-items:flex-start;
          border-bottom:3px solid #071b3a;
          padding-bottom:16px;
          margin-bottom:20px;
        }

        h1{
          margin:0;
          font-size:30px;
        }

        h2{
          margin:22px 0 8px;
          font-size:20px;
          color:#e11f2a;
        }

        p{
          line-height:1.5;
          white-space:pre-wrap;
        }

        .meta{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:10px;
          margin-top:14px;
        }

        .box{
          border:1px solid rgba(7,27,58,.18);
          border-radius:14px;
          padding:12px;
          background:#f8fbff;
        }

        .firma{
          margin-top:28px;
          border-top:1px solid rgba(7,27,58,.2);
          padding-top:16px;
        }

        .firma img{
          width:300px;
          max-height:120px;
          object-fit:contain;
          border:1px solid rgba(7,27,58,.15);
          border-radius:10px;
          background:#fff;
        }

        .actions{
          margin:20px 0;
          display:flex;
          gap:10px;
        }

        button{
          border:none;
          border-radius:999px;
          padding:12px 18px;
          font-weight:900;
          cursor:pointer;
        }

        .primary{
          background:#071b3a;
          color:#fff;
        }

        @media print{
          .actions{ display:none; }
          body{ padding:0; }
          .page{ max-width:none; }
        }
      </style>
    </head>

    <body>
      <div class="page">
        <header>
          <div>
            <h1>MULTI24</h1>
            <strong>Informe de servicio</strong>
          </div>

          <div>
            <strong>Fecha:</strong>
            ${new Date().toLocaleDateString("es-AR")}
          </div>
        </header>

        <div class="meta">
          <div class="box">
            <strong>Cliente</strong><br>
            ${escaparHtml(informeSolicitudActual.clienteNombre || "")}<br>
            ${escaparHtml(informeSolicitudActual.clienteTelefono || "")}
          </div>

          <div class="box">
            <strong>Servicio</strong><br>
${escaparHtml(servicioPdf || "")}<br>
${escaparHtml(fechaPdf || "")}
${escaparHtml(horarioPdf || "")}
          </div>

          <div class="box" style="grid-column:1/-1">
            <strong>Dirección</strong><br>
            ${escaparHtml(informeSolicitudActual.direccion || "")}
          </div>
        </div>

<h2>Valores / costos</h2>
<div class="meta">
  <div class="box">
    <strong>Mano de obra</strong><br>
    ${escaparHtml(costoManoObra || "Sin cargar")}
  </div>

  <div class="box">
    <strong>Materiales</strong><br>
    ${escaparHtml(costoMateriales || "Sin cargar")}
  </div>

  <div class="box">
    <strong>Total</strong><br>
    ${escaparHtml(costoTotal || "Sin cargar")}
  </div>

<div class="box" style="grid-column:1/-1">
  <strong>Garantía</strong><br>
  ${escaparHtml(garantiaTiempo || "Sin cargar")}
  ${garantiaVencimiento ? `<br><small>Vence: ${escaparHtml(fechaDeseadaBonita(garantiaVencimiento))}</small>` : ""}
</div>
</div>
       
        <h2>Trabajo realizado</h2>
        <p>${escaparHtml(trabajo || "Sin detalle cargado.")}</p>

        <h2>Observaciones / recomendaciones</h2>
        <p>${escaparHtml(observaciones || "Sin observaciones.")}</p>

        <div class="firma">
          <h2>Firma del cliente</h2>
          ${
            informeFirmaDataUrl
              ? `<img src="${informeFirmaDataUrl}" alt="Firma del cliente" />`
              : `<p>Sin firma cargada.</p>`
          }
        </div>

        <div class="actions">
          <button class="primary" onclick="window.print()">Guardar / imprimir PDF</button>
        </div>
      </div>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");

  if (!win) {
    toastMsg("El navegador bloqueó la ventana del PDF");
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();
}

btnVistaInformePdf?.addEventListener("click", abrirVistaInformePdf);

informeCostoManoObra?.addEventListener("input", actualizarTotalInforme);
informeCostoMateriales?.addEventListener("input", actualizarTotalInforme);

informeCostoTotal?.addEventListener("input", () => {
  informeTotalEditadoManual = true;
});

informeGarantiaTiempo?.addEventListener("input", actualizarVencimientoGarantiaDesdeTiempo);
informeGarantiaVencimiento?.addEventListener("input", actualizarTiempoGarantiaDesdeVencimiento);

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

const SW_VERSION = "2026-06-17-hero-side-01";

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
