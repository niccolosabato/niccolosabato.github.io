#!/usr/bin/env node
// Controlla che i contenuti rispettino i limiti prima di pubblicarli.
//
//     node check.mjs
//
// Il sito CLI non ha una griglia fissa come quello Game Boy, quindi i limiti
// sono di buon senso (leggibilità delle righe e delle schede) e valgono anche
// per le pagine delle analisi: un testo che sfora non dà errore a runtime,
// sfonda solo il layout. Questo script lo rende visibile.
//
// Controlla anche la regola di stile comune a tutti i progetti: nei testi non
// devono comparire trattini lunghi o medi (—, –).

import { existsSync } from "node:fs";
import { PROGETTI } from "./data/projects.js";
import { CONTATTI } from "./data/contacts.js";
import { PROFILO } from "./data/profile.js";

const MAX_NOME = 34;
const MAX_RIGA = 40;
const MAX_TIPO = 26;
const MAX_DESCRIZIONE = 320;
const MAX_STACK = 60;
const MAX_LINK = 3;
const MAX_ETICHETTA = 12;
const MAX_LABEL_CONTATTO = 10;
const MAX_VALORE_CONTATTO = 34;
const MAX_RIGA_PROFILO = 110;

let problemi = 0;

function verifica(condizione, messaggio) {
  if (condizione) return;
  console.log("  ⚠ " + messaggio);
  problemi++;
}

function trattini(testo, dove) {
  verifica(
    !/[—–]/.test(testo),
    `${dove}: contiene un trattino lungo o medio (—, –), vietato dallo stile comune`,
  );
}

console.log("Progetti");
const idVisti = new Set();
for (const p of PROGETTI) {
  console.log(`  ${p.id} (${p.nome})`);
  verifica(/^[a-z0-9][a-z0-9-]*$/.test(p.id), `id "${p.id}": solo minuscole, cifre e trattini corti, e non può iniziare con un trattino`);
  verifica(!idVisti.has(p.id), `id "${p.id}" usato due volte`);
  idVisti.add(p.id);
  verifica(p.nome.length <= MAX_NOME, `nome di ${p.nome.length} caratteri, il massimo è ${MAX_NOME}`);
  verifica(p.riga.length <= MAX_RIGA, `anteprima di ${p.riga.length} caratteri, il massimo è ${MAX_RIGA}`);
  verifica(p.tipo.length <= MAX_TIPO, `tipo di ${p.tipo.length} caratteri, il massimo è ${MAX_TIPO}`);
  verifica(p.descrizione.length <= MAX_DESCRIZIONE, `descrizione di ${p.descrizione.length} caratteri, il massimo è ${MAX_DESCRIZIONE}`);
  const stack = (p.stack || []).join(", ");
  verifica(stack.length <= MAX_STACK, `stack di ${stack.length} caratteri, il massimo è ${MAX_STACK}`);
  verifica((p.link || []).length >= 1 && p.link.length <= MAX_LINK, `i link devono essere fra 1 e ${MAX_LINK}`);
  for (const l of p.link || []) {
    verifica(l.label.length <= MAX_ETICHETTA, `etichetta "${l.label}" di ${l.label.length} caratteri, il massimo è ${MAX_ETICHETTA}`);
    verifica(l.url !== undefined || l.qui === true, `il link "${l.label}" non ha né url né qui:true`);
  }
  for (const testo of [p.nome, p.riga, p.tipo, p.descrizione, stack]) {
    trattini(testo, p.id);
  }
  if ((p.sezione || "PROGETTI") === "ANALISI") {
    const url = (p.link[0] || {}).url || "";
    const m = url.match(/^\/analisi\/([a-z0-9-]+)\/$/);
    verifica(!!m, `${p.id}: il link dell'analisi deve essere /analisi/<slug>/, trovato "${url}"`);
    if (m) {
      verifica(existsSync(`analisi/${m[1]}/index.html`), `${p.id}: analisi/${m[1]}/index.html non esiste (lancia python3 genera_analisi.py)`);
    }
  }
}

console.log("\nContatti");
for (const c of CONTATTI) {
  console.log(`  ${c.label}: ${c.valore}`);
  verifica(c.label.length <= MAX_LABEL_CONTATTO, `etichetta ${c.label} di ${c.label.length} caratteri, il massimo è ${MAX_LABEL_CONTATTO}`);
  verifica(c.valore.length <= MAX_VALORE_CONTATTO, `valore di ${c.valore.length} caratteri, il massimo è ${MAX_VALORE_CONTATTO}`);
  verifica(!!c.url, `${c.label}: manca l'url`);
  trattini(c.valore, `contatto ${c.label}`);
}

console.log("\nProfilo (whoami)");
verifica(PROFILO.righe.length >= 1 && PROFILO.righe.length <= 5, `le righe del profilo devono essere fra 1 e 5`);
for (const r of PROFILO.righe) {
  verifica(r.length <= MAX_RIGA_PROFILO, `riga di ${r.length} caratteri, il massimo è ${MAX_RIGA_PROFILO}`);
  trattini(r, "profilo");
}

console.log(problemi ? `\n${problemi} problemi da sistemare.` : "\nTutto dentro i limiti.");
process.exit(problemi ? 1 : 0);
