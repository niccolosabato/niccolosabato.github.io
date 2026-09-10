// Avvio: prepara schermo, preferenze e input, poi accende la console.

import * as S from "./screen.js";
import * as R from "./router.js";
import { attach } from "./input.js";
import { setMuto, sblocca } from "./audio.js";
import { leggiPreferenze } from "./prefs.js";
import { creaHome } from "./screens/home.js";
import { creaBoot } from "./screens/boot.js";

const consoleEl = document.getElementById("console");
const canvas = document.getElementById("screen");

S.init(canvas);

const prefs = leggiPreferenze();
setMuto(prefs.muto === true); // acceso, a meno che non sia stato spento

let accesa = true;

function avvia() {
  const giaVisto = (() => {
    try { return sessionStorage.getItem("visto-boot"); } catch { return null; }
  })();
  const motoRidotto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  R.riparti(giaVisto || motoRidotto ? creaHome() : creaBoot());
}

// Il primo gesto sulla pagina sblocca l'audio. Si ascolta `pointerdown`, che
// arriva prima del `click` dei tasti: così il primo bip non si perde.
function primoGesto() {
  sblocca();
  window.removeEventListener("pointerdown", primoGesto);
  window.removeEventListener("keydown", primoGesto);
}
window.addEventListener("pointerdown", primoGesto);
window.addEventListener("keydown", primoGesto);

attach(consoleEl, (cmd) => {
  if (accesa) R.input(cmd);
});

document.getElementById("power").addEventListener("click", () => {
  accesa = !accesa;
  consoleEl.classList.toggle("off", !accesa);
  if (accesa) {
    try { sessionStorage.removeItem("visto-boot"); } catch { /* ininfluente */ }
    avvia();
  }
});

// Il canvas disegna con il font solo se è già caricato: senza attesa la prima
// schermata uscirebbe con il ripiego monospace.
document.fonts
  .load('8px "Press Start 2P"')
  .catch(() => {})
  .then(avvia);
