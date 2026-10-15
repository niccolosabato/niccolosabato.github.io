#!/usr/bin/env python3
"""Genera le pagine di lettura delle analisi a partire dai file Markdown.

La fonte sono i file `md/<slug>.md`, scritti a mano da Niccolò:
  - il primo titolo `# ...` del file diventa il titolo della pagina;
  - le figure stanno in `md/figures/<slug>/` e nel Markdown si richiamano
    col percorso relativo `figures/<slug>/nome.png`.

Per ogni file lo script:
  1. converte il Markdown in HTML con pandoc;
  2. sistema il markup: figure pronte per la lettura (percorso, dimensioni,
     caricamento pigro), tabelle avvolte in un riquadro scorrevole,
     indirizzi nudi trasformati in link, didascalie tolte (il titolo è già
     dentro il grafico; l'alt resta per gli screen reader);
  3. ricava la meta description dal primo paragrafo dell'analisi;
  4. controlla che nell'output non compaiano trattini lunghi o medi (—, –),
     vietati dallo stile comune dei progetti;
  5. scrive `analisi/<slug>/index.html` e copia le figure in
     `analisi/<slug>/figures/`.

Le pagine generate si riscrivono da capo a ogni lancio: le modifiche si fanno
nel Markdown, mai nell'HTML.

Uso:
    python3 genera_analisi.py                     # tutte le analisi
    python3 genera_analisi.py lavoro-giovanile    # solo una

Serve pandoc nel PATH; se non c'è, lo script prova da solo
`mise x pandoc@latest -- pandoc`.
"""

import html
import re
import shutil
import struct
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

RADICE = Path(__file__).resolve().parent
SORGENTI = RADICE / "md"
USCITA = RADICE / "analisi"

VUOTI = {
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr",
}
INTESTAZIONI = {"h1", "h2", "h3", "h4", "h5", "h6"}
INDIRIZZO = re.compile(r"https?://[^\s<>()\[\]]+")
TRATTINI_VIETATI = ("—", "–")

# Indirizzo assoluto della radice definitiva: i tag og: vogliono URL completi,
# e il sito è destinato a vivere lì (lo scambio di repo lo fa Niccolò). Prima
# dello scambio le anteprime di condivisione non li trovano: pazienza.
SITO = "https://niccolosabato.github.io"

# La stessa icona svg inline della home, per non dipendere da un percorso.
ICONA = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' "
         "viewBox='0 0 16 16'%3E%3Crect width='16' height='16' "
         "fill='%230c0c0c'/%3E%3Ctext x='2' y='12.5' font-family='monospace' "
         "font-size='11' fill='%238ab061'%3E%26gt;_%3C/text%3E%3C/svg%3E")

# Lo stesso tag della home: anche le letture lunghe finiscono nelle
# statistiche. Le copie del tag da togliere, se GA non serve, sono tre:
# index.html, 404.html e questo template (poi rigenerare le analisi).
GA = """<!-- Google tag (gtag.js), stesso ID della home -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4P77DPPF9D"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-4P77DPPF9D');
</script>"""


# ---------------------------------------------------------------------------
# Un albero HTML minimo, quanto basta per leggere e riscrivere l'output di
# pandoc. I nodi di testo sono stringhe dentro `figli`.
# ---------------------------------------------------------------------------

class Nodo:
    def __init__(self, tag, attrs=None):
        self.tag = tag
        self.attrs = list(attrs or [])
        self.figli = []

    def testo(self):
        parti = []
        for f in self.figli:
            parti.append(f if isinstance(f, str) else f.testo())
        return "".join(parti)


