// Opzioni: palette dello schermo e audio. Le scelte restano in localStorage.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni, setMuto, isMuto } from "../audio.js";
import { PALETTES } from "../palettes.js";
import { intestazione } from "./ui.js";
import { salvaPreferenze } from "../prefs.js";

const RIGA_VOCI = 3;

export function creaOpzioni() {
  let scelta = 0;
  let palette = Math.max(0, PALETTES.findIndex((p) => p.colori[0] === S.colore(0)));

  function applica() {
    S.setPalette(PALETTES[palette].colori);
    salvaPreferenze({ palette: PALETTES[palette].id, muto: isMuto() });
  }

  const voci = [
    {
      etichetta: "PALETTE",
      valore: () => PALETTES[palette].nome,
      cambia: (d) => {
        palette = (palette + d + PALETTES.length) % PALETTES.length;
        applica();
      },
    },
    {
      etichetta: "AUDIO",
      valore: () => (isMuto() ? "SPENTO" : "ACCESO"),
      cambia: () => {
        setMuto(!isMuto());
        applica();
      },
    },
  ];

  return {
    draw() {
      intestazione("opzioni");

      voci.forEach((v, k) => {
        const riga = RIGA_VOCI + k * 2;
        const attiva = k === scelta;
        S.text("  " + v.etichetta, 0, riga, 3);
        if (attiva) S.triangolo(0, riga, "destra", 3);

        const valore = v.valore();
        const colonna = S.COLS - 2 - valore.length;
        S.text(valore, colonna, riga, attiva ? 3 : 2);
        if (attiva) {
          S.triangolo(colonna - 2, riga, "sinistra", 3);
          S.triangolo(S.COLS - 1, riga, "destra", 3);
        }
      });

      S.text("Le scelte restano su questo", 0, 12, 2);
      S.text("browser.", 0, 13, 2);

      S.triangolo(0, S.ROWS - 1, "sinistra", 2);
      S.triangolo(1, S.ROWS - 1, "destra", 2);
      S.text(":CAMBIA  B:INDIETRO", 2, S.ROWS - 1, 2);
    },

    input(cmd) {
      if (cmd === "up" && scelta > 0) { scelta--; suoni.muovi(); }
      else if (cmd === "down" && scelta < voci.length - 1) { scelta++; suoni.muovi(); }
      else if (cmd === "left") { voci[scelta].cambia(-1); suoni.muovi(); }
      else if (cmd === "right" || cmd === "a") { voci[scelta].cambia(+1); suoni.conferma(); }
      else if (cmd === "b") { suoni.indietro(); R.indietro(); }
    },
  };
}
