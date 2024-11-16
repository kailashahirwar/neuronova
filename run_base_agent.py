from dotenv import load_dotenv
from langchain.chains.question_answering.map_rerank_prompt import output_parser

load_dotenv()

import os
import sys
import time
from base_agent.tools import fetch_latest_price

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from base_agent import load_wallet, create_agent, get_spot_price_tool

prompt = "What's the price of ETH in USD on the base network. Use get_spot_price_tool to perform this task."

def run_agent(prompt):
    llm = ChatOpenAI(model="gpt-4o-mini")

    wallet_details = load_wallet(os.environ.get("WALLET_DATA_FILE"))

    config = {"configurable": {"thread_id": "NeuroNova - Agent Powered by CDP Agentkit!"}}

    executor_num = 1
    # while True:
    # try:
    # update prices
    fetch_latest_price()

    # re-instantiate agent
    print("creating/updating agent...")
    agent_executor = create_agent(llm=llm, wallet_details=wallet_details, tools=[get_spot_price_tool],
                                  csv_agent=True, csv_file_path="base_agent/data/prices.csv")

    print("\nExecutor no:", executor_num)
    thought = (
        "You are a cryptocurrency trader. You want to trade ETH on the Base network. "
        "Start with checking the current price of the ETH in USD on the base network. "
        "Historical data for ETH prices is available in the prices.csv file. "
        "The ETH column contains the price for ETH."
        "The time column contains the time in the %Y-%m-%d %H:%M:%S %Z python datetime format."
        "It is in the old to latest data in the row format."
        "Use the last 5 values only."
        "Use the prices data to compare the ETH if it declining or growing. "
        "Calculate the percentage of growth in ETH. If the growth is more that 1%, make a purchase."
        "Use the get_spot_price_tool and DataRetriever tool to answer this question."
    )

    # TODO: improve this
    thought = prompt

    final_response = []
    for chunk in agent_executor.stream(
            {"messages": [HumanMessage(content=thought)]}, config
    ):
        if "agent" in chunk:
            final_response.append(f"agent:{chunk["agent"]["messages"][0].content}")
        elif "tools" in chunk:
            final_response.append(f"tool:{chunk["tools"]["messages"][0].content}")
        print("-------------------")

    return ".".join(final_response)

    # executor_num = executor_num + 1

    # wait here
    # time.sleep(float(os.environ.get("AGENT_RUN_INTERVAL")))

    # except KeyboardInterrupt:
    #     print("Stopping the agent!")
    #     sys.exit(0)

if __name__ == '__main__':
    response = run_agent("What's my wallet address?")
    print(response)

