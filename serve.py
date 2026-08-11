import http.server
import socketserver
import os
from urllib.parse import urlsplit

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        requested_path = urlsplit(self.path).path
        local_path = os.path.join(DIRECTORY, requested_path.lstrip('/'))
        known_file = os.path.isfile(local_path)
        is_asset = os.path.splitext(requested_path)[1] != ''
        if not known_file and not is_asset:
            self.path = '/index.html'
        super().do_GET()

class ThreadingTCPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    allow_reuse_address = True
    daemon_threads = True

with ThreadingTCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
