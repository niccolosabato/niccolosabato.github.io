# Sabato Portfolio

Sito personale in stile Game Boy. I contenuti stanno dentro uno schermo LCD e
ci si naviga con i tasti della console — croce direzionale, A, B, Start e
Select — usabili con mouse, dito o tastiera.

Non si vede tutta la console: si vedono lo schermo, grande, e i comandi
attorno. Su finestre larghe la croce sta a sinistra e A/B a destra, così il
pannello si prende tutta l'altezza; sotto i 760px i comandi scendono sotto lo
schermo.

Live: <https://niccolosabato.github.io>

## Com'è fatto

HTML, CSS e JavaScript puri. Nessuna dipendenza, nessun passo di
compilazione, nessuna chiamata di rete: quello che si vede è tutto nel repo.

```
index.html
check.mjs           controlla che i testi stiano nello schermo
serve.py            server di sviluppo locale
css/shell.css       plancia: plastica, comandi, disposizione
css/screen.css      pannello LCD e font
fonts/              Press Start 2P
js/main.js          avvio e interruttore
js/screen.js        disegno sul canvas: griglia, testo, a capo
js/input.js         tastiera, mouse e touch → comandi astratti
js/router.js        macchina a stati delle schermate
js/audio.js         bip generati con oscillatori, accesi di default
js/prefs.js         l'audio acceso o spento, in localStorage
js/screens/home.js  la home: l'elenco dei progetti
js/screens/         una schermata per file
data/projects.js    i progetti
data/contacts.js    i contatti
```

### Le due tecniche di disegno

La plastica e i comandi sono **CSS**, quindi vettoriali: si ridimensionano con
la finestra e restano nitidi a qualunque scala. Niente immagini.

Lo schermo è un **canvas di 240x216 pixel veri**, ingrandito dal CSS con
`image-rendering: pixelated`. L'ingrandimento nearest-neighbour tiene i pixel
netti a qualunque fattore di scala, anche frazionario, come fa un emulatore.
Con un `<div>` scalato via `transform` il testo sarebbe risultato sfocato a
ogni scala non intera.

Quanto grande sia un pixel lo decide `--k`, calcolato in CSS dallo spazio che
resta una volta tolte le colonne dei comandi e le due barre:

```css
--k: min(
  (100vw - 2*var(--col) - 2*var(--gap) - 2*var(--bordo)) / 306,
  (100dvh - var(--chrome) - 2*var(--bordo)) / 242
);
```

I due numeri sono le proporzioni della cornice: 306 di larghezza (bordo,
striscia del LED, stacco, schermo, bordo) per 242 di altezza. Da lì derivano
pannello, cornice e LED, e lo schermo resta sempre il più grande che ci sta.
Su una finestra da 1440x900 arriva a 666px, con il testo a 22px.

Come sull'originale la cornice è più larga a sinistra, perché lì stanno il LED
rosso e la scritta BATTERY. Su schermi stretti la scritta sparisce e la
striscia si assottiglia, altrimenti si mangerebbe un sesto della larghezza
dello schermo.

Il prezzo è che il testo del canvas non è selezionabile né leggibile dagli
screen reader. È una perdita accettata a monte: questo sito non insegue né i
motori di ricerca né i lettori di schermo.

### Lo spazio a disposizione

Lo schermo tiene **28 colonne per 20 righe**: celle da 8x8 pixel, righe
distanziate 10. Il Game Boy vero ha 160x144 pixel, cioè 20 colonne, dove la
sola parola "IndovinaQuando" ne occupa 14. Qui la risoluzione è una volta e
mezza, mantenendo la proporzione 10:9 originale: il guscio resta fedele, i
testi respirano.

## Comandi

| | Tastiera | Puntatore |
|---|---|---|
| Croce | frecce o WASD | i tasti sul guscio |
| A | Z, spazio, invio | " |
| B | X, Esc, backspace | " |
| Start | P | " |
| Select | Shift | " |

L'interruttore in alto a sinistra spegne e riaccende davvero: da spento lo
schermo si smorza, riaccendendolo riparte l'animazione di avvio.

## Sviluppo

```bash
python3 serve.py        # http://localhost:8765
node check.mjs          # i testi stanno nello schermo?
```

Il doppio clic su `index.html` **non** funziona: gli ES modules non si caricano
da `file://`.

## Aggiungere un progetto

Si tocca solo `data/projects.js`. I limiti sono scritti in cima al file; per
verificarli basta `node check.mjs`, che li controlla tutti e dice cosa sfora.

Il sito **non ospita file**: ogni voce ha bisogno di un URL pubblico, che sia
un repo, un sito o un documento condiviso.

## Le schermate

La home **è** l'elenco dei contenuti, diviso in sezioni: `PROGETTI` e
`ANALISI`. Non c'è un menu prima. In fondo, staccate da un filetto, ci sono
`CONTATTI` e l'interruttore dell'audio. Da ogni voce si apre la sua scheda,
con descrizione, stack e i link da aprire.

L'audio è **acceso** di default: il primo suono arriva alla prima pressione,
che è anche il momento in cui il browser permette di riprodurlo.

All'avvio il logotipo scende come sulla console vera; si salta con un tasto e
non ricompare finché la scheda resta aperta.

## Pubblicazione

GitHub Pages come sito utente: il repo si chiama `niccolosabato.github.io` e il
sito esce sulla radice del dominio. Non serve nessuna configurazione oltre ad
attivare Pages sul branch principale. Il file `.nojekyll` serve a impedire che
Pages passi tutto per Jekyll.

## Nota sul marchio

La forma della console è un omaggio al Game Boy di Nintendo. Il logotipo sul
pannello è "sabato PORTFOLIO": nessun marchio altrui è riprodotto.
