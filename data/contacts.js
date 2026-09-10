// Contatti mostrati nell'omonima schermata.

// L'email è spezzata in due e ricomposta a runtime. Non è una protezione
// seria, ma toglie di mezzo i raccoglitori di indirizzi più pigri.
const EMAIL = ["niccolo.s04", "gmail.com"];

export const CONTATTI = [
  {
    label: "GITHUB",
    valore: "niccolosabato",
    url: "https://github.com/niccolosabato",
  },
  {
    label: "EMAIL",
    valore: EMAIL.join("@"),
    url: "mailto:" + EMAIL.join("@"),
  },
  {
    label: "TELEGRAM",
    valore: "@sabatoniccolo",
    url: "https://t.me/sabatoniccolo",
  },
  {
    label: "INSTAGRAM",
    valore: "@niccolosabato",
    url: "https://instagram.com/niccolosabato",
  },
];
