// Unica fonte di verità dei contenuti: per aggiungere o togliere un progetto
// si tocca solo questo file.
//
// Il sito CLI non ha una griglia fissa, quindi niente vincoli stretti come
// sulla versione Game Boy. Restano limiti di buon senso, verificati da
// `node check.mjs`:
//   nome        max 34 caratteri
//   riga        max 40 caratteri (è l'anteprima a fianco del nome in lista)
//   tipo        max 26 caratteri
//   descrizione max 320 caratteri
//   link        al massimo 3 per progetto
//
// `sezione` decide in quale elenco finisce la voce: "PROGETTI" (predefinito)
// oppure "ANALISI". Le sezioni vuote non compaiono.
//
// Per le voci di sezione "ANALISI" l'url del link inizia con "/analisi/":
// render.js lo rende relativo, così il sito funziona anche sotto un
// sottopercorso (project page GitHub).

export const PROGETTI = [
  {
    id: "eduscout",
    nome: "EduScout",
    tipo: "DASHBOARD + ML",
    riga: "L'istruzione in Nigeria",
    descrizione:
      "Dashboard dimostrativa e pipeline Python: stima il rischio di abbandono scolastico nelle 774 aree della Nigeria, ne spiega le cause con SHAP e distribuisce un budget limitato.",
    stack: ["Python", "sklearn", "SHAP"],
    link: [
      { label: "APRI", url: "https://niccolosabato.github.io/EduScoutDemo/" },
      { label: "CODICE", url: "https://github.com/niccolosabato/EduScoutDemo" },
    ],
  },
  {
    id: "indovinaquando",
    nome: "IndovinaQuando",
    tipo: "GIOCO SULLA STORIA",
    riga: "Indovina l'anno esatto",
    descrizione:
      "Leggi un evento storico e indovina in che anno è successo, con 3 livelli di difficoltà. Cinque round, cento punti al massimo per round. Approfondisci l'evento con il link a Wikipedia.",
    stack: ["JS", "HTML", "CSS"],
    link: [
      { label: "GIOCA", url: "https://niccolosabato.github.io/IndovinaQuando/" },
      { label: "CODICE", url: "https://github.com/niccolosabato/IndovinaQuando" },
    ],
  },
  {
    id: "openfit",
    nome: "OpenFit",
    tipo: "APP ANDROID",
    riga: "Diario di allenamento",
    descrizione:
      "Diario per la sala pesi: registri le serie mentre le fai, il recupero è cronometrato e i carichi della volta prima restano sotto gli occhi. Ora è in test chiuso sul Play Store: scrivimi per entrarci. I dati restano sul telefono.",
    stack: ["Expo", "React Native", "SQLite"],
    link: [
      { label: "CONTATTAMI", url: "mailto:ncsabato@gmail.com" },
      { label: "CODICE", url: "https://github.com/niccolosabato/OpenFit-App" },
    ],
  },
  {
    id: "violenza-sessuale",
    sezione: "ANALISI",
    nome: "Violenza in Italia",
    tipo: "ANALISI STATISTICA",
    riga: "Violenza in Italia",
    descrizione:
      "Rapporto sullo scarto fra la violenza che le donne dichiarano all'ISTAT e quella che arriva a denuncia, più l'andamento di condanne e detenuti e la parte sulle vittime minorenni.",
    stack: ["ISTAT", "dati ministeriali"],
    link: [{ label: "LEGGI", url: "/analisi/violenza-sessuale/" }],
  },
  {
    id: "lavoro-giovanile",
    sezione: "ANALISI",
    nome: "Giovani e lavoro",
    tipo: "ANALISI STATISTICA",
    riga: "NEET e competenze",
    descrizione:
      "Due problemi opposti: al Sud i giovani restano fuori dal lavoro perché manca, al Centro-Nord le imprese non trovano profili tecnici. NEET regionali da Eurostat e previsioni Excelsior, con un modello che stima il rischio.",
    stack: ["Eurostat", "Excelsior"],
    link: [{ label: "LEGGI", url: "/analisi/lavoro-giovanile/" }],
  },
  {
    id: "suicidio-giovanile",
    sezione: "ANALISI",
    nome: "Suicidio giovanile",
    tipo: "ANALISI STATISTICA",
    riga: "Salute mentale nei giovani",
    descrizione:
      "Il suicidio è la terza causa di morte fra i 15 e i 29 anni, con 1.124 decessi nel 2021-2023. L'analisi misura il fenomeno dal 2003: tassi per sesso e regione, sintomi depressivi e ricoveri per disturbi psichici.",
    stack: ["ISTAT", "Eurostat", "OMS"],
    link: [{ label: "LEGGI", url: "/analisi/suicidio-giovanile/" }],
  },

  // --- DA COMPILARE ---------------------------------------------------
  // Qui vanno le analisi statistiche, una voce per pagina di lettura. La
  // pagina vive in `analisi/<id>/` e si genera dal Google Doc con
  // `python3 genera_analisi.py`; la descrizione deve stare in nove righe.
  // Modello da copiare:
  //
  // {
  //   id: "nome-corto",
  //   sezione: "ANALISI",
  //   nome: "Titolo dell'analisi",
  //   tipo: "ANALISI STATISTICA",
  //   riga: "una riga di anteprima",
  //   descrizione: "Due o tre frasi su cosa contiene e su che dati usa.",
  //   stack: ["dati INPS", "dati ISTAT"],
  //   link: [{ label: "LEGGI", url: "/analisi/nome-corto/" }],
  // },
];
