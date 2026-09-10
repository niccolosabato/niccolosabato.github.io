// Contatti: etichetta e valore uno sotto l'altro, tutto visibile insieme. Il
// blocco si centra nello spazio disponibile invece di lasciare un vuoto.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni } from "../audio.js";
import { CONTATTI } from "../../data/contacts.js";
import { intestazione, piede, avviso, apriLink, bloccoCentrato } from "./ui.js";

const PRIMA_RIGA = 2;
const ULTIMA_RIGA = 18;
const RIGHE_PER_VOCE = 3;   // etichetta, valore, riga di stacco

export function creaContatti() {
  let scelta = 0;
  let messaggio = null;

  return {
    draw() {
      intestazione("contatti");

      // l'ultima voce non ha bisogno della riga di stacco finale
      const altezza = CONTATTI.length * RIGHE_PER_VOCE - 1;
      const riga0 = bloccoCentrato(altezza, PRIMA_RIGA, ULTIMA_RIGA);

      CONTATTI.forEach((c, k) => {
        const riga = riga0 + k * RIGHE_PER_VOCE;
        if (k === scelta) {
          S.textInvert("  " + c.label, 0, riga);
          S.triangolo(0, riga, "destra", 0);
        } else {
          S.text("  " + c.label, 0, riga, 3);
        }
        S.text(c.valore, 2, riga + 1, 2);
      });

      piede(CONTATTI[scelta].url ? "A:APRI  B:INDIETRO" : "B:INDIETRO");
      if (messaggio) avviso(messaggio);
    },

    input(cmd) {
      if (messaggio) { messaggio = null; return; }
      if (cmd === "up" && scelta > 0) { scelta--; suoni.muovi(); }
      else if (cmd === "down" && scelta < CONTATTI.length - 1) { scelta++; suoni.muovi(); }
      else if (cmd === "b") { suoni.indietro(); R.indietro(); }
      else if (cmd === "a") {
        if (apriLink(CONTATTI[scelta].url)) suoni.apri();
        else { messaggio = "CONTATTO NON ANCORA INSERITO"; suoni.bloccato(); }
      }
    },
  };
}
