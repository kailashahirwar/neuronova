from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, jsonify

from run_base_agent import run_agent

app = Flask(__name__)

@app.route("/")
def generate():
    response = run_agent(request.form.get('prompt'))
    return jsonify({"response": response})

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
