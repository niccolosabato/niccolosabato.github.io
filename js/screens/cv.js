// Curriculum: come la scheda di un progetto, ma il contenuto è il PDF.
// L'elenco dei link segue lo stesso schema di project.js: cursore, invio
// invertito, piede con A:APRI. Al momento c'è una voce sola, APRI PDF.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni } from "../audio.js";
import { intestazione, piede, avviso, apriLink } from "./ui.js";

const PDF = "cv.pdf";
const RIGA_TIPO = 2;
const RIGA_DESCRIZIONE = 4;
const RESPIRO_PIEDE = 2;   // righe vuote fra l'elenco e il piede

const LINK = [{ label: "APRI PDF", url: PDF }];

export function creaCurriculum() {
  const descrizione = S.wrap(
    "Formazione, esperienze e competenze. Apri il PDF per leggerlo per intero.",
    S.COLS
  );

  let scelta = 0;
  let messaggio = null;

  return {
    draw() {
      intestazione("curriculum");
      S.text("CURRICULUM VITAE", 0, RIGA_TIPO, 2);
      descrizione.forEach((r, k) => S.text(r, 0, RIGA_DESCRIZIONE + k, 3));

      // L'elenco sta in basso, con due righe di respiro prima del piede, come
      // la descrizione nelle schede progetto: la descrizione resta in alto.
      const rigaLink = S.ROWS - 1 - RESPIRO_PIEDE - LINK.length;
      LINK.forEach((l, k) => {
        const riga = rigaLink + k;
        if (k === scelta) {
          S.textInvert("  " + l.label, 0, riga);
          S.triangolo(0, riga, "destra", 0);
        } else {
          S.text("  " + l.label, 0, riga, 3);
        }
      });

      piede("A:APRI  B:INDIETRO");
      if (messaggio) avviso(messaggio);
    },

    input(cmd) {
      if (messaggio) { messaggio = null; return; }
      if (cmd === "up" && scelta > 0) { scelta--; suoni.muovi(); }
      else if (cmd === "down" && scelta < LINK.length - 1) { scelta++; suoni.muovi(); }
      else if (cmd === "b") { suoni.indietro(); R.indietro(); }
      else if (cmd === "a") {
        const l = LINK[scelta];
        if (!l) return;
        if (apriLink(l.url)) suoni.apri();
        else { messaggio = "PDF NON ANCORA DISPONIBILE"; suoni.bloccato(); }
      }
    },
  };
}
