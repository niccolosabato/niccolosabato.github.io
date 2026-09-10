#!/usr/bin/env node
// Controlla che i contenuti stiano nello schermo prima di pubblicarli.
//
//     node check.mjs
//
// Lo schermo è di 28 colonne per 20 righe: un testo troppo lungo non dà
// errore a runtime, viene semplicemente tagliato senza che nessuno se ne
// accorga. Questo script rende visibile lo sforamento.

import { wrap, COLS } from "./js/screen.js";
import { PROGETTI } from "./data/projects.js";
import { CONTATTI } from "./data/contacts.js";

const RIGHE_DESCRIZIONE = 9;   // vedi js/screens/project.js
const MAX_ANTEPRIMA = 27;      // il riquadro scrive a partire dalla colonna 1
const MAX_LINK = 3;
const MAX_NOME = COLS - 2;    // la lista rientra di due colonne per il cursore

let problemi = 0;

function verifica(condizione, messaggio) {
  if (condizione) return;
  console.log("  ⚠ " + messaggio);
  problemi++;
}

console.log(`Schermo: ${COLS} colonne\n`);

for (const p of PROGETTI) {
  const righe = wrap(p.descrizione, COLS).length;
  console.log(`${p.nome} — descrizione su ${righe} righe`);
  verifica(righe <= RIGHE_DESCRIZIONE, `descrizione di ${righe} righe, il massimo è ${RIGHE_DESCRIZIONE}`);
  verifica(p.nome.length <= MAX_NOME, `nome di ${p.nome.length} caratteri, il massimo è ${MAX_NOME}`);
  verifica(p.riga.length <= MAX_ANTEPRIMA, `anteprima di ${p.riga.length} caratteri, il massimo è ${MAX_ANTEPRIMA}`);
  verifica(p.tipo.length <= COLS, `tipo troppo lungo`);
  const stack = (p.stack || []).join(" · ");
  verifica(stack.length <= COLS, `stack di ${stack.length} caratteri, il massimo è ${COLS}`);
  verifica((p.link || []).length <= MAX_LINK, `più di ${MAX_LINK} link`);
  for (const l of p.link || []) {
    verifica(l.label.length <= COLS - 2, `etichetta "${l.label}" troppo lunga`);
    verifica(l.url !== undefined || l.qui, `il link "${l.label}" non ha né url né qui:true`);
  }
}


console.log("\nContatti");
for (const c of CONTATTI) {
  console.log(`  ${c.label}: ${c.valore}`);
  verifica(c.valore.length <= MAX_ANTEPRIMA, `il valore di ${c.label} è di ${c.valore.length} caratteri, il massimo è ${MAX_ANTEPRIMA}`);
  verifica(c.label.length <= COLS - 2, `l'etichetta ${c.label} è troppo lunga`);
}

const daCompilare = CONTATTI.filter((c) => !c.url).map((c) => c.label);
if (daCompilare.length) console.log(`\nSenza link, ancora da compilare: ${daCompilare.join(", ")}`);

console.log(problemi ? `\n${problemi} problemi da sistemare.` : "\nTutto dentro i limiti.");
process.exit(problemi ? 1 : 0);
