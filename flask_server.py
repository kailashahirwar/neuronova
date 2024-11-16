from dotenv import load_dotenv

load_dotenv()

import os
from flask_cors import CORS
from base_agent import setup_agent, run_agent

from flask import Flask, request, jsonify

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY")

CORS(app)

agent = setup_agent()


@app.route("/", methods=['GET', 'POST'])
def generate():
    if request.method == "POST":
        response = run_agent(agent, request.get_json().get('prompt'))
        return jsonify({"response": response})
    else:
        return jsonify({"status": "failure", "message": "invalid call!"})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
