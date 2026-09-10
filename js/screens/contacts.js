// Contatti: elenco a sinistra, il valore per esteso nel riquadro in fondo.

import * as R from "../router.js";
import { suoni } from "../audio.js";
import { CONTATTI } from "../../data/contacts.js";
import { intestazione, piede, lista, riquadro, avviso, apriLink } from "./ui.js";

const RIGA_LISTA = 3;
const RIGA_ANTEPRIMA = 17;

export function creaContatti() {
  let scelta = 0;
  let messaggio = null;

  return {
    draw() {
      intestazione("contatti");
      lista(CONTATTI.map((c) => c.label), scelta, RIGA_LISTA);

      const c = CONTATTI[scelta];
      riquadro([c.valore], RIGA_ANTEPRIMA, 1);

      piede(c.url ? "A:APRI  B:INDIETRO" : "B:INDIETRO");
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
