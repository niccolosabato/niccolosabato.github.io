// Avvio della sessione e cambio vista. Il sito sta in una schermata sola,
// senza scorrimento, quindi non c'è nessun observer: al caricamento (e a
// ogni cambio vista) i blocchi si stampano in sequenza da soli, uno dopo
// l'altro, con un offset cumulativo in --t0 che le animazioni CSS leggono.
//
// Un clic, un tasto o una rotellina mentre la sessione si sta stampando
// saltano le animazioni. La finestra di salto dura quanto la stampa della
// vista corrente, poi i listener si tolgono da soli.

import { vistaHome, vistaVoce } from "./render.js";
import { prepara, durataStampa, salta } from "./print.js";

const radice = document.documentElement;
const contenuto = document.getElementById("contenuto");
const fine = document.getElementById("fine");

// Con ?statico nell'indirizzo niente macchina da scrivere: serve a chi non
// vuole animazioni e agli screenshot di verifica; in quella modalità non
// parte nemmeno l'evento di vista.
const statico = new URLSearchParams(location.search).has("statico");

const GESTI = ["pointerdown", "keydown", "wheel", "touchstart"];
let timerFinestra = null;

function disarma() {
  clearTimeout(timerFinestra);
  timerFinestra = null;
  for (const evento of GESTI) {
    removeEventListener(evento, interrompi, { capture: true });
  }
}

function interrompi() {
  salta();
  disarma();
}

function armaSalto(durataTotale) {
  disarma();
  for (const evento of GESTI) {
    addEventListener(evento, interrompi, { capture: true, passive: true });
  }
  timerFinestra = setTimeout(disarma, durataTotale + 200);
}

/** Mette in coda di stampa i blocchi della vista: a ognuno il suo --t0,
 *  l'istante in cui comincia, sommando le durate di quelli prima.
 *  Restituisce la durata complessiva. */
function stampaSequenza(blocchi) {
  let t0 = 0;
  for (const blocco of blocchi) {
    prepara(blocco);
    blocco.style.setProperty("--t0", t0 + "ms");
    blocco.classList.add("visto");
    t0 += durataStampa(blocco);
  }
  return t0;
}

function subito(blocchi) {
  for (const blocco of blocchi) {
    prepara(blocco);
    blocco.classList.add("visto");
  }
}

/** La vista corrente la decide l'hash: #openfit è la scheda del progetto
 *  openfit, #violenza-sessuale quella dell'analisi, qualunque altra cosa (o
 *  niente) è la home. Una scheda manda anche l'evento `vista_progetto` a GA:
 *  passando dall'hash non sarebbe una page_view. Col ?statico l'evento
 *  resta spento. */
function mostra() {
  const id = decodeURIComponent(location.hash.replace(/^#/, ""));
  const vista = id ? vistaVoce(id) : null;
  contenuto.innerHTML = vista || vistaHome();

  if (vista && !statico && typeof window.gtag === "function") {
    gtag("event", "vista_progetto", { progetto: id });
  }

  const blocchi = [...contenuto.querySelectorAll(".blocco"), fine];
  if (radice.classList.contains("istantaneo")) {
    subito(blocchi);
  } else {
    armaSalto(stampaSequenza(blocchi));
  }
}

addEventListener("hashchange", mostra);

if (statico) {
  salta();
}

mostra();
