// Pezzi di interfaccia comuni a più schermate, per non ripetere le stesse
// coordinate ovunque.

import * as S from "../screen.js";

export const RIGA_PIEDE = S.ROWS - 1;

export function intestazione(titolo) {
  S.clear(0);
  S.text(titolo.toUpperCase(), 0, 0, 3);
  S.hr(0);
}

export function piede(testo) {
  S.text(testo, 0, RIGA_PIEDE, 2);
}

/** Elenco con cursore: la voce scelta è in negativo. */
export function lista(voci, scelta, riga0) {
  voci.forEach((v, k) => {
    const etichetta = String(v).slice(0, S.COLS - 2);
    const riga = riga0 + k;
    if (k === scelta) {
      S.textInvert("  " + etichetta, 0, riga);
      S.triangolo(0, riga, "destra", 0);
    } else {
      S.text("  " + etichetta, 0, riga, 3);
    }
  });
}

/** Prima riga da cui far partire un blocco alto `altezza` righe perché
 *  risulti centrato fra `prima` e `ultima`. Se non ci sta, resta in alto. */
export function bloccoCentrato(altezza, prima, ultima) {
  const spazio = ultima - prima + 1;
  return prima + Math.max(0, Math.floor((spazio - altezza) / 2));
}

/** Riquadro di anteprima in fondo allo schermo, con dentro del testo. */
export function riquadro(righe, riga0, altezzaRighe) {
  const y = S.PAD_Y + riga0 * S.LINE - 3;
  const h = altezzaRighe * S.LINE + 6;
  S.box(0, y, S.W, h, 3);
  righe.forEach((r, k) => S.text(r, 1, riga0 + k, 2));
}

/** Messaggio temporaneo al centro, stile finestra di dialogo. */
export function avviso(testo) {
  const righe = S.wrap(testo, S.COLS - 4);
  const riga0 = Math.floor((S.ROWS - righe.length) / 2);
  const y = S.PAD_Y + riga0 * S.LINE - 6;
  const h = righe.length * S.LINE + 12;
  S.fill(6, y, S.W - 12, h, 0);
  S.box(6, y, S.W - 12, h, 3);
  S.box(8, y + 2, S.W - 16, h - 4, 3);
  righe.forEach((r, k) => S.textCenter(r, riga0 + k, 3));
}

/** Apre un indirizzo esterno. Va chiamato dentro la gestione di una
 *  pressione, altrimenti il browser blocca la nuova scheda. */
export function apriLink(url) {
  if (!url) return false;
  if (url.startsWith("mailto:")) window.location.href = url;
  else window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
