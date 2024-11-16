import sys

import time

from dotenv import load_dotenv

load_dotenv()

import os


import pandas as pd
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from base_agent import load_wallet, create_agent, get_spot_price_tool

prompt = "What's the price of ETH in USD on the base network. Use get_spot_price_tool to perform this task."

if __name__ == '__main__':
    llm = ChatOpenAI(model="gpt-4o-mini")

    wallet_details = load_wallet(os.environ.get("WALLET_DATA_FILE"))

    agent_executor = create_agent(llm=llm, wallet_details=wallet_details, tools=[get_spot_price_tool],
                                  csv_agent=True, csv_file_path="base_agent/data/prices.csv")

    config = {"configurable": {"thread_id": "NeuroNova - Agent Powered by CDP Agentkit!"}}

    executor_num = 1
    while True:
        try:
            print("\nExecutor no:", executor_num)
            thought = (
                "I want you to check the price of ETH, BTC, USDT, BSC, and SOL tokens in USD on the base network. Is the price of ETH growing or declining in the last 1 year"
                "Use the get_spot_price_tool to perform this task."
            )

            for chunk in agent_executor.stream(
                    {"messages": [HumanMessage(content=thought)]}, config
            ):
                if "agent" in chunk:
                    print("agent:", chunk["agent"]["messages"][0].content)
                elif "tools" in chunk:
                    print("tool:", chunk["tools"]["messages"][0].content)
                print("-------------------")

            executor_num = executor_num + 1
            # wait here
            time.sleep(float(os.environ.get("AGENT_RUN_INTERVAL")))

        except KeyboardInterrupt:
            print("Stopping the agent!")
            sys.exit(0)
