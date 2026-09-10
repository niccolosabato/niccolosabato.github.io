// Accensione: il logotipo scende dall'alto e si ferma al centro, poi parte il
// jingle. Come sul Game Boy vero si può saltare premendo un tasto.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni } from "../audio.js";
import { creaHome } from "./home.js";

const DISCESA = 1400;  // ms di caduta
const PAUSA = 900;     // ms di attesa prima del menu
const Y_PARTENZA = -18;
const Y_ARRIVO = 96;

function centrato(s, y, i) {
  S.textPx(s, Math.round((S.W - s.length * S.CELL) / 2), y, i);
}

export function creaBoot() {
  let t0 = null;
  let trascorso = 0;
  let suonato = false;
  let finito = false;

  function vaiAlMenu() {
    if (finito) return;
    finito = true;
    try { sessionStorage.setItem("visto-boot", "1"); } catch { /* ininfluente */ }
    R.sostituisci(creaHome());
  }

  return {
    anima: true,

    tick(t) {
      if (t0 === null) t0 = t;
      trascorso = t - t0;

      if (!suonato && trascorso >= DISCESA) {
        suonato = true;
        suoni.avvio();
      }
      if (trascorso >= DISCESA + PAUSA) {
        this.anima = false;
        vaiAlMenu();
      }
    },

    draw() {
      S.clear(0);
      const avanzamento = Math.min(1, trascorso / DISCESA);
      const y = Math.round(Y_PARTENZA + (Y_ARRIVO - Y_PARTENZA) * avanzamento);
      centrato("SABATO", y, 3);
      centrato("PORTFOLIO", y + 12, 3);
    },

    input(cmd) {
      if (cmd) {
        this.anima = false;
        vaiAlMenu();
      }
    },
  };
}
