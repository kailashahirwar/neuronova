from dotenv import load_dotenv

load_dotenv()

import os

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from base_agent import load_wallet, create_agent, get_spot_price_tool

if __name__ == '__main__':
    llm = ChatOpenAI(model="gpt-4o-mini")

    wallet_details = load_wallet(os.environ.get("WALLET_DATA_FILE"))

    agent_executor = create_agent(llm=llm, wallet_details=wallet_details, tools=[get_spot_price_tool])

    config = {"configurable": {"thread_id": "NeuroNova - Agent Powered by CDP Agentkit!"}}

    for chunk in agent_executor.stream(
            {"messages": [HumanMessage(content="What's the price of ETH in USD on the base network. "
                                               "Use get_spot_price_tool to perform this task.")]}, config
    ):
        if "agent" in chunk:
            print("agent:", chunk["agent"]["messages"][0].content)
        elif "tools" in chunk:
            print("tool:", chunk["tools"]["messages"][0].content)
        print("-------------------")
