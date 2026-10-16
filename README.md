# Sabato Portfolio CLI

La versione terminale del portfolio: una sola pagina, una sola schermata,
senza scorrimento. Tema scuro e un solo accento verde. Si naviga a
clic come qualunque sito: ogni voce è un link, e cliccare una voce (un
progetto o un'analisi) cambia vista come un `cd` in un terminale vero.

Live: <https://niccolosabato.github.io/>, alla radice del dominio, dopo lo
scambio di nomi dei repo.

La versione in stile Game Boy è andata offline: da qui non punta più niente
verso di lei, la home elenca solo i progetti attivi e le analisi.

## Com'è fatto

HTML, CSS e JavaScript puri. Nessuna dipendenza, nessun passo di
compilazione. A runtime l'unica chiamata di rete è il tag di Google
Analytics: sta in testa a `index.html`, a `404.html` e nel template di
`genera_analisi.py`, quindi in ogni pagina, analisi comprese. Le schede
delle voci, che passano dall'hash, le conta l'evento `vista_progetto` di
`js/main.js`. Se non serve più si tolgono quegli `<script>`, si rigenerano
le analisi, e il sito resta completamente locale.

```
index.html          la pagina, con lo script inline che prepara gli stati
css/terminal.css    palette, layout, animazioni di stampa
fonts/              JetBrains Mono 400, 500, 700, servito in locale (OFL)
js/main.js          avvio, cambio vista sull'hash, stampa in sequenza,
                    evento di vista per GA
js/print.js         le variabili CSS della macchina da scrivere, il salto
js/render.js        costruisce le viste (home e schede) dai file in data/
data/projects.js    i progetti, unica fonte di verità (testi di Niccolò)
data/contacts.js    i contatti (testi di Niccolò)
data/profile.js     le righe di whoami (testi di Niccolò)
md/                 i Markdown delle analisi, con le figure in md/figures/
analisi/            le pagine di lettura generate, tema scuro
genera_analisi.py   md/ -> analisi/, con pandoc
check.mjs           limiti, trattini e presenza del tag di GA
server.py           server di sviluppo locale
cv.pdf              il curriculum
404.html            pagina d'errore di GitHub Pages, css inline, tag di GA
og.png              anteprima di condivisione: screenshot della home
```

### Come si legge la pagina

Ogni sezione è una riga di comando finta con sotto il suo output:
`whoami`, `ls progetti/`, `ls analisi/`, `cat cv.pdf`, `cat contatti`.
Il comando si scrive da solo (larghezza che cresce a scatti di un carattere,
possibile perché il font è monospace e l'unità `ch` è larga un carattere) e
le righe di output compaiono in sequenza. Tutto in CSS: JavaScript mette le
classi e le variabili, non disegna niente.

Il sito sta in una schermata sola: niente scorrimento, il carattere si scala
sulla finestra (altezza e larghezza) perché tutto il contenuto resti dentro.
La scala è tarata sul contenuto misurato, così la riga finale col cursore
resta dentro anche sulle finestre basse, già da 601px di altezza. Sotto i
600px, telefono ruotato, lo scorrimento torna: tagliare il contenuto sarebbe
peggio.

Al caricamento e a ogni cambio vista i blocchi si stampano in sequenza, uno
dopo l'altro, con un offset cumulativo che le animazioni CSS leggono da
`--t0`. Tre modi per saltarle: il parametro `?statico` nell'indirizzo,
`prefers-reduced-motion`, oppure un clic o un tasto mentre la vista si sta
stampando. Senza JavaScript la pagina resta nuda ma leggibile: le animazioni
sono agganciate a una classe che mette lo script.

Cliccare una voce cambia vista, come un `cd`: la schermata diventa la sua
scheda, il `cat progetti/<id>` per i progetti e `cat analisi/<id>` per le
analisi, con campi, descrizione e link, più una riga `cd ..` per tornare
all'elenco. La pagina di lettura di un'analisi si apre dal link LEGGI della
scheda, nella vista corrente. Il cambio vista passa dall'hash, quindi il
tasto indietro del browser funziona e `/#openfit` e `/#violenza-sessuale`
sono link profondi condivisibili.

La grammatica dei colori dichiara cosa si clicca: tutto ciò che è
cliccabile sta nel verde e a peso 500 (nomi in elenco, cv, contatti,
azioni, `cd ..`), il grigio chiaro è testo e quello attenuato sono note e
commenti shell. Il prompt compreso, che è grigio: se fosse verde la pagina
sarebbe tutta verde. Sotto
`whoami` un commento, `# clicca su una voce verde per aprirla`, fa da guida
a entrambi gli elenchi.

## Sviluppo

```bash
python3 server.py        # http://localhost:8765 (8766 se la 8765 è occupata)
node check.mjs          # limiti, trattini e tag di GA
```

Il doppio clic su `index.html` non funziona: gli ES modules non si caricano
da `file://`.

Per gli screenshot in headless Chromium serve la combinazione
`--run-all-compositor-stages-before-draw --virtual-time-budget=...`: senza,
il browser headless non genera fotogrammi continui e le animazioni restano
al primo stato (vedi AGENTS.md).

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
trattini lunghi o medi (regola di stile comune ai progetti). Le figure
restano senza didascalia, perché il titolo è già dentro il grafico: l'alt
nel Markdown lo leggono solo gli screen reader. Le pagine generate non si
modificano a mano: si corregge il Markdown e si rilancia. Quando si aggiunge
un'analisi nuova va aggiunta anche la voce in `data/projects.js` (sezione
`ANALISI`), altrimenti la home non la elenca e lo script lo segnala.

## Pubblicazione

Percorsi tutti relativi, quindi il sito regge sia la radice di un dominio
sia un eventuale sottopercorso: è per questo che lo scambio di nomi dei repo
si è potuto fare senza toccare niente. Il file `.nojekyll` impedisce a
Pages di passare tutto per Jekyll. `404.html` è la pagina che Pages serve
sui percorsi inesistenti: ha il css inline perché viene servita sul percorso
rotto, anche profondo. I tag og: hanno URL assoluti sulla radice, dove il
sito vive: le anteprime di condivisione li trovano.
