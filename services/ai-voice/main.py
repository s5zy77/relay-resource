import os
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

# This service is for Member 4: AI Voice calling agent and Predictive Analytics

class AIVoiceHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/api/voice-reminder':
            # This endpoint will trigger an AI outbound call via Vapi/Twilio
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            customer_name = data.get('customer')
            item = data.get('item')
            
            # TODO: Integrate Retell/Twilio SDK to dispatch outbound call
            print(f"Triggering AI Voice Call to {customer_name} for overdue rental: {item}")
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            response = {"status": "success", "message": "Voice call dispatched."}
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        elif self.path == '/api/predictive-maintenance':
            # Bonus: Logic here to track if an asset needs repair based on rental counts.
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"repair_needed": False}).encode())

def run(server_class=HTTPServer, handler_class=AIVoiceHandler, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'Starting AI Voice and ML service on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
