// Home: è direttamente l'elenco dei progetti. Sotto, separate da un filetto,
// le due schermate di servizio. Non c'è un menu prima: si arriva e si sceglie.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni } from "../audio.js";
import { PROGETTI } from "../../data/projects.js";
import { piede, riquadro } from "./ui.js";
import { creaProgetto } from "./project.js";
import { creaContatti } from "./contacts.js";
import { creaOpzioni } from "./options.js";

const RIGA_LISTA = 4;
const VISIBILI = 10;
const RIGA_ANTEPRIMA = 16;

function voci() {
  return [
    ...PROGETTI.map((p) => ({ tipo: "progetto", nome: p.nome, progetto: p })),
    { tipo: "separatore" },
    {
      tipo: "azione",
      nome: "CONTATTI",
      apre: creaContatti,
      anteprima: ["COLLEGAMENTI", "GitHub, email, Telegram"],
    },
    {
      tipo: "azione",
      nome: "OPZIONI",
      apre: creaOpzioni,
      anteprima: ["IMPOSTAZIONI", "Palette e audio"],
    },
  ];
}

export function creaHome() {
  const VOCI = voci();
  let scelta = 0;
  let primo = 0;

  function muovi(passo) {
    let i = scelta + passo;
    while (VOCI[i] && VOCI[i].tipo === "separatore") i += passo;
    if (i < 0 || i >= VOCI.length) return;
    scelta = i;
    suoni.muovi();
  }

  function aggiornaScorrimento() {
    if (scelta < primo) primo = scelta;
    if (scelta >= primo + VISIBILI) primo = scelta - VISIBILI + 1;
  }

  return {
    draw() {
      S.clear(0);
      S.textCenter("SABATO", 0, 3);
      S.textCenter("PORTFOLIO", 1, 3);
      S.hr(2);

      aggiornaScorrimento();
      VOCI.slice(primo, primo + VISIBILI).forEach((v, k) => {
        const riga = RIGA_LISTA + k;
        if (v.tipo === "separatore") {
          S.hr(riga, 2);
          return;
        }
        if (primo + k === scelta) {
          S.textInvert("  " + v.nome, 0, riga);
          S.triangolo(0, riga, "destra", 0);
        } else {
          S.text("  " + v.nome, 0, riga, 3);
        }
      });

      if (primo > 0) S.triangolo(S.COLS - 1, RIGA_LISTA, "su", 2);
      if (primo + VISIBILI < VOCI.length) {
        S.triangolo(S.COLS - 1, RIGA_LISTA + VISIBILI - 1, "giu", 2);
      }

      const v = VOCI[scelta];
      const anteprima = v.tipo === "progetto" ? [v.progetto.tipo, v.progetto.riga] : v.anteprima;
      riquadro(anteprima, RIGA_ANTEPRIMA, 2);

      piede("A:APRI");
    },

    input(cmd) {
      if (cmd === "up") muovi(-1);
      else if (cmd === "down") muovi(+1);
      else if (cmd === "a" || cmd === "start") {
        const v = VOCI[scelta];
        suoni.conferma();
        R.apri(v.tipo === "progetto" ? creaProgetto(v.progetto) : v.apre());
      }
    },
  };
}
