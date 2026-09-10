// Scheda di un singolo progetto: descrizione, stack e i link da aprire.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni } from "../audio.js";
import { intestazione, piede, avviso, apriLink } from "./ui.js";

const RIGA_TIPO = 2;
const RIGA_DESCRIZIONE = 4;
const RIGHE_DESCRIZIONE = 9;

export function creaProgetto(progetto) {
  const righe = S.wrap(progetto.descrizione, S.COLS);
  if (righe.length > RIGHE_DESCRIZIONE) {
    console.warn(
      `[${progetto.id}] la descrizione occupa ${righe.length} righe, il massimo è ${RIGHE_DESCRIZIONE}: verrà tagliata.`
    );
  }
  const descrizione = righe.slice(0, RIGHE_DESCRIZIONE);
  const link = progetto.link || [];

  let scelta = 0;
  let messaggio = null;

  return {
    draw() {
      intestazione(progetto.nome);
      S.text(progetto.tipo, 0, RIGA_TIPO, 2);

      descrizione.forEach((r, k) => S.text(r, 0, RIGA_DESCRIZIONE + k, 3));

      // Le sezioni si susseguono con una riga di stacco: con descrizioni corte
      // non resta un buco in mezzo alla schermata.
      let riga = RIGA_DESCRIZIONE + descrizione.length + 1;

      const stack = (progetto.stack || []).join(" · ");
      if (stack) {
        S.text(stack.slice(0, S.COLS), 0, riga, 2);
        riga += 2;
      }

      const rigaLink = riga;
      link.forEach((l, k) => {
        const etichetta = l.label + (l.url || l.qui ? "" : " (MANCA IL LINK)");
        const riga = rigaLink + k;
        if (k === scelta) {
          S.textInvert("  " + etichetta, 0, riga);
          S.triangolo(0, riga, "destra", 0);
        } else {
          S.text("  " + etichetta, 0, riga, 3);
        }
      });

      piede("A:APRI  B:INDIETRO");
      if (messaggio) avviso(messaggio);
    },

    input(cmd) {
      if (messaggio) {
        messaggio = null;
        return;
      }
      if (cmd === "up" && scelta > 0) { scelta--; suoni.muovi(); }
      else if (cmd === "down" && scelta < link.length - 1) { scelta++; suoni.muovi(); }
      else if (cmd === "b") { suoni.indietro(); R.indietro(); }
      else if (cmd === "a") {
        const l = link[scelta];
        if (!l) return;
        if (l.qui) { messaggio = "CI SEI GIÀ DENTRO"; suoni.conferma(); }
        else if (apriLink(l.url)) suoni.apri();
        else { messaggio = "LINK NON ANCORA DISPONIBILE"; suoni.bloccato(); }
      }
    },
  };
}
