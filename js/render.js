// Costruisce le viste della pagina a partire dai dati. Il sito sta in una
// schermata sola, senza scorrimento: la home è l'elenco dei contenuti, e
// cliccare una voce (un progetto o un'analisi) cambia vista, come un `cd` in
// un terminale. La scheda della voce è il suo `cat`, con in fondo una riga
// `cd ..` per tornare. Il cambio vista passa dall'hash dell'indirizzo, quindi
// il tasto indietro del browser funziona e /#openfit è un link profondo
// condivisibile.

import { PROGETTI } from "../data/projects.js";
import { CONTATTI } from "../data/contacts.js";
import { PROFILO } from "../data/profile.js";

const PROMPT =
  '<span class="prompt"><b>sabato</b>@<b>portfolio</b>:' +
  '<span class="perc">~</span>$</span>';

/** I testi dei dati finiscono nell'HTML: le parentesi angolari si scappano. */
function t(testo) {
  return String(testo).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]),
  );
}

function rigaComando(comando) {
  return `<p class="riga-comando">${PROMPT} <span class="comando">${t(comando)}</span></p>`;
}

/** Un link esterno vero: niente window.open, quindi niente blocchi di Safari. */
function linkEsterno(url, etichetta) {
  if (url.startsWith("mailto:")) {
    return `<a href="${t(url)}">${t(etichetta)}</a>`;
  }
  return `<a href="${t(url)}" target="_blank" rel="noopener">${t(etichetta)}</a>`;
}

function urlRelativo(url) {
  return url.replace(/^\//, "");
}

/** I link delle schede. Un percorso del sito (inizia con "/", come le
 *  pagine delle analisi) si apre nella vista corrente, come un normalissimo
 *  link interno; tutto il resto porta fuori e si apre in una nuova scheda. */
function linkAzione(url, etichetta) {
  if (url.startsWith("/")) {
    return `<a href="${t(urlRelativo(url))}">${t(etichetta)}</a>`;
  }
  return linkEsterno(url, etichetta);
}

/* ---------------------------------------------------------------- whoami --- */

function sezioneWhoami() {
  const righe = [
    `<p class="versione">${t(PROFILO.utente)}</p>`,
    ...PROFILO.righe.map((r) => `<p>${t(r)}</p>`),
    `<p class="commento"># clicca su una voce per aprirla</p>`,
  ].join("");
  return `<section class="blocco" id="whoami">
    ${rigaComando("whoami")}
    <div class="righe">${righe}</div>
  </section>`;
}

/* -------------------------------------------------------- progetti/analisi -- */

/** Una voce dell'elenco: il nome cambia vista come un `cd`, apre la scheda
 *  della voce. Vale anche per le analisi, che come i progetti passano dalla
 *  scheda e solo da lì al link di lettura. */
function voce(p) {
  return `<li class="voce">
    <div class="riga-voce">
      <a class="nome" href="#${t(p.id)}">${t(p.id)}<span class="slash">/</span></a>
      <span class="nota">${t(p.riga)}</span>
    </div>
  </li>`;
}

function sezioneElenco(id, comando, voci) {
  return `<section class="blocco" id="${t(id)}">
    ${rigaComando(comando)}
    <ul class="righe elenco">${voci.join("")}</ul>
  </section>`;
}

/* --------------------------------------------------------------- cv e altro */

function sezioneCv() {
  return `<section class="blocco" id="cv">
    ${rigaComando("cat cv.pdf")}
    <div class="righe">
      <p class="riga-voce">
        <a class="nome" href="cv.pdf" target="_blank" rel="noopener">cv.pdf</a>
        <span class="nota">curriculum vitae</span>
      </p>
    </div>
  </section>`;
}

function sezioneContatti() {
  const righe = CONTATTI.map(
    (c) => `<p class="contatto">
      <span class="etichetta">${t(c.label)}</span>
      ${linkEsterno(c.url, c.valore)}
    </p>`,
  ).join("");
  return `<section class="blocco" id="contatti">
    ${rigaComando("cat contatti")}
    <div class="righe">${righe}</div>
  </section>`;
}

/* ------------------------------------------------------------------ viste --- */

/** La home: l'elenco dei contenuti, tutto in una schermata. */
export function vistaHome() {
  const progetti = PROGETTI.filter((p) => (p.sezione || "PROGETTI") === "PROGETTI");
  const analisi = PROGETTI.filter((p) => p.sezione === "ANALISI");

  const sezioni = [sezioneWhoami()];
  if (progetti.length) {
    sezioni.push(sezioneElenco("progetti", "ls progetti/", progetti.map(voce)));
  }
  if (analisi.length) {
    sezioni.push(sezioneElenco("analisi", "ls analisi/", analisi.map(voce)));
  }
  sezioni.push(sezioneCv(), sezioneContatti());
  return sezioni.join("");
}

/** La scheda di una voce (progetto o analisi): il suo `cat`, con `cd ..`
 *  in fondo per tornare. Restituisce null se l'id non è di una voce. */
export function vistaVoce(id) {
  const p = PROGETTI.find((x) => x.id === id);
  if (!p) return null;

  const analisi = (p.sezione || "PROGETTI") === "ANALISI";
  const cartella = analisi ? "analisi" : "progetti";

  const campi = [
    ["nome", p.nome],
    ["tipo", p.tipo],
    ["stack", (p.stack || []).join(", ")],
  ]
    .map(([k, v]) => `<dt>${t(k)}</dt><dd>${t(v)}</dd>`)
    .join("");

  const azioni = (p.link || [])
    .map(
      (l) =>
        `<span class="azione"><span class="parentesi">[</span>${linkAzione(
          l.url,
          l.label,
        )}<span class="parentesi">]</span></span>`,
    )
    .join("");

  return `<section class="blocco" id="voce-${t(p.id)}">
    ${rigaComando(`cat ${cartella}/${p.id}`)}
    <div class="righe">
      <dl class="campi">${campi}</dl>
      <p class="descrizione">${t(p.descrizione)}</p>
      <p class="azioni">${azioni}</p>
      <p class="riga-voce indietro">
        <a class="nome" href="#">cd ..</a>
        <span class="nota">torna all'elenco</span>
      </p>
    </div>
  </section>`;
}
