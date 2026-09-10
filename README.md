# Sabato Portfolio

Sito personale a forma di Game Boy. Il guscio della console occupa la pagina, i
contenuti stanno dentro lo schermo LCD e ci si naviga con i tasti: croce
direzionale, A, B, Start e Select, usabili con mouse, dito o tastiera.

Non è un curriculum e non prova a vendere niente: è un giocattolo che raccoglie
i link ai progetti.

Live: <https://niccolosabato.github.io>

## Com'è fatto

HTML, CSS e JavaScript puri. Nessuna dipendenza, nessun passo di
compilazione, nessuna chiamata di rete: quello che si vede è tutto nel repo.

```
index.html
check.mjs           controlla che i testi stiano nello schermo
serve.py            server di sviluppo locale
css/shell.css       guscio della console
css/screen.css      pannello LCD e font
fonts/              Press Start 2P
js/main.js          avvio e interruttore
js/screen.js        disegno sul canvas: griglia, testo, a capo
js/input.js         tastiera, mouse e touch → comandi astratti
js/router.js        macchina a stati delle schermate
js/audio.js         bip generati, muti finché non si accendono
js/palettes.js      le tre palette
js/prefs.js         palette e audio in localStorage
js/screens/home.js  la home: l'elenco dei progetti
js/screens/         una schermata per file
data/projects.js    i progetti
data/contacts.js    i contatti
```

### Le due tecniche di disegno

Il guscio è **CSS**, quindi vettoriale: si ridimensiona con la finestra e resta
nitido a qualunque scala. Tutta la sua geometria è in `em` sopra un'unica
variabile `--u`, così l'intera console si ridimensiona cambiando un solo
numero.

Lo schermo è un **canvas di 240x216 pixel veri**, ingrandito dal CSS con
`image-rendering: pixelated`. L'ingrandimento nearest-neighbour tiene i pixel
netti a qualunque fattore di scala, anche frazionario, come fa un emulatore.
Con un `<div>` scalato via `transform` il testo sarebbe risultato sfocato a
ogni scala non intera.

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

La home **è** l'elenco dei progetti: non c'è un menu prima. Sotto i progetti,
separate da un filetto, ci sono `CONTATTI` e `OPZIONI`. Da ogni progetto si
apre la sua scheda, con descrizione, stack e i link da aprire.

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
