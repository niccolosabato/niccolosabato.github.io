#!/usr/bin/env python3
"""Server di sviluppo: come `python3 -m http.server`, ma senza cache.

Serve per due motivi. Il primo è obbligatorio: il sito usa gli ES modules, che
il browser rifiuta di caricare da `file://` — aprire `index.html` con doppio
clic non funziona e basta. Il secondo è comodità: `http.server` non manda alcun
header di cache e il browser decide da sé, quindi capita di ritrovarsi un
modulo vecchio accanto a un `index.html` nuovo dopo una modifica.

    python3 serve.py [porta]        # default 8765
"""

import http.server
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print('Sabato Portfolio su http://localhost:%d/ (senza cache)' % port)
    http.server.test(HandlerClass=NoCache, port=port, bind='0.0.0.0')
