// Avvio della sessione. Le righe di boot si stampano per prime; quando hanno
// finito, un IntersectionObserver stampa ogni blocco la prima volta che entra
// in vista. Un clic, un tasto o una rotellina durante la stampa saltano tutto:
// le animazioni si azzerano e ogni blocco diventa visibile subito.

import { costruisci, apriProgetto } from "./render.js";
import { prepara, durataStampa, salta } from "./print.js";

const radice = document.documentElement;
const boot = document.getElementById("boot");
const contenuto = document.getElementById("contenuto");

costruisci(boot, contenuto);

const blocchi = [...document.querySelectorAll(".blocco")];
blocchi.forEach(prepara);

/** Stampa un blocco: gli mette .visto, e le animazioni CSS fanno il resto. */
function stampa(blocco) {
  blocco.classList.add("visto");
}

/** Link profondo: /#openfit apre la scheda del progetto, /#contatti porta
 *  alla sezione. Il blocco interessato si stampa subito, senza aspettare
 *  l'observer, e ci si scorre fino. */
function seguiHash() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!id) return;
  const bottone = apriProgetto(id);
  if (bottone) {
    stampa(bottone.closest(".blocco"));
    const scheda = document.getElementById("scheda-" + id);
    if (scheda) scheda.scrollIntoView({ block: "center" });
    return;
  }
  const blocco = document.getElementById(id);
  if (blocco && blocco.classList.contains("blocco")) {
    stampa(blocco);
    blocco.scrollIntoView({ block: "start" });
  }
}

/** Tutti i blocchi visibili insieme, senza animazioni. */
function stampaTutto() {
  blocchi.forEach(stampa);
}

function osserva() {
  const daOsservare = blocchi.filter((b) => !b.classList.contains("visto"));
  if (!("IntersectionObserver" in window)) {
    daOsservare.forEach(stampa);
    return;
  }
  const io = new IntersectionObserver(
    (voci) => {
      for (const voce of voci) {
        if (voce.isIntersecting) {
          stampa(voce.target);
          io.unobserve(voce.target);
        }
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.05 },
  );
  daOsservare.forEach((b) => io.observe(b));
}

let bootFinito = false;
let attesa = null;

function fineBoot() {
  if (bootFinito) return;
  bootFinito = true;
  clearTimeout(attesa);
  for (const evento of GESTI) {
    removeEventListener(evento, interrompi, { capture: true });
  }
  osserva();
}

function interrompi() {
  salta();
  fineBoot();
}

const GESTI = ["pointerdown", "keydown", "wheel", "touchstart"];

stampa(boot); // le righe di avvio partono subito

// Con ?statico nell'indirizzo tutto compare subito, senza macchina da
// scrivere: serve a chi non vuole animazioni e agli screenshot di verifica,
// perché Chromium headless non genera fotogrammi continui e l'observer qui
// sotto non scatterebbe mai.
const statico = new URLSearchParams(location.search).has("statico");

if (statico || radice.classList.contains("istantaneo")) {
  salta();
  stampaTutto();
} else {
  for (const evento of GESTI) {
    addEventListener(evento, interrompi, { capture: true, passive: true });
  }
  attesa = setTimeout(fineBoot, durataStampa(boot) + 300);
}

seguiHash();
