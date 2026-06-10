/* =========================================================
   MULTISERVICE24 - APP JS
   Firebase + Solicitudes + Login + WhatsApp
========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* =========================================================
   1) CONFIG FIREBASE
   Este bloque es el de tu proyecto Multiservice24
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

/* =========================================================
   2) CONFIG GENERAL
========================================================= */

/*
  IMPORTANTE:
  Cambiá este número por el WhatsApp real de Multiservice24.

  Formato Argentina:
  54 + 9 + característica + número

  Ejemplo:
  5491112345678
*/

const WHATSAPP_NUMERO = "5491112345678";

/*
  Email admin:
  El email que pongas acá va a ver el panel interno.
  Si vas a usar otro email, cambialo.
*/

const ADMIN_EMAILS = [
  "vidaabundante.tristansuarez@gmail.com"
];

/* =========================================================
   3) SELECTORES
========================================================= */

const $ = (id) => document.getElementById(id);

const btnLogin = $("btnLogin");
const modalLogin = $("modalLogin");
const cerrarLogin = $("cerrarLogin");

const loginEmail = $("loginEmail");
const loginPass = $("loginPass");
const hacerLogin = $("hacerLogin");
const crearCuenta = $("crearCuenta");
const cerrarSesion = $("cerrarSesion");
const loginMsg = $("loginMsg");

const btnContactoRapido = $("btnContactoRapido");
const btnVerFormulario = $("btnVerFormulario");
const formularioBox = $("formularioBox");
const formSolicitud = $("formSolicitud");

const solNombre = $("solNombre");
const solTelefono = $("solTelefono");
const solServicio = $("solServicio");
const solZona = $("solZona");
const solMensaje = $("solMensaje");

const panelCliente = $("panelCliente");
const panelAdmin = $("panelAdmin");
const misSolicitudes = $("misSolicitudes");
const adminSolicitudes = $("adminSolicitudes");

const whatsappFloat = $("whatsappFloat");

/* =========================================================
   4) ESTADO
========================================================= */

let usuarioActual = null;
let esAdmin = false;

/* =========================================================
   5) HELPERS
========================================================= */

function limpiarTexto(valor) {
  return String(valor || "").trim();
}

