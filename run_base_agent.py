from dotenv import load_dotenv

load_dotenv()

from base_agent import setup_agent, run_agent

if __name__ == '__main__':
    agent = setup_agent()
    response = run_agent(agent, "What's my wallet address?")
    print(response)
