import http.server
import socketserver
import os
import sys

PORT = 3000
DIRECTORY = os.path.join(os.path.dirname(__file__), "public")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

print(f"Starting MROSHELEVATE server on port {PORT} from {DIRECTORY}...", flush=True)

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at http://localhost:{PORT}", flush=True)
        httpd.serve_forever()
except Exception as e:
    print(f"Error starting server: {e}", file=sys.stderr, flush=True)
