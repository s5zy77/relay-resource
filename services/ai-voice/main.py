import os
import json
import uuid
from http.server import BaseHTTPRequestHandler, HTTPServer

class AIVoiceHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/voice-reminder':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
            data = json.loads(post_data.decode('utf-8'))
            
            customer_name = data.get('customer', 'Unknown')
            item = data.get('item', 'Item')
            
            print(f"Triggering AI Voice Call to {customer_name} for overdue rental: {item}")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            # Mimic creation of a voice call session
            session_id = str(uuid.uuid4())
            response = {
                "status": "success", 
                "message": "Voice call dispatched.",
                "session_id": session_id,
                "customer": customer_name,
                "item": item
            }
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        elif self.path == '/api/predictive-maintenance':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps({"repair_needed": False, "health_score": 94}).encode())
        else:
            self.send_response(404)
            self.end_headers()

def run(server_class=HTTPServer, handler_class=AIVoiceHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting AI Voice and ML service on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
