// Suoni generati con oscillatori: nessun file audio da scaricare.
// Muto di default — i browser bloccano comunque l'audio finché l'utente non
// interagisce, quindi l'AudioContext viene creato al primo suono richiesto.

let ac = null;
let muto = true;

export function setMuto(v) {
  muto = !!v;
}

export function isMuto() {
  return muto;
}

function contesto() {
  if (!ac) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
  }
  if (ac.state === "suspended") ac.resume();
  return ac;
}

/** Una nota quadra, con una piccola rampa in chiusura per non fare "clic". */
function nota(freq, durata, ritardo = 0, volume = 0.06) {
  const c = contesto();
  if (!c) return;
  const t = c.currentTime + ritardo;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + durata);
  osc.connect(gain).connect(c.destination);
  osc.start(t);
  osc.stop(t + durata + 0.02);
}

export const suoni = {
  muovi() { if (!muto) nota(660, 0.04); },
  conferma() { if (!muto) nota(880, 0.07); },
  indietro() { if (!muto) nota(330, 0.07); },
  apri() { if (!muto) { nota(660, 0.05); nota(990, 0.09, 0.06); } },
  bloccato() { if (!muto) nota(160, 0.12); },
  /** Il "ba-ding" dell'accensione. */
  avvio() {
    if (muto) return;
    nota(523.25, 0.12, 0);
    nota(1046.5, 0.42, 0.14, 0.08);
  },
};
