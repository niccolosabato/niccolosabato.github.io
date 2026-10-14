// Avvio della sessione. Ogni blocco si stampa la prima volta che entra in
// vista, con un IntersectionObserver. Un clic, un tasto o una rotellina nei
// primi istanti (finché si stampa la prima sezione) saltano le animazioni:
// dopo quella finestra ogni sezione continua a stamparsi al suo ingresso,
// che è l'effetto voluto scorrendo.

import { costruisci, apriProgetto } from "./render.js";
import { prepara, durataStampa, salta } from "./print.js";

const radice = document.documentElement;
const contenuto = document.getElementById("contenuto");

costruisci(contenuto);

const blocchi = [...document.querySelectorAll(".blocco")];
blocchi.forEach(prepara);

/** Stampa un blocco: gli mette .visto, e le animazioni CSS fanno il resto. */
function stampa(blocco) {
  blocco.classList.add("visto");
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

/* La finestra di salto: finché la prima sezione si sta stampando, un gesto
   qualunque azzera le animazioni. Poi i listener si tolgono, altrimenti il
   primo clic della visita ucciderebbe anche le stampe successive. */

const GESTI = ["pointerdown", "keydown", "wheel", "touchstart"];
let finestraChiusa = false;
let attesa = null;

function chiudiFinestra() {
  if (finestraChiusa) return;
  finestraChiusa = true;
  clearTimeout(attesa);
  for (const evento of GESTI) {
    removeEventListener(evento, interrompi, { capture: true });
  }
}

function interrompi() {
  salta();
  chiudiFinestra();
}

/* Link profondo: /#openfit apre la scheda del progetto, /#contatti porta
   alla sezione. Il blocco interessato si stampa subito, senza aspettare
   l'observer, e ci si scorre fino. */
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

// Con ?statico nell'indirizzo tutto compare subito, senza macchina da
// scrivere: serve a chi non vuole animazioni e agli screenshot di verifica,
// perché Chromium headless non genera fotogrammi continui e l'observer qui
// sopra non scatterebbe mai.
const statico = new URLSearchParams(location.search).has("statico");

if (statico || radice.classList.contains("istantaneo")) {
  salta();
  stampaTutto();
} else {
  for (const evento of GESTI) {
    addEventListener(evento, interrompi, { capture: true, passive: true });
  }
  const primo = blocchi.find((b) => !b.classList.contains("visto"));
  attesa = setTimeout(chiudiFinestra, (primo ? durataStampa(primo) : 0) + 400);
  osserva();
}

seguiHash();
