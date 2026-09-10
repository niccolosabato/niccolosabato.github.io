// Unica fonte di verità dei contenuti: per aggiungere o togliere un progetto
// si tocca solo questo file.
//
// Vincoli di spazio dello schermo (28 colonne x 20 righe):
//   nome        max 28 caratteri
//   riga        max 26 caratteri (è la riga di anteprima sotto la lista)
//   descrizione al massimo 9 righe una volta spezzata, cioè ~250 caratteri
//   link        al massimo 3 per progetto
//
// `sezione` decide sotto quale intestazione finisce la voce nella home:
// "PROGETTI" (predefinito) oppure "ANALISI". Le sezioni vuote non compaiono.
//
// Un link con `qui: true` non apre niente: è la voce scherzosa di questo
// stesso sito.

export const PROGETTI = [
  {
    id: "eduscout",
    nome: "EduScout",
    tipo: "DASHBOARD + ML",
    riga: "Abbandono scolastico",
    descrizione:
      "Dashboard dimostrativa e pipeline Python: stima il rischio di abbandono scolastico nelle 774 aree della Nigeria, ne spiega le cause con SHAP e distribuisce un budget limitato dove rende di più. I dati sono simulati.",
    stack: ["Python", "sklearn", "SHAP"],
    link: [
      { label: "APRI", url: "https://niccolosabato.github.io/EduScoutDemo/" },
      { label: "CODICE", url: "https://github.com/niccolosabato/EduScoutDemo" },
    ],
  },
  {
    id: "indovinaquando",
    nome: "IndovinaQuando",
    tipo: "GIOCO WEB",
    riga: "Indovina l'anno esatto",
    descrizione:
      "Leggi un evento storico e indovini in che anno è successo, muovendo un cursore sulla linea del tempo. Cinque round, cento punti al massimo per round. Gli eventi sono scritti a mano, più altri presi da Wikipedia.",
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
      "Diario per la sala pesi: registri le serie mentre le fai, il recupero è cronometrato e i carichi della volta prima restano sotto gli occhi. I dati stanno solo sul telefono, senza account e senza server.",
    stack: ["Expo", "React Native", "SQLite"],
    link: [
      { label: "SCARICA APK", url: "https://drive.google.com/file/d/1s1-JVQlThaO0tVA2P2YBSkh4ud9F3JK2/view" },
      { label: "CODICE", url: "https://github.com/niccolosabato/OpenFit-App" },
    ],
  },
  {
    id: "portfolio",
    nome: "Sabato Portfolio",
    tipo: "SITO PERSONALE",
    riga: "Il coso che hai in mano",
    descrizione:
      "Questo. Il guscio è disegnato in CSS, lo schermo è un canvas da 240x216 pixel ingrandito senza sfocare. Nessuna libreria, nessun passo di compilazione, nessuna chiamata di rete.",
    stack: ["JS", "HTML", "CSS"],
    link: [
      { label: "APRI", qui: true },
      { label: "CODICE", url: "https://github.com/niccolosabato/niccolosabato.github.io" },
    ],
  },

  {
    id: "violenza-sessuale",
    sezione: "ANALISI",
    nome: "Violenza sessuale",
    tipo: "ANALISI STATISTICA",
    riga: "In Italia, fonti ISTAT",
    descrizione:
      "Rapporto sullo scarto fra la violenza che le donne dichiarano all'ISTAT e quella che arriva a denuncia, più l'andamento di condanne e detenuti e la parte sulle vittime minorenni. Fonti ISTAT e dati ministeriali.",
    stack: ["ISTAT", "dati ministeriali"],
    link: [
      {
        label: "DOCUMENTO",
        url: "https://docs.google.com/document/d/1CIKL1s-yVU6bndmdKX2jlnR_WC8mJ0xYIBAMISr8K58/edit",
      },
    ],
  },

  // --- DA COMPILARE ---------------------------------------------------
  // Qui vanno le analisi statistiche, una voce per Google Doc. Servono un
  // link pubblico ("chiunque abbia il link → Visualizzatore") e una
  // descrizione che stia in nove righe. Modello da copiare:
  //
  // {
  //   id: "nome-corto",
  //   sezione: "ANALISI",
  //   nome: "Titolo dell'analisi",
  //   tipo: "ANALISI STATISTICA",
  //   riga: "una riga di anteprima",
  //   descrizione: "Due o tre frasi su cosa contiene e su che dati usa.",
  //   stack: ["dati INPS", "dati ISTAT"],
  //   link: [{ label: "DOCUMENTO", url: "https://docs.google.com/..." }],
  // },
];
