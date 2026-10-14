// La piccola macchina di stampa. Le animazioni stanno in terminal.css; qui si
// preparano le variabili che consumano e si offre il modo di saltarle.

export const ridotto = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Quanto dura la scrittura del comando, in ms: proporzionale ai caratteri,
 *  con un pavimento e un soffitto perché resti sempre rapida. */
function durataComando(cmd) {
  if (!cmd) return 0;
  return Math.min(650, 120 + cmd.textContent.length * 24);
}

/** Imposta su un blocco (o una vista) le variabili CSS delle animazioni:
 *  --n e --t-cmd sul blocco, --i su ogni riga di output. */
export function prepara(blocco) {
  const cmd = blocco.querySelector(":scope > .riga-comando .comando");
  if (cmd) {
    blocco.style.setProperty("--n", String(cmd.textContent.length));
    blocco.style.setProperty("--t-cmd", durataComando(cmd) + "ms");
  }
  blocco.querySelectorAll(":scope > .righe > *").forEach((riga, i) => {
    riga.style.setProperty("--i", String(i));
  });
}

/** Quanto impiega il blocco a stamparsi tutto, in ms. Serve a main.js per
 *  sapere quando finisce l'avvio. */
export function durataStampa(blocco) {
  const cmd = blocco.querySelector(":scope > .riga-comando .comando");
  const righe = blocco.querySelectorAll(":scope > .righe > *").length;
  return durataComando(cmd) + righe * 45 + 220;
}

/** Salta tutte le animazioni: da chiamare al primo gesto dell'utente durante
 *  una stampa. Le animazioni con durata nulla arrivano subito allo stato
 *  finale, quindi nulla resta nascosto. */
export function salta() {
  document.documentElement.classList.add("istantaneo");
}