class Albero(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.radice = Nodo("#radice")
        self.pila = [self.radice]

    def handle_starttag(self, tag, attrs):
        nodo = Nodo(tag, attrs)
        self.pila[-1].figli.append(nodo)
        if tag not in VUOTI:
            self.pila.append(nodo)

    def handle_endtag(self, tag):
        for i in range(len(self.pila) - 1, 0, -1):
            if self.pila[i].tag == tag:
                del self.pila[i:]
                return

    def handle_data(self, dati):
        self.pila[-1].figli.append(dati)


# ---------------------------------------------------------------------------
# Lavorazione del markup
# ---------------------------------------------------------------------------

def contiene(nodo, tag):
    for f in nodo.figli:
        if isinstance(f, str):
            continue
        if f.tag == tag or contiene(f, tag):
            return True
    return False


def titolo_e_corpo(radice):
    """Il primo <h1> del Markdown è il titolo della pagina: si toglie dal
    corpo perché la testata lo mostra già."""
    titolo = None
    for i, f in enumerate(radice.figli):
        if isinstance(f, str) and f.strip() == "":
            continue
        if isinstance(f, Nodo) and f.tag == "h1":
            titolo = f.testo().strip()
            del radice.figli[i]
        break
    return titolo


def sgonfia(nodi, tag):
    """Toglie i nodi `tag` sostituendoli con i loro figli, a ogni livello."""
    fuori = []
    for f in nodi:
        if isinstance(f, Nodo) and f.tag in tag:
            fuori.extend(sgonfia(f.figli, tag))
        else:
            if isinstance(f, Nodo):
                f.figli = sgonfia(f.figli, tag)
            fuori.append(f)
    return fuori


def sistema_img(img, dimensioni):
    nome = Path(dict(img.attrs).get("src", "")).name
    nuovi = [("src", "figures/" + nome)]
    for chiave, valore in img.attrs:
        if chiave == "alt":
            nuovi.append(("alt", valore))
    misura = dimensioni.get(nome)
    if misura:
        nuovi.append(("width", str(misura[0])))
        nuovi.append(("height", str(misura[1])))
    nuovi.append(("loading", "lazy"))
    nuovi.append(("decoding", "async"))
    img.attrs = nuovi


def sistema_a(nodo, dimensioni):
    for f in nodo.figli:
        if isinstance(f, str):
            continue
        if f.tag == "img":
            sistema_img(f, dimensioni)
        elif f.tag in INTESTAZIONI:
            f.figli = sgonfia(f.figli, {"strong"})
        elif f.tag == "li":
            f.figli = sgonfia(f.figli, {"p"})
        sistema_a(f, dimensioni)


def sistema_b(nodi):
    """Filtra i blocchi inutili e prepara tabelle e immagini."""
    fuori = []
    for f in nodi:
        if isinstance(f, str):
            fuori.append(f)
            continue
        if f.tag in INTESTAZIONI and f.testo().strip() == "":
            continue
        if f.tag == "p" and f.testo().strip() == "" and not contiene(f, "img"):
            continue
        if f.tag == "table":
            f.figli = sistema_b(f.figli)
            riquadro = Nodo("div", [("class", "tabella")])
            riquadro.figli = [f]
            fuori.append(riquadro)
            continue
        f.figli = sistema_b(f.figli)
        fuori.append(f)
    return fuori


def togli_didascalie(nodi):
    """Le figure restano senza didascalia: il titolo è già dentro il grafico,
    e una riga sotto lo duplicherebbe. L'alt resta sull'img, dove lo leggono
    solo gli screen reader."""
    fuori = []
    for f in nodi:
        if isinstance(f, str):
            fuori.append(f)
        elif f.tag == "figcaption":
            continue
        else:
            f.figli = togli_didascalie(f.figli)
            fuori.append(f)
    return fuori


def descrizione_meta(radice, slug):
    """La meta description è l'attacco dell'analisi: il primo paragrafo
    sostanzioso, tagliato al confine fra le parole."""
    trovato = None

    def cerca(nodi):
        nonlocal trovato
        for f in nodi:
            if trovato or isinstance(f, str):
                continue
            if f.tag == "p" and not contiene(f, "img"):
                testo = " ".join(f.testo().split())
                if len(testo) >= 60:
                    trovato = testo
                    return
            cerca(f.figli)

    cerca(radice.figli)
    if not trovato:
        raise SystemExit(
            "%s: nessun paragrafo abbastanza lungo per la meta description"
            % slug
        )
    if len(trovato) > 158:
        trovato = trovato[:158].rsplit(" ", 1)[0] + "..."
    return trovato


def collega_url(nodi):
    """Gli indirizzi scritti nudi nel testo diventano link veri."""
    fuori = []
    for f in nodi:
        if isinstance(f, str):
            fuori.extend(link_nel_testo(f))
        else:
            if f.tag != "a":
                f.figli = collega_url(f.figli)
            fuori.append(f)
    return fuori


def link_nel_testo(testo):
    pezzi = []
    pos = 0
    for m in INDIRIZZO.finditer(testo):
        url = m.group(0).rstrip(".,;:")
        if m.start() > pos:
            pezzi.append(testo[pos:m.start()])
        a = Nodo("a", [("href", url)])
        a.figli = [url]
        pezzi.append(a)
        pos = m.end()
    if pos < len(testo):
        pezzi.append(testo[pos:])
    return pezzi


# ---------------------------------------------------------------------------
# Serializzazione e pagina
# ---------------------------------------------------------------------------

def serializza(nodo):
    if isinstance(nodo, str):
        return html.escape(nodo, quote=False)
    attr = "".join(
        ' %s="%s"' % (chiave, html.escape(str(valore), quote=True))
        for chiave, valore in nodo.attrs
    )
    if nodo.tag in VUOTI:
        return "<%s%s>" % (nodo.tag, attr)
    dentro = "".join(serializza(f) for f in nodo.figli)
    return "<%s%s>%s</%s>" % (nodo.tag, attr, dentro, nodo.tag)


def corpo_html(radice):
    blocchi = [f for f in radice.figli
               if not (isinstance(f, str) and f.strip() == "")]
    return "\n".join(serializza(f) for f in blocchi)


def pagina(titolo, descrizione, slug, corpo):
    # Percorsi relativi: la pagina sta in analisi/<slug>/ e il sito può
    # vivere anche sotto un sottopercorso (project page GitHub). Fanno
    # eccezione i tag og:, che vogliono URL assoluti sulla radice definitiva.
    return """<!DOCTYPE html>
<html lang="it">
<head>
%s
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>%s · Sabato Portfolio</title>
<meta name="description" content="%s">
<meta name="theme-color" content="#0c0c0c">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Sabato Portfolio">
<meta property="og:title" content="%s · Sabato Portfolio">
<meta property="og:description" content="%s">
<meta property="og:url" content="%s/analisi/%s/">
<meta property="og:image" content="%s/og.png">
<meta property="og:locale" content="it_IT">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../../favicon.ico" sizes="any">
<link rel="icon" href="%s">
<link rel="stylesheet" href="../analisi.css">
</head>
<body>
<header>
  <nav class="barra"><a href="../../">sabato@portfolio:~$</a></nav>
  <h1>%s</h1>
  <p class="autore">a cura di Sabato Niccolò</p>
</header>
<main>
%s
</main>
<footer><a href="../../">torna al portfolio</a></footer>
</body>
</html>
""" % (GA, html.escape(titolo), html.escape(descrizione),
       html.escape(titolo), html.escape(descrizione),
       SITO, slug, SITO, ICONA, html.escape(titolo), corpo)


# ---------------------------------------------------------------------------
# Conversione
# ---------------------------------------------------------------------------

def trova_pandoc():
    try:
        subprocess.run(["pandoc", "--version"],
                       capture_output=True, check=True)
        return ["pandoc"]
    except (OSError, subprocess.CalledProcessError):
        pass
    try:
        subprocess.run(["mise", "--version"],
                       capture_output=True, check=True)
    except (OSError, subprocess.CalledProcessError):
        raise SystemExit(
            "pandoc non trovato: installalo (oppure usa mise) e riprova."
        )
    return ["mise", "x", "pandoc@latest", "--", "pandoc"]


def converti(pandoc, sorgente):
    out = subprocess.run(
        [*pandoc, str(sorgente), "-f", "markdown", "-t", "html5",
         "--wrap=none", "-o", "-"],
        check=True, capture_output=True, text=True,
    )
    return out.stdout


def dimensione_png(percorso):
    with open(percorso, "rb") as f:
        testa = f.read(24)
    if len(testa) < 24 or not testa.startswith(b"\x89PNG\r\n\x1a\n"):
        return None
    larghezza, altezza = struct.unpack(">II", testa[16:24])
    return larghezza, altezza


def controlla_trattini(testo, slug):
    for trattino in TRATTINI_VIETATI:
        if trattino in testo:
            riga = next(
                (i + 1 for i, r in enumerate(testo.splitlines())
                 if trattino in r),
                "?",
            )
            raise SystemExit(
                "%s: la pagina generata contiene un trattino %s (riga %s). "
                "Lo stile comune dei progetti li vieta: systemalo in md/%s.md "
                "e rilancia lo script." % (slug, repr(trattino), riga, slug)
            )


def genera(sorgente, pandoc):
    slug = sorgente.stem
    print("%s:" % slug)

    figure_dir = SORGENTI / "figures" / slug
    html_grezzo = converti(pandoc, sorgente)

    albero = Albero()
    albero.feed(html_grezzo)
    radice = albero.radice
    titolo = titolo_e_corpo(radice)
    if not titolo:
        raise SystemExit(
            "%s: il file md/%s.md deve aprirsi con un titolo '# ...'"
            % (slug, slug)
        )

    # Dimensioni delle figure e verifica che esistano tutte.
    dimensioni = {}
    for m in re.finditer(r'<img[^>]*src="([^"]+)"', html_grezzo):
        nome = Path(m.group(1)).name
        percorso = figure_dir / nome
        if not percorso.exists():
            raise SystemExit(
                "%s: md/%s.md richiama %s ma il file non c'è"
                % (slug, slug, percorso.relative_to(RADICE))
            )
        dimensioni[nome] = dimensione_png(percorso)

    sistema_a(radice, dimensioni)
    radice.figli = sistema_b(radice.figli)
    radice.figli = collega_url(radice.figli)
    radice.figli = togli_didascalie(radice.figli)
    descrizione = descrizione_meta(radice, slug)
    corpo = corpo_html(radice)

    destinazione = USCITA / slug
    if destinazione.is_dir():
        shutil.rmtree(destinazione)
    elif destinazione.exists():
        destinazione.unlink()
    cartella_figure = destinazione / "figures"
    cartella_figure.mkdir(parents=True)
    for figura in sorted(figure_dir.glob("*")):
        if figura.is_file():
            shutil.copy2(figura, cartella_figure / figura.name)

    testo_pagina = pagina(titolo, descrizione, slug, corpo)
    controlla_trattini(testo_pagina, slug)
    (destinazione / "index.html").write_text(testo_pagina, encoding="utf-8")
    print("  scritto %s/index.html con %d figure"
          % (destinazione.relative_to(RADICE), len(dimensioni)))

    # Promemoria: la home elenca le analisi da data/projects.js.
    progetti = (RADICE / "data" / "projects.js").read_text(encoding="utf-8")
    if ('id: "%s"' % slug) not in progetti:
        print("  ⚠ nessuna voce con id \"%s\" in data/projects.js: "
              "la home non la elenca" % slug)


def main():
    sorgenti = sorted(SORGENTI.glob("*.md"))
    if not sorgenti:
        raise SystemExit("nessun .md trovato in md/")

    if len(sys.argv) > 1:
        richiesti = set(sys.argv[1:])
        sorgenti = [s for s in sorgenti if s.stem in richiesti]
        ignoti = richiesti - {s.stem for s in SORGENTI.glob("*.md")}
        if ignoti:
            raise SystemExit("analisi sconosciute: " + ", ".join(sorted(ignoti)))

    pandoc = trova_pandoc()
    for sorgente in sorgenti:
        genera(sorgente, pandoc)
    print("Fatto. Anteprima: python3 server.py, poi /analisi/<slug>/")


if __name__ == "__main__":
    main()
