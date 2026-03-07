from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic

app = Flask(__name__)
CORS(app)

import os
from dotenv import load_dotenv
load_dotenv()
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    message = data.get('message', '')
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system="You are a compassionate and practical career advisor on LayoffLens, a platform for people affected by layoffs. You give warm, honest, actionable advice to people who have been laid off or are worried about losing their job. Focus on practical next steps, mental health, skill building especially AI tools, job search strategies, and financial advice. Keep responses concise 3-4 paragraphs max. Be human, not corporate.",
        messages=[{"role": "user", "content": message}]
    )
    
    return jsonify({"response": response.content[0].text})

if __name__ == '__main__':
    app.run(debug=True, port=5000)