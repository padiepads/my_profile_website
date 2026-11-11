# Python Backend Script for Portfolio Server / CLI
# Run with: python app.py

import json
from http.server import HTTPServer, BaseHTTPRequestHandler

PORT = 8000

profile_data = {
    "name": "Jerald J. Padellon",
    "nickname": "Padie",
    "course": "BS Computer Science (BSCS 3-2)",
    "school": "Cavite State University - Bacoor Campus",
    "role": "Aspiring Software Engineer",
    "skills": ["HTML", "CSS", "JavaScript", "Java", "Python"],
    "projects": [{
        "name": "Barangay CINCO",
        "link": "https://padiepads.github.io/Barangay-CINCO/",
        "roles": ["Frontend", "Backend", "Programmer"]
    }]
}

class SimpleHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(profile_data, indent=2).encode('utf-8'))

if __name__ == '__main__':
    print(f"Starting Python backend server on http://localhost:{PORT}")
    server = HTTPServer(('localhost', PORT), SimpleHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")