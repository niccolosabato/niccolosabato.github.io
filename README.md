# Sabato Portfolio CLI

La versione terminale del portfolio: una sola pagina che si legge come lo
scrollback di una sessione, tema scuro e un solo accento verde salvia. Si
naviga a clic come qualunque sito: ogni voce è un link, i progetti si aprono
sul posto con la loro scheda, le analisi portano alle pagine di lettura.

Live: da pubblicare (previsto come project page,
`niccolosabato.github.io/sabatoPortfolio-cli/`).

L'altra versione, in stile Game Boy, vive su
<https://niccolosabato.github.io> e da qui si raggiunge aprendo la scheda
della voce `portfolio` nell'elenco progetti.

## Com'è fatto

HTML, CSS e JavaScript puri. Nessuna dipendenza, nessun passo di
compilazione. A runtime l'unica chiamata di rete è il tag di Google Analytics
(lo stesso del sito Game Boy, in testa a `index.html`): se non serve più si
tolgono quei due `<script>` e il sito resta completamente locale.

```
index.html          la pagina, con lo script inline che prepara gli stati
css/terminal.css    palette, layout, animazioni di stampa
fonts/              JetBrains Mono 400, 500, 700, servito in locale (OFL)
js/main.js          avvio, observer sulle sezioni, link profondi
js/print.js         le variabili CSS della macchina da scrivere, il salto
js/render.js        costruisce le sezioni a partire dai file in data/
data/projects.js    i progetti, unica fonte di verità (testi di Niccolò)
data/contacts.js    i contatti (testi di Niccolò)
data/profile.js     le righe di whoami (testi di Niccolò)
md/                 i Markdown delle analisi, con le figure in md/figures/
analisi/            le pagine di lettura generate, tema scuro
genera_analisi.py   md/ -> analisi/, con pandoc
check.mjs           i limiti dei contenuti e la regola sui trattini
server.py           server di sviluppo locale
cv.pdf              il curriculum
```

### Come si legge la pagina

Ogni sezione è una riga di comando finta con sotto il suo output:
`whoami`, `ls progetti/`, `ls analisi/`, `cat cv.pdf`, `cat contatti`.
Il comando si scrive da solo (larghezza che cresce a scatti di un carattere,
possibile perché il font è monospace e l'unità `ch` è larga un carattere) e
le righe di output compaiono in sequenza. Tutto in CSS: JavaScript mette le
classi e le variabili, non disegna niente.

I blocchi si stampano la prima volta che entrano in vista, con un
IntersectionObserver. Tre modi per saltare le animazioni: il parametro
`?statico` nell'indirizzo, `prefers-reduced-motion`, oppure un clic o un
tasto nei primi istanti, mentre si stampa la prima sezione. Senza JavaScript
la pagina resta nuda ma leggibile: le animazioni sono agganciate a una
classe che mette lo script.

I progetti si aprono sul posto: il nome è un bottone che stampa la scheda
sotto la riga, come un `cat`. Un link profondo `/#openfit` arriva sul sito
con quella scheda già aperta. Le analisi sono link diretti alle pagine sotto
`analisi/`.

## Sviluppo

```bash
python3 server.py        # http://localhost:8765 (8766 se la 8765 è occupata)
node check.mjs          # i contenuti stanno nei limiti?
```

Il doppio clic su `index.html` non funziona: gli ES modules non si caricano
da `file://`.

Per gli screenshot in headless Chromium serve la combinazione
`--run-all-compositor-stages-before-draw --virtual-time-budget=...`: senza,
il browser headless non genera fotogrammi continui e l'observer non scatta
mai (vedi AGENTS.md).

## Aggiungere o modificare i contenuti

Progetti, contatti e profilo: si toccano solo i file in `data/`, e
`node check.mjs` verifica i limiti. I testi li modifica Niccolò.

## Le pagine delle analisi

La fonte sono i file `md/<slug>.md`, scritti a mano: il primo titolo `# ...`
diventa il titolo della pagina, le figure stanno in `md/figures/<slug>/` e si
richiamano nel testo con `figures/<slug>/nome.png`. Poi:

```bash
python3 genera_analisi.py                  # tutte
python3 genera_analisi.py lavoro-giovanile # una sola
```

Lo script converte con pandoc, copia le figure, riscrive
`analisi/<slug>/index.html` e si rifiuta di scrivere una pagina che contenga
trattini lunghi o medi (regola di stile comune ai progetti). Le pagine
generate non si modificano a mano: si corregge il Markdown e si rilancia.
Quando si aggiunge un'analisi nuova va aggiunta anche la voce in
`data/projects.js` (sezione `ANALISI`), altrimenti la home non la elenca e lo
script lo segnala.

## Pubblicazione

Percorsi tutti relativi, quindi il sito funziona sia sulla radice di un
dominio sia sotto un sottopercorso (project page GitHub). Il file
`.nojekyll` impedisce a Pages di passare tutto per Jekyll.
