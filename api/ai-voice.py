from http.server import BaseHTTPRequestHandler
import json

# Vercel-compliant serverless function handler
class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            body = json.loads(post_data.decode('utf-8')) if post_data else {}
            
            customer = body.get('customer', 'Customer')
            item = body.get('item', 'Equipment')
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            
            # Simple AI execution proxy for Vercel runtime
            response = {"status": "Vercel AI Agent Simulated Call Dispatched", "customer": customer, "item": item}
            self.wfile.write(json.dumps(response).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        return
