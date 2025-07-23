#!/usr/bin/env python3
import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs
from urllib.request import urlopen
import random
import math

PORT = 8000

class ProcessHandler(http.server.SimpleHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
            self.end_headers()
            response = {"message": "プロセスインフォマティクス API"}
            self.wfile.write(json.dumps(response).encode())
        else:
            self.send_error(404)

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode('utf-8'))
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', 'http://localhost:3000')
        self.end_headers()
        
        if self.path == '/predict':
            # 条件から品質を予測
            gate_a = data.get('gate_a_time', 10)
            gate_b = data.get('gate_b_time', 8)
            stir_speed = data.get('stir_speed', 100)
            temperature = data.get('temperature', 80)
            
            # 簡単な線形モデル
            hardness = gate_a * 2.5 + gate_b * 1.8 + stir_speed * 0.15 + temperature * 0.3 + random.uniform(-2, 2)
            mass = gate_a * 8.5 + gate_b * 6.2 + stir_speed * 0.05 + temperature * 0.8 + random.uniform(-5, 5)
            
            response = {
                "hardness": round(max(0, hardness), 2),
                "mass": round(max(0, mass), 2)
            }
            
        elif self.path == '/estimate':
            # 品質から条件を推定
            hardness = data.get('hardness', 45)
            mass = data.get('mass', 120)
            
            # 逆計算による推定
            base_gate_a = (hardness - mass * 0.1) / 3.0
            base_gate_b = (mass - hardness * 0.5) / 8.0
            base_stir_speed = (hardness + mass) * 2.0
            base_temperature = (hardness + mass * 0.3) / 2.0
            
            # 制約を適用
            gate_a_time = max(1.0, min(20.0, base_gate_a + random.uniform(-0.5, 0.5)))
            gate_b_time = max(1.0, min(20.0, base_gate_b + random.uniform(-0.5, 0.5)))
            stir_speed = max(50.0, min(200.0, base_stir_speed + random.uniform(-5, 5)))
            temperature = max(60.0, min(100.0, base_temperature + random.uniform(-2, 2)))
            
            response = {
                "gate_a_time": round(gate_a_time, 1),
                "gate_b_time": round(gate_b_time, 1),
                "stir_speed": round(stir_speed, 0),
                "temperature": round(temperature, 1)
            }
        else:
            self.send_error(404)
            return
            
        self.wfile.write(json.dumps(response).encode())

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), ProcessHandler) as httpd:
        print(f"バックエンドサーバーがポート {PORT} で起動しました")
        print(f"http://localhost:{PORT} でアクセス可能です")
        httpd.serve_forever()