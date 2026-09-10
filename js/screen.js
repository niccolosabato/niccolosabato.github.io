// Motore di disegno dello schermo.
//
// Il canvas è di 240x216 pixel veri: qui dentro si ragiona sempre in quei
// pixel, mai in pixel di schermo. L'ingrandimento lo fa il CSS.
//
// Il testo sta su una griglia fissa: celle di 8x8 (il font ha avanzo esatto di
// 8px a font-size 8px) e righe distanziate 10px, così le lettere non si
// toccano verticalmente. Ogni carattere viene disegnato singolarmente alla sua
// colonna: se il font non fosse ancora pronto e subentrasse il ripiego
// monospace, la griglia resterebbe comunque allineata.

export const W = 240;
export const H = 216;

export const CELL = 8;   // larghezza di un carattere
export const LINE = 10;  // passo verticale fra due righe
export const PAD_X = 8;
export const PAD_Y = 10;
export const COLS = 28;  // (240 - 8*2) / 8
export const ROWS = 20;  // (216 - 8*2) / 10

const FONT = '8px "Press Start 2P", monospace';

// I quattro toni del Game Boy originale, dal più chiaro (0, sfondo) al più
// scuro (3, inchiostro).
const PALETTE = ["#9bbc0f", "#8bac0f", "#306230", "#0f380f"];

let g = null;
const pal = PALETTE;

export function init(canvas) {
  g = canvas.getContext("2d", { alpha: false });
  g.imageSmoothingEnabled = false;
  g.textBaseline = "alphabetic";
  g.font = FONT;
  const lcd = document.querySelector(".lcd");
  if (lcd) lcd.style.background = PALETTE[0];
}

export function colore(i) {
  return pal[Math.max(0, Math.min(3, i))];
}

// ---- primitive ----

export function clear(i = 0) {
  g.fillStyle = colore(i);
  g.fillRect(0, 0, W, H);
}

export function fill(x, y, w, h, i = 3) {
  g.fillStyle = colore(i);
  g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

/** Cornice di 1px, stile finestra di dialogo. */
export function box(x, y, w, h, i = 3) {
  fill(x, y, w, 1, i);
  fill(x, y + h - 1, w, 1, i);
  fill(x, y, 1, h, i);
  fill(x + w - 1, y, 1, h, i);
}

/** Testo in coordinate di pixel: serve solo per i casi fuori griglia. */
export function textPx(s, x, y, i = 3) {
  g.fillStyle = colore(i);
  g.font = FONT;
  for (let k = 0; k < s.length; k++) g.fillText(s[k], x + k * CELL, y);
}

/** Testo in coordinate di griglia: colonna 0..COLS-1, riga 0..ROWS-1. */
export function text(s, col, row, i = 3) {
  textPx(String(s), PAD_X + col * CELL, PAD_Y + row * LINE + 8, i);
}

export function textRight(s, row, i = 3) {
  text(s, COLS - String(s).length, row, i);
}

export function textCenter(s, row, i = 3) {
  text(s, Math.floor((COLS - String(s).length) / 2), row, i);
}

/** Riga evidenziata: barra piena con il testo in negativo. */
export function textInvert(s, col, row, sfondo = 3, inchiostro = 0) {
  const x = PAD_X + col * CELL;
  const y = PAD_Y + row * LINE;
  fill(x - 2, y - 1, String(s).length * CELL + 4, LINE, sfondo);
  text(s, col, row, inchiostro);
}

/** Triangolo pieno dentro una cella della griglia: il font non ha le frecce
 *  e il ripiego del browser le disegna minuscole e di misura sbagliata. */
export function triangolo(col, row, verso = "destra", i = 3) {
  const x = PAD_X + col * CELL;
  const y = PAD_Y + row * LINE;
  for (let k = 0; k < 4; k++) {
    if (verso === "destra") fill(x + 2 + k, y + k, 1, 7 - 2 * k, i);
    else if (verso === "sinistra") fill(x + 5 - k, y + k, 1, 7 - 2 * k, i);
    else if (verso === "giu") fill(x + 1 + k, y + k, 7 - 2 * k, 1, i);
    else fill(x + 1 + k, y + 6 - k, 7 - 2 * k, 1, i);
  }
}

/** Filetto di separazione. Occupa una riga tutta sua e ci sta in mezzo, così
 *  le voci sopra e sotto gli restano staccate uguale. */
export function hr(row, i = 3) {
  fill(PAD_X, PAD_Y + row * LINE + 4, COLS * CELL, 1, i);
}

/** Sottolineatura di un titolo. Sta più in basso del filetto normale, dentro
 *  la riga successiva, che sotto un titolo è sempre vuota: le lettere non le
 *  restano appiccicate sopra. */
export function sottolinea(row, i = 3) {
  fill(PAD_X, PAD_Y + row * LINE + 12, COLS * CELL, 1, i);
}

// ---- testo lungo ----

/** Spezza una stringa in righe che stanno in `cols` colonne, senza tagliare
 *  le parole. Una parola più lunga della riga viene spezzata a forza. */
export function wrap(s, cols = COLS) {
  const righe = [];
  for (const paragrafo of String(s).split("\n")) {
    if (paragrafo === "") { righe.push(""); continue; }
    let riga = "";
    for (const parola of paragrafo.split(/\s+/)) {
      if (parola.length > cols) {
        if (riga) { righe.push(riga); riga = ""; }
        let resto = parola;
        while (resto.length > cols) { righe.push(resto.slice(0, cols)); resto = resto.slice(cols); }
        riga = resto;
        continue;
      }
      if (!riga) riga = parola;
      else if (riga.length + 1 + parola.length <= cols) riga += " " + parola;
      else { righe.push(riga); riga = parola; }
    }
    if (riga) righe.push(riga);
  }
  return righe;
}
