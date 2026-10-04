// Home: è direttamente l'elenco dei contenuti, diviso per sezioni. Non c'è un
// menu prima: si arriva e si sceglie.
//
// Lo schermo è diviso in due: in alto scorrono le sezioni dei contenuti
// (progetti e analisi), in basso CURRICULUM, CONTATTI e AUDIO restano fermi.
// Il riquadro dell'anteprima chiude in fondo.

import * as S from "../screen.js";
import * as R from "../router.js";
import { suoni, setMuto, isMuto } from "../audio.js";
import { PROGETTI } from "../../data/projects.js";
import { piede, riquadro, bloccoCentrato } from "./ui.js";
import { creaProgetto } from "./project.js";
import { creaContatti } from "./contacts.js";
import { creaCurriculum } from "./cv.js";
import { salvaPreferenze } from "../prefs.js";

const PRIMA_RIGA = 2;
const ULTIMA_CONTENUTO = 10;  // ultima riga utile alle sezioni
const RIGA_FILETTO = 11;      // divide i contenuti dalle voci fisse
const RIGA_FISSI = 12;        // CURRICULUM, CONTATTI, AUDIO
const RIGA_ANTEPRIMA = 16;    // il bordo sale di 4px dentro la riga 15
const VISIBILI = ULTIMA_CONTENUTO - PRIMA_RIGA + 1;

const SELEZIONABILI = new Set(["progetto", "azione", "audio"]);

/** Costruisce l'elenco a partire dai dati: una sezione per ogni valore di
 *  `sezione`, nell'ordine in cui compare in data/projects.js. Le voci di
 *  servizio stanno a parte perché non scorrono. */
function costruisci() {
  const sezioni = new Map();
  for (const p of PROGETTI) {
    const nome = p.sezione || "PROGETTI";
    if (!sezioni.has(nome)) sezioni.set(nome, []);
    sezioni.get(nome).push(p);
  }

  const contenuto = [];
  for (const [nome, elenco] of sezioni) {
    if (contenuto.length) contenuto.push({ tipo: "vuoto" });
    contenuto.push({ tipo: "titolo", testo: nome });
    for (const p of elenco) contenuto.push({ tipo: "progetto", nome: p.nome, progetto: p });
  }

  const fissi = [
    {
      tipo: "azione",
      nome: "CURRICULUM",
      apre: creaCurriculum,
      anteprima: ["CV IN PDF", "Formazione ed esperienze"],
    },
    {
      tipo: "azione",
      nome: "CONTATTI",
      apre: creaContatti,
      anteprima: ["COLLEGAMENTI", "GitHub, email, TG, IG"],
    },
    { tipo: "audio", nome: "AUDIO" },
  ];

  return { contenuto, fissi };
}

/** Disegna una voce dell'elenco: intestazioni, filetti e voci selezionabili. */
function disegnaVoce(v, riga, attiva) {
  if (v.tipo === "vuoto") return;
  if (v.tipo === "titolo") return S.text(v.testo, 0, riga, 2);

  if (attiva) {
    S.textInvert("  " + v.nome, 0, riga);
    S.triangolo(0, riga, "destra", 0);
  } else {
    S.text("  " + v.nome, 0, riga, 3);
  }

  if (v.tipo === "audio") {
    S.textRight(isMuto() ? "SPENTO" : "ACCESO", riga, 2);
  }
}

export function creaHome() {
  const { contenuto, fissi } = costruisci();
  const VOCI = [...contenuto, ...fissi];
  const N_CONTENUTO = contenuto.length;

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

      const scorre = N_CONTENUTO > VISIBILI;
      if (scorre && scelta < N_CONTENUTO) {
        if (scelta < primo) primo = scelta;
        if (scelta >= primo + VISIBILI) primo = scelta - VISIBILI + 1;
        // Se sopra la finestra c'è un'intestazione (o una riga vuota) e la
        // selezione ci sta ancora, la si tira dentro: tornando in alto si
        // rivede il titolo della sezione.
        while (
          primo > 0 &&
          !SELEZIONABILI.has(contenuto[primo - 1].tipo) &&
          scelta <= primo + VISIBILI - 2
        ) {
          primo--;
        }
        primo = Math.max(0, Math.min(primo, N_CONTENUTO - VISIBILI));
      } else if (!scorre) {
        primo = 0;
      }

      const riga0 = scorre
        ? PRIMA_RIGA
        : bloccoCentrato(N_CONTENUTO, PRIMA_RIGA, ULTIMA_CONTENUTO);

      contenuto.slice(primo, primo + VISIBILI).forEach((v, k) => {
        disegnaVoce(v, riga0 + k, primo + k === scelta);
      });

      if (scorre && primo > 0) S.triangolo(S.COLS - 1, PRIMA_RIGA, "su", 2);
      if (scorre && primo + VISIBILI < N_CONTENUTO) {
        S.triangolo(S.COLS - 1, ULTIMA_CONTENUTO, "giu", 2);
      }

      S.hr(RIGA_FILETTO, 2);
      fissi.forEach((v, k) => {
        disegnaVoce(v, RIGA_FISSI + k, N_CONTENUTO + k === scelta);
      });

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
