// Costruisce le sezioni della pagina a partire dai dati. Ogni sezione è un
// blocco: una riga di comando finta (il prompt che l'ha "eseguita") e sotto le
// righe di output. I progetti si aprono sul posto, come un `cat` che ne
// stampa la scheda; le analisi sono link diretti alle loro pagine.

import { PROGETTI } from "../data/projects.js";
import { CONTATTI } from "../data/contacts.js";
import { PROFILO } from "../data/profile.js";
import { prepara } from "./print.js";

// La voce "portfolio" nei dati ha un link con `qui: true`: sul sito Game Boy
// indicava il sito stesso, qui indica l'altra versione del portfolio.
const URL_GAMEBOY = "https://niccolosabato.github.io/";

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
function linkEsterno(url, etichetta, titolo) {
  const attr = titolo ? ` title="${t(titolo)}"` : "";
  if (url.startsWith("mailto:")) {
    return `<a href="${t(url)}"${attr}>${t(etichetta)}</a>`;
  }
  return `<a href="${t(url)}" target="_blank" rel="noopener"${attr}>${t(etichetta)}</a>`;
}

function urlRelativo(url) {
  return url.replace(/^\//, "");
}

/* ---------------------------------------------------------------- whoami --- */

function sezioneWhoami() {
  const righe = [
    `<p class="versione">${t(PROFILO.utente)}</p>`,
    ...PROFILO.righe.map((r) => `<p>${t(r)}</p>`),
  ].join("");
  return `<section class="blocco" id="whoami">
    ${rigaComando("whoami")}
    <div class="righe">${righe}</div>
  </section>`;
}

/* -------------------------------------------------------- progetti/analisi -- */

function schedaProgetto(p) {
  const campi = [
    ["nome", p.nome],
    ["tipo", p.tipo],
    ["stack", (p.stack || []).join(", ")],
  ]
    .map(([k, v]) => `<dt>${t(k)}</dt><dd>${t(v)}</dd>`)
    .join("");

  const azioni = (p.link || [])
    .map((l) => {
      const url = l.qui ? URL_GAMEBOY : l.url;
      const titolo = l.qui ? "La versione Game Boy di questo sito" : "";
      return `<span class="azione"><span class="parentesi">[</span>${linkEsterno(
        url,
        l.label,
        titolo,
      )}<span class="parentesi">]</span></span>`;
    })
    .join("");

  return `<div class="scheda" id="scheda-${t(p.id)}" hidden>
    ${rigaComando(`cat progetti/${p.id}`)}
    <div class="righe">
      <dl class="campi">${campi}</dl>
      <p class="descrizione">${t(p.descrizione)}</p>
      <p class="azioni">${azioni}</p>
    </div>
  </div>`;
}

function voceProgetto(p) {
  return `<li class="voce">
    <div class="riga-voce">
      <button type="button" class="nome" aria-expanded="false"
              aria-controls="scheda-${t(p.id)}">${t(p.id)}<span class="slash">/</span></button>
      <span class="nota">${t(p.riga)}</span>
    </div>
    ${schedaProgetto(p)}
  </li>`;
}

function voceAnalisi(p) {
  const url = urlRelativo((p.link && p.link[0] && p.link[0].url) || "");
  return `<li class="voce">
    <div class="riga-voce">
      <a class="nome" href="${t(url)}">${t(p.id)}<span class="slash">/</span></a>
      <span class="nota">${t(p.riga)}</span>
    </div>
  </li>`;
}

function sezioneElenco(nomeSezione, comando, voci) {
  return `<section class="blocco" id="${t(nomeSezione.toLowerCase())}">
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
        <span class="nota">curriculum vitae, si apre in una nuova scheda</span>
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

/* ------------------------------------------------------------------ boot --- */

export function righeBoot() {
  const progetti = PROGETTI.filter((p) => (p.sezione || "PROGETTI") !== "ANALISI");
  const analisi = PROGETTI.filter((p) => p.sezione === "ANALISI");
  return [
    `<p class="versione">sabato portfolio cli · v1.0</p>`,
    `<p>${progetti.length} progetti, ${analisi.length} analisi, 1 curriculum</p>`,
    `<p class="nota">si naviga col mouse o con Tab: ogni voce è un link</p>`,
  ];
}

/* ------------------------------------------------------------- costruzione */

/** Riempie #boot e #contenuto e collega l'apertura delle schede progetto. */
export function costruisci(boot, contenuto) {
  boot.innerHTML = `<div class="righe">${righeBoot().join("")}</div>`;
  boot.style.setProperty("--t-cmd", "0s");

  const progetti = PROGETTI.filter((p) => (p.sezione || "PROGETTI") === "PROGETTI");
  const analisi = PROGETTI.filter((p) => p.sezione === "ANALISI");

  const sezioni = [sezioneWhoami()];
  if (progetti.length) {
    sezioni.push(
      sezioneElenco("PROGETTI", "ls progetti/", progetti.map(voceProgetto)),
    );
  }
  if (analisi.length) {
    sezioni.push(
      sezioneElenco("ANALISI", "ls analisi/", analisi.map(voceAnalisi)),
    );
  }
  sezioni.push(sezioneCv(), sezioneContatti());

  contenuto.innerHTML = sezioni.join("");

  // Le schede progetto si aprono e chiudono sul posto. A ogni apertura la
  // scheda si ristampa: l'animazione riparte togliendo e rimettendo .visto,
  // con un reflow in mezzo (se le animazioni sono disattivate non si vede).
  function apriScheda(bottone) {
    const scheda = contenuto.querySelector(
      "#" + CSS.escape(bottone.getAttribute("aria-controls")),
    );
    if (!scheda) return;
    const aperto = !scheda.hidden;
    scheda.hidden = aperto;
    bottone.setAttribute("aria-expanded", String(!aperto));
    if (!aperto) {
      scheda.classList.remove("visto");
      prepara(scheda);
      void scheda.offsetWidth;
      scheda.classList.add("visto");
    }
  }

  contenuto.addEventListener("click", (e) => {
    const bottone = e.target.closest("button.nome");
    if (bottone) apriScheda(bottone);
  });

  return { apriScheda };
}

/** Apre la scheda del progetto con quell'id, se esiste. Serve ai link
 *  profondi: /#openfit arriva sul sito con la scheda già aperta. */
export function apriProgetto(id) {
  const bottone = document.querySelector(
    `button.nome[aria-controls="scheda-${CSS.escape(id)}"]`,
  );
  if (!bottone) return null;
  // Il costruttore ha già messo in pagina tutto: il bottone vive in #contenuto.
  const evt = new MouseEvent("click", { bubbles: true });
  bottone.dispatchEvent(evt);
  return bottone;
}
