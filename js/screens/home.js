// Home: è direttamente l'elenco dei contenuti, diviso per sezioni. Sotto,
// staccate da un filetto, le due voci di servizio. Non c'è un menu prima: si
// arriva e si sceglie.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni, setMuto, isMuto } from "../audio.js";
import { PROGETTI } from "../../data/projects.js";
import { piede, riquadro, bloccoCentrato } from "./ui.js";
import { creaProgetto } from "./project.js";
import { creaContatti } from "./contacts.js";
import { salvaPreferenze } from "../prefs.js";

const PRIMA_RIGA = 2;
const ULTIMA_RIGA = 15;   // sotto comincia il riquadro di anteprima
const RIGA_ANTEPRIMA = 16;
const VISIBILI = ULTIMA_RIGA - PRIMA_RIGA + 1;

const SELEZIONABILI = new Set(["progetto", "azione", "audio"]);

/** Costruisce l'elenco a partire dai dati: una sezione per ogni valore di
 *  `sezione`, nell'ordine in cui compare in data/projects.js. */
function costruisci() {
  const sezioni = new Map();
  for (const p of PROGETTI) {
    const nome = p.sezione || "PROGETTI";
    if (!sezioni.has(nome)) sezioni.set(nome, []);
    sezioni.get(nome).push(p);
  }

  const voci = [];
  for (const [nome, elenco] of sezioni) {
    if (voci.length) voci.push({ tipo: "vuoto" });
    voci.push({ tipo: "titolo", testo: nome });
    for (const p of elenco) voci.push({ tipo: "progetto", nome: p.nome, progetto: p });
  }

  voci.push({ tipo: "vuoto" });
  voci.push({ tipo: "filetto" });
  voci.push({
    tipo: "azione",
    nome: "CONTATTI",
    apre: creaContatti,
    anteprima: ["COLLEGAMENTI", "GitHub, email, Telegram"],
  });
  voci.push({ tipo: "audio", nome: "AUDIO" });
  return voci;
}

export function creaHome() {
  const VOCI = costruisci();
  let scelta = VOCI.findIndex((v) => SELEZIONABILI.has(v.tipo));
  let primo = 0;

  function muovi(passo) {
    let i = scelta + passo;
    while (VOCI[i] && !SELEZIONABILI.has(VOCI[i].tipo)) i += passo;
    if (i < 0 || i >= VOCI.length) return;
    scelta = i;
    suoni.muovi();
  }

  function cambiaAudio() {
    setMuto(!isMuto());
    salvaPreferenze({ muto: isMuto() });
    suoni.conferma(); // si sente solo se lo si è appena acceso
  }

  return {
    draw() {
      S.clear(0);
      S.textCenter("SABATO PORTFOLIO", 0, 3);
      S.sottolinea(0);

      // Se ci sta tutto, il blocco si centra fra intestazione e anteprima;
      // altrimenti si ancora in alto e scorre.
      const scorre = VOCI.length > VISIBILI;
      if (scorre) {
        if (scelta < primo) primo = scelta;
        if (scelta >= primo + VISIBILI) primo = scelta - VISIBILI + 1;
      } else {
        primo = 0;
      }
      const riga0 = scorre ? PRIMA_RIGA : bloccoCentrato(VOCI.length, PRIMA_RIGA, ULTIMA_RIGA);

      VOCI.slice(primo, primo + VISIBILI).forEach((v, k) => {
        const riga = riga0 + k;
        const attiva = primo + k === scelta;

        if (v.tipo === "vuoto") return;
        if (v.tipo === "filetto") return S.hr(riga, 2);
        if (v.tipo === "titolo") return S.text(v.testo, 0, riga, 2);

        if (attiva) {
          S.textInvert("  " + v.nome, 0, riga);
          S.triangolo(0, riga, "destra", 0);
        } else {
          S.text("  " + v.nome, 0, riga, 3);
        }

        if (v.tipo === "audio") {
          const valore = isMuto() ? "SPENTO" : "ACCESO";
          S.textRight(valore, riga, 2);
        }
      });

      if (scorre && primo > 0) S.triangolo(S.COLS - 1, PRIMA_RIGA, "su", 2);
      if (scorre && primo + VISIBILI < VOCI.length) {
        S.triangolo(S.COLS - 1, ULTIMA_RIGA, "giu", 2);
      }

      const v = VOCI[scelta];
      let anteprima;
      if (v.tipo === "progetto") anteprima = [v.progetto.tipo, v.progetto.riga];
      else if (v.tipo === "audio") anteprima = ["SUONI", "Bip di navigazione"];
      else anteprima = v.anteprima;
      riquadro(anteprima, RIGA_ANTEPRIMA, 2);

      piede(v.tipo === "audio" ? "A:ACCENDI E SPEGNI" : "A:APRI");
    },

    input(cmd) {
      const v = VOCI[scelta];
      if (cmd === "up") muovi(-1);
      else if (cmd === "down") muovi(+1);
      else if (v.tipo === "audio" && (cmd === "a" || cmd === "left" || cmd === "right")) {
        cambiaAudio();
      } else if (cmd === "a" || cmd === "start") {
        suoni.conferma();
        R.apri(v.tipo === "progetto" ? creaProgetto(v.progetto) : v.apre());
      }
    },
  };
}
