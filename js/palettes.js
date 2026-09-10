// Palette a quattro toni, dal più chiaro (0, sfondo) al più scuro (3, testo).
// L'ordine è quello del Game Boy originale, dove il colore 0 è lo sfondo del
// pannello acceso e il 3 l'inchiostro.

export const PALETTES = [
  { id: "dmg",    nome: "VERDE DMG",    colori: ["#9bbc0f", "#8bac0f", "#306230", "#0f380f"] },
  { id: "pocket", nome: "GRIGI POCKET", colori: ["#e4e4dc", "#a8a89c", "#585850", "#181810"] },
  { id: "ambra",  nome: "AMBRA",        colori: ["#ffd37f", "#d9963c", "#8a4a17", "#2b1200"] },
];

export function paletteById(id) {
  return PALETTES.find((p) => p.id === id) || PALETTES[0];
}
