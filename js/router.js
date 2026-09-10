// Macchina a stati delle schermate, con una pila: B torna sempre indietro.
//
// Una schermata è un oggetto con:
//   draw()            obbligatorio, disegna sul canvas
//   input(cmd)        facoltativo, riceve i comandi
//   tick(t)           facoltativo, chiamato prima di ogni disegno se `anima`
//   anima             se true il router continua a ridisegnare a ogni frame
//   entra() / esce()  facoltativi

let pila = [];
let raf = null;

export function corrente() {
  return pila[pila.length - 1] || null;
}

/** Chiede un ridisegno. Se la schermata è animata il ciclo prosegue da solo. */
export function disegna() {
  if (raf !== null) return;
  raf = requestAnimationFrame(function frame(t) {
    raf = null;
    const s = corrente();
    if (!s) return;
    if (s.anima) s.tick?.(t);
    s.draw();
    if (s.anima) disegna();
  });
}

export function apri(schermata) {
  pila.push(schermata);
  schermata.entra?.();
  disegna();
}

export function indietro() {
  if (pila.length <= 1) return false;
  pila.pop().esce?.();
  disegna();
  return true;
}

/** Sostituisce la schermata in cima (usato dall'accensione). */
export function sostituisci(schermata) {
  pila.pop()?.esce?.();
  apri(schermata);
}

/** Svuota la pila e riparte da capo (usato dall'interruttore). */
export function riparti(schermata) {
  while (pila.length) pila.pop().esce?.();
  apri(schermata);
}

export function input(cmd) {
  corrente()?.input?.(cmd);
  disegna();
}
