// Preferenze dell'utente (palette e audio) in localStorage.
// Se il browser lo blocca — finestra anonima, cookie disattivati — si va
// avanti con i valori predefiniti invece di rompersi.

const CHIAVE = "sabato-portfolio";

export function leggiPreferenze() {
  try {
    return JSON.parse(localStorage.getItem(CHIAVE)) || {};
  } catch {
    return {};
  }
}

export function salvaPreferenze(prefs) {
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(prefs));
  } catch {
    /* niente da fare: le scelte valgono solo per questa visita */
  }
}
