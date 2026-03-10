import http.server
import socketserver
import sqlite3
import json
import os

PORT = 8000
DB_FILE = 'database.sqlite'

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            founder_name TEXT,
            founder_role TEXT,
            email TEXT,
            phone TEXT,
            startup_name TEXT,
            category TEXT,
            headquarters TEXT,
            website TEXT,
            funding_stage TEXT,
            revenue TEXT,
            pitch_deck TEXT,
            description TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )
    ''')
    conn.commit()
    conn.close()

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    
    # Enable fallback to serve index.html if necessary
    # Note: Since we're dealing with standard html files like application.html
    # the SimpleHTTPRequestHandler handles it out of the box.
    
    def do_POST(self):
        if self.path == '/api/apply':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                # Default empty strings for optional fields or fields not sent
                founder_name = data.get('founderName', '')
                founder_role = data.get('founderRole', '')
                email = data.get('email', '')
                phone = data.get('phone', '')
                startup_name = data.get('startupName', '')
                category = data.get('category', '')
                headquarters = data.get('headquarters', '')
                website = data.get('website', '')
                funding_stage = data.get('fundingStage', '')
                revenue = data.get('revenue', '')
                pitch_deck = data.get('pitchDeck', '')
                description = data.get('description', '')

                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO applications (
                        founder_name, founder_role, email, phone, startup_name,
                        category, headquarters, website, funding_stage, revenue, 
                        pitch_deck, description
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    founder_name, founder_role, email, phone, startup_name,
                    category, headquarters, website, funding_stage, revenue,
                    pitch_deck, description
                ))
                conn.commit()
                conn.close()

                # Send success response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"status": "success", "message": "Application stored successfully!"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                
        elif self.path == '/api/register':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                name = data.get('name', '')
                email = data.get('email', '')
                password = data.get('password', '')
                
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                try:
                    cursor.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, password))
                    conn.commit()
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {"status": "success", "message": "Registration successful!"}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                except sqlite3.IntegrityError:
                    self.send_response(400)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {"status": "error", "message": "Email is already registered"}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                finally:
                    conn.close()
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))

        elif self.path == '/api/login':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode('utf-8'))
                email = data.get('email', '')
                password = data.get('password', '')
                
                conn = sqlite3.connect(DB_FILE)
                cursor = conn.cursor()
                cursor.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password))
                user = cursor.fetchone()
                conn.close()
                
                if user:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {"status": "success", "message": "Login successful!"}
                    self.wfile.write(json.dumps(response).encode('utf-8'))
                else:
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    response = {"status": "error", "message": "Invalid email or password"}
                    self.wfile.write(json.dumps(response).encode('utf-8'))

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(response).encode('utf-8'))

        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    init_db()
    
    # Change current directory to where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at http://localhost:{PORT}")
        httpd.serve_forever()
