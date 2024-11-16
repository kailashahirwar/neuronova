import time

from dotenv import load_dotenv
from langchain_experimental.llms.anthropic_functions import prompt
from websocket import continuous_frame

load_dotenv()

from celery import Celery, Task, shared_task
import os
from flask_cors import CORS
from base_agent import setup_agent, run_agent
import uuid

from flask import Flask, request, jsonify

def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app

def create_app() -> Flask:
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY")

    app.config.from_mapping(
        CELERY=dict(
            broker_url="redis://localhost",
            result_backend="redis://localhost",
            task_ignore_result=True,
        ),
    )
    app.config.from_prefixed_env()
    celery_init_app(app)
    return app

app = create_app()
celery_app = app.extensions["celery"]

CORS(app)

agent = setup_agent()

continuous_agent = setup_agent()

@shared_task(ignore_result=True)
def run_continuous_agent_delay(prompt):
    print("continuous agent:", continuous_agent)
    timeout = 30
    start_time = int(time.time())

    while True:
        print(f"current time: {int(time.time())}")
        response = run_agent(continuous_agent, prompt)
        print("continuous_agent:", response)
        if "Goodbye!" in response:
            print("agent completed task successfully!")
            break
        time.sleep(10)

        if int(time.time()) - start_time > timeout:
            break


@app.route("/", methods=['GET', 'POST'])
def generate():
    if request.method == "POST":
        response = run_agent(agent, request.get_json().get('prompt'))
        return jsonify({"response": response})
    else:
        return jsonify({"status": "failure", "message": "invalid call!"})


@app.route("/continuous", methods=['GET', 'POST'])
def run_continuous_agent():
    if request.method == "POST":
        run_continuous_agent_delay.delay(prompt=request.get_json().get('prompt'))
        print("continuous agent started:", continuous_agent)
        return jsonify({"status": "success", "message": "agent started successfully!"})
    else:
        return jsonify({"status": "failure", "message": "invalid call!"})


@app.route("/restart", methods=['GET', 'POST'])
def restart():
    if request.method == "POST":
        global agent
        global continuous_agent
        if request.get_json().get('secret') != os.environ.get("FLASK_AGENT_RESTART_SECRET"):
            return jsonify({"status": "failure", "message": "invalid call!"})
        agent = None
        continuous_agent = None

        agent = setup_agent()
        continuous_agent = setup_agent()
        return jsonify({"status": "success", "message": "server restarted successfully!"})
    else:
        return jsonify({"status": "failure", "message": "invalid call!"})


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