function fechaSimpleDesdeTimestamp(ts) {
  try {
    if (!ts) return "Sin fecha";
    const fecha = ts.toDate ? ts.toDate() : new Date(ts);
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

function abrirWhatsApp(mensaje) {
  if (!WHATSAPP_NUMERO || WHATSAPP_NUMERO === "5491112345678") {
    alert("Falta configurar el número de WhatsApp real en app.js");
    return;
  }

  const texto = encodeURIComponent(mensaje);
  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${texto}`;
  window.open(url, "_blank");
}

function mensajeSolicitudWhatsApp(datos, idSolicitud = "") {
  const partes = [];

  partes.push("Hola, quiero solicitar un servicio.");
  partes.push("");

  if (idSolicitud) {
    partes.push(`Solicitud: ${idSolicitud}`);
  }

  partes.push(`Nombre: ${datos.nombre || "Sin nombre"}`);
  partes.push(`Teléfono: ${datos.telefono || "Sin teléfono"}`);
  partes.push(`Servicio: ${datos.servicio || "Contacto rápido"}`);

  if (datos.zona) {
    partes.push(`Zona: ${datos.zona}`);
  }

  if (datos.mensaje) {
    partes.push("");
    partes.push(`Mensaje: ${datos.mensaje}`);
  }

  return partes.join("\n");
}

function setLoginMsg(texto) {
  if (loginMsg) loginMsg.textContent = texto || "";
}

function abrirModalLogin() {
  modalLogin?.classList.remove("hidden");
  setLoginMsg("");
}

function cerrarModalLogin() {
  modalLogin?.classList.add("hidden");
  setLoginMsg("");
}

function mostrarFormulario() {
  formularioBox?.classList.remove("hidden");
  formularioBox?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function esUsuarioAdmin(user) {
  const email = String(user?.email || "").toLowerCase();
  return ADMIN_EMAILS.map(e => e.toLowerCase()).includes(email);
}

function htmlSolicitud(data, id = "") {
  const fecha = fechaSimpleDesdeTimestamp(data.createdAt);

  return `
    <article class="item-solicitud">
      <h3>${data.servicio || "Solicitud"}</h3>
      <p><strong>Nombre:</strong> ${data.nombre || "Sin nombre"}</p>
      <p><strong>Teléfono:</strong> ${data.telefono || "Sin teléfono"}</p>
      <p><strong>Zona:</strong> ${data.zona || "Sin zona"}</p>
      <p><strong>Mensaje:</strong> ${data.mensaje || "Sin mensaje"}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
      <p><span class="estado">${data.estado || "nuevo"}</span></p>
      ${
        id
          ? `<button class="btn-light btn-whatsapp-item" data-id="${id}">
              <i class="fa-brands fa-whatsapp"></i>
              Abrir WhatsApp
            </button>`
          : ""
      }
    </article>
  `;
}

/* =========================================================
   6) LOGIN / CUENTAS
========================================================= */

btnLogin?.addEventListener("click", () => {
  abrirModalLogin();
});

cerrarLogin?.addEventListener("click", () => {
  cerrarModalLogin();
});

modalLogin?.addEventListener("click", (e) => {
  if (e.target === modalLogin) cerrarModalLogin();
});

crearCuenta?.addEventListener("click", async () => {
  const email = limpiarTexto(loginEmail?.value);
  const pass = limpiarTexto(loginPass?.value);

  if (!email || !pass) {
    setLoginMsg("Completá email y contraseña.");
    return;
  }

  if (pass.length < 6) {
    setLoginMsg("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  try {
    setLoginMsg("Creando cuenta...");
    await createUserWithEmailAndPassword(auth, email, pass);
    setLoginMsg("Cuenta creada correctamente.");
    cerrarModalLogin();
  } catch (error) {
    console.error(error);
    setLoginMsg("No se pudo crear la cuenta. Revisá el email o la contraseña.");
  }
});

hacerLogin?.addEventListener("click", async () => {
  const email = limpiarTexto(loginEmail?.value);
  const pass = limpiarTexto(loginPass?.value);

  if (!email || !pass) {
    setLoginMsg("Completá email y contraseña.");
    return;
  }

  try {
    setLoginMsg("Ingresando...");
    await signInWithEmailAndPassword(auth, email, pass);
    setLoginMsg("Sesión iniciada.");
    cerrarModalLogin();
  } catch (error) {
    console.error(error);
    setLoginMsg("No se pudo ingresar. Revisá email y contraseña.");
  }
});

cerrarSesion?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    cerrarModalLogin();
  } catch (error) {
    console.error(error);
    setLoginMsg("No se pudo cerrar sesión.");
  }
});

/* =========================================================
   7) SOLICITUD RÁPIDA
========================================================= */

btnContactoRapido?.addEventListener("click", async () => {
  const nombre = prompt("Tu nombre:");
  if (!nombre) return;

  const telefono = prompt("Tu WhatsApp:");
  if (!telefono) return;

  const datos = {
    tipo: "contacto_rapido",
    nombre: limpiarTexto(nombre),
    telefono: limpiarTexto(telefono),
    servicio: "Contacto rápido",
    zona: "",
    mensaje: "Quiero que me contacten.",
    estado: "nuevo",
    clienteUid: usuarioActual?.uid || null,
    clienteEmail: usuarioActual?.email || "",
    createdAt: serverTimestamp()
  };

  try {
    const ref = await addDoc(collection(db, "solicitudes"), datos);

    abrirWhatsApp(
      mensajeSolicitudWhatsApp(datos, ref.id)
    );

    alert("Solicitud guardada. Ahora se abrirá WhatsApp.");
    await cargarPaneles();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar la solicitud.");
  }
});

/* =========================================================
   8) FORMULARIO COMPLETO
========================================================= */

btnVerFormulario?.addEventListener("click", () => {
  mostrarFormulario();
});

formSolicitud?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datos = {
    tipo: "solicitud_servicio",
    nombre: limpiarTexto(solNombre?.value),
    telefono: limpiarTexto(solTelefono?.value),
    servicio: limpiarTexto(solServicio?.value),
    zona: limpiarTexto(solZona?.value),
    mensaje: limpiarTexto(solMensaje?.value),
    estado: "nuevo",
    clienteUid: usuarioActual?.uid || null,
    clienteEmail: usuarioActual?.email || "",
    createdAt: serverTimestamp()
  };

  if (!datos.nombre || !datos.telefono || !datos.servicio) {
    alert("Completá nombre, teléfono y servicio.");
    return;
  }

  try {
    const ref = await addDoc(collection(db, "solicitudes"), datos);

    formSolicitud.reset();

    abrirWhatsApp(
      mensajeSolicitudWhatsApp(datos, ref.id)
    );

    alert("Solicitud guardada correctamente.");
    await cargarPaneles();
  } catch (error) {
    console.error(error);
    alert("No se pudo guardar la solicitud.");
  }
});

/* =========================================================
   9) CARGAR PANELES
========================================================= */

async function cargarPanelCliente() {
  if (!usuarioActual) {
    if (misSolicitudes) misSolicitudes.innerHTML = "";
    return;
  }

  try {
    const q = query(
      collection(db, "solicitudes"),
      where("clienteUid", "==", usuarioActual.uid),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (!misSolicitudes) return;

    if (snap.empty) {
      misSolicitudes.innerHTML = `
        <div class="item-solicitud">
          <p>Todavía no tenés solicitudes cargadas.</p>
        </div>
      `;
      return;
    }

    misSolicitudes.innerHTML = snap.docs
      .map(doc => htmlSolicitud(doc.data(), doc.id))
      .join("");

    activarBotonesWhatsAppCliente(snap.docs);
  } catch (error) {
    console.error(error);
    if (misSolicitudes) {
      misSolicitudes.innerHTML = `
        <div class="item-solicitud">
          <p>No se pudieron cargar tus solicitudes.</p>
        </div>
      `;
    }
  }
}

async function cargarPanelAdmin() {
  if (!esAdmin) {
    if (adminSolicitudes) adminSolicitudes.innerHTML = "";
    return;
  }

  try {
    const q = query(
      collection(db, "solicitudes"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);

    if (!adminSolicitudes) return;

    if (snap.empty) {
      adminSolicitudes.innerHTML = `
        <div class="item-solicitud">
          <p>No hay solicitudes todavía.</p>
        </div>
      `;
      return;
    }

    adminSolicitudes.innerHTML = snap.docs
      .map(doc => htmlSolicitud(doc.data(), doc.id))
      .join("");

    activarBotonesWhatsAppCliente(snap.docs);
  } catch (error) {
    console.error(error);
    if (adminSolicitudes) {
      adminSolicitudes.innerHTML = `
        <div class="item-solicitud">
          <p>No se pudieron cargar las solicitudes.</p>
        </div>
      `;
    }
  }
}

async function cargarPaneles() {
  await cargarPanelCliente();
  await cargarPanelAdmin();
}

function activarBotonesWhatsAppCliente(docs) {
  const mapa = new Map();

  docs.forEach(doc => {
    mapa.set(doc.id, doc.data());
  });

  document.querySelectorAll(".btn-whatsapp-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const data = mapa.get(id);

      if (!data) return;

      abrirWhatsApp(
        mensajeSolicitudWhatsApp(data, id)
      );
    });
  });
}

/* =========================================================
   10) ESTADO DE SESIÓN
========================================================= */

onAuthStateChanged(auth, async (user) => {
  usuarioActual = user || null;
  esAdmin = esUsuarioAdmin(user);

  if (user) {
    btnLogin.innerHTML = `
      <i class="fa-solid fa-user-check"></i>
      Cuenta
    `;

    cerrarSesion?.classList.remove("hidden");
    panelCliente?.classList.remove("hidden");

    if (esAdmin) {
      panelAdmin?.classList.remove("hidden");
    } else {
      panelAdmin?.classList.add("hidden");
    }

    await cargarPaneles();
  } else {
    btnLogin.innerHTML = `
      <i class="fa-solid fa-user"></i>
      Ingresar
    `;

    cerrarSesion?.classList.add("hidden");
    panelCliente?.classList.add("hidden");
    panelAdmin?.classList.add("hidden");

    if (misSolicitudes) misSolicitudes.innerHTML = "";
    if (adminSolicitudes) adminSolicitudes.innerHTML = "";
  }
});

/* =========================================================
   11) WHATSAPP FLOTANTE
========================================================= */

if (whatsappFloat) {
  whatsappFloat.addEventListener("click", (e) => {
    e.preventDefault();

    abrirWhatsApp(
      "Hola, quiero hacer una consulta por un servicio de Multiservice24."
    );
  });
}
