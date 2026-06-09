#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import threading
import os
import sys

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    # Override log_message to keep the terminal output clean and professional
    def log_message(self, format, *args):
        pass

def open_browser():
    try:
        webbrowser.open(f'http://localhost:{PORT}')
    except Exception as e:
        print(f"Note: Could not open browser automatically: {e}", file=sys.stderr)

def main():
    print("=" * 60)
    print("      अमरीका का बिखरता साम्राज्य (Bikharta Samrajya) - Local Preview")
    print("=" * 60)
    print(f"Starting elegant book reader web server on port {PORT}...")
    print(f"Serving files from: {DIRECTORY}\n")
    
    # Configure the TCPServer to allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), QuietHandler) as httpd:
            # Start a thread to open the browser automatically after the server is up
            threading.Timer(1.0, open_browser).start()
            
            print(f"👉 Open your browser at: http://localhost:{PORT}")
            print("👉 Press Ctrl+C in this terminal to stop the server.")
            print("-" * 60)
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped. Thank you for reading!")
    except Exception as e:
        print(f"\nError starting server: {e}", file=sys.stderr)

if __name__ == '__main__':
    main()
