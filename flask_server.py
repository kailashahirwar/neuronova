from dotenv import load_dotenv
load_dotenv()

import os
from flask_cors import CORS

from flask import Flask, request, jsonify

from run_base_agent import run_agent

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY")

CORS(app)

@app.route("/", methods=['GET', 'POST'])
def generate():
    if request.method == "POST":
        response = run_agent(request.form.get('prompt'))
        return jsonify({"response": response})
    else:
        return jsonify({"status":"failure", "message": "invalid call!"})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
