// Tastiera, mouse e touch vengono ridotti a sei comandi astratti:
// "up", "down", "left", "right", "a", "b", "start", "select".
// Chi sta sopra (il router) non sa da dove sia arrivata la pressione.

const MAPPA_TASTI = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", s: "down", a: "left", d: "right",
  z: "a", " ": "a", Enter: "a",
  x: "b", Escape: "b", Backspace: "b",
  p: "start", Shift: "select",
};

// Comandi che non hanno senso ripetuti tenendo premuto il tasto.
const NO_RIPETIZIONE = new Set(["a", "b", "start", "select"]);

const DIREZIONI = new Set(["up", "down", "left", "right"]);

function comandoDaTasto(e) {
  return MAPPA_TASTI[e.key] || MAPPA_TASTI[e.key.toLowerCase()] || null;
}

/** Accende per un attimo il tasto corrispondente sul guscio, così anche chi
 *  usa la tastiera vede la console reagire. */
function lampeggia(root, cmd) {
  if (DIREZIONI.has(cmd)) {
    const dpad = root.querySelector(".dpad");
    if (!dpad) return;
    const classe = "pressed-" + cmd;
    dpad.classList.add(classe);
    setTimeout(() => dpad.classList.remove(classe), 110);
    return;
  }
  const el = root.querySelector(`[data-btn="${cmd}"]`);
  if (!el) return;
  el.classList.add("pressed");
  setTimeout(() => el.classList.remove("pressed"), 110);
}

/** Dopo un clic col dito o col mouse il tasto resta a fuoco. Il fuoco lì non
 *  serve a niente — la tastiera è ascoltata sulla finestra, non sui tasti — ma
 *  alla prima pressione di un tasto il browser decide che quel fuoco va
 *  mostrato e disegna l'anello sull'ultimo tasto toccato, dove resta finché non
 *  si clicca altrove. Quindi lo si lascia andare.
 *
 *  `detail` vale 0 se il clic arriva da Invio o dalla barra spaziatrice su un
 *  tasto già a fuoco: quello è il fuoco di chi naviga da tastiera e non va
 *  tolto, altrimenti perde il segno. */
export function lasciaIlFuoco(e) {
  if (e.detail > 0) e.currentTarget.blur();
}

/**
 * @param {HTMLElement} root  la console
 * @param {(cmd: string) => void} onPress
 */
export function attach(root, onPress) {
  const premi = (cmd) => {
    if (!cmd) return;
    lampeggia(root, cmd);
    onPress(cmd);
  };

  window.addEventListener("keydown", (e) => {
    const cmd = comandoDaTasto(e);
    if (!cmd) return;
    // Le frecce e la barra spaziatrice farebbero scorrere la pagina.
    e.preventDefault();
    if (e.repeat && NO_RIPETIZIONE.has(cmd)) return;
    premi(cmd);
  });

  // Si ascolta `click`, non `pointerdown`. Safari — su iOS in particolare —
  // apre una scheda nuova solo se la chiamata parte da un click vero: con
  // `pointerdown` i link dei progetti venivano bloccati in silenzio. Il ritardo
  // del tocco non c'è comunque, perché il CSS dichiara
  // `touch-action: manipulation`.
  root.querySelectorAll("[data-btn]").forEach((el) => {
    el.addEventListener("click", (e) => {
      lasciaIlFuoco(e);
      premi(el.dataset.btn);
    });
  });
}
