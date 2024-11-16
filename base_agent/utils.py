import datetime

import json
import os
import pandas as pd
import requests
import time
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from langchain.agents import AgentType, initialize_agent
from langchain.tools import Tool
from langchain_community.document_loaders import CSVLoader
from langchain_community.vectorstores import Chroma
from langchain_experimental.agents import create_csv_agent
from langchain_openai import OpenAIEmbeddings
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent


def load_wallet(wallet_file):
    """
    load wallet details from a text file
    :param wallet_file: file path
    :return: wallet details
    """
    wallet_details = None

    if os.path.exists(wallet_file):
        with open(wallet_file) as f:
            wallet_details = f.read()

    return wallet_details


def create_csv_query_tool(llm, file_path):
    """
    create a csv query tool
    :param llm: llm
    :param file_path: csv file path
    :return: agent
    """
    csv_agent = create_csv_agent(
        llm,
        file_path,
        verbose=True,
        agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
        allow_dangerous_code=True
    )

    # Create a tool from the CSV agent
    csv_tool = Tool(
        name="CSV Query Tool",
        func=csv_agent.run,
        description="Useful for querying and analyzing CSV data. "
                    "Input should be a natural language query about the CSV content."
    )

    return csv_tool


def create_agent(llm, wallet_details, tools, csv_agent=False, csv_file_path=None):
    """
    create a ReACT agent
    :param wallet_data: wallet details
    :return: ReACT agent
    """
    values = {}
    if wallet_details is not None:
        values = {"cdp_wallet_data": wallet_details}

    # instantiate agentkit wrapper
    agentkit = CdpAgentkitWrapper(**values)

    # create CDP toolkit from the agentkit wrapper
    cdp_toolkit = CdpToolkit.from_cdp_agentkit_wrapper(agentkit)
    all_tools = cdp_toolkit.get_tools() + tools

    # create memory
    memory = create_memory()

    if csv_agent:
        # data = pd.read_csv("base_agent/data/prices.csv")

        loader = CSVLoader(file_path="base_agent/data/prices.csv", encoding="utf-8")
        documents = loader.load()

        # preprocess data (e.g., concatenate columns for context)
        # data["combined_text"] = data.apply(lambda row: " ".join(row.astype(str)), axis=1)

        for i, doc in enumerate(documents):
            doc.metadata['row_index'] = i

        # create a Vector Store
        embeddings = OpenAIEmbeddings()
        # vector_store = Chroma.from_texts(data["combined_text"].tolist(), embeddings)

        vectorstore = Chroma.from_documents(documents, embeddings)

        def retrieve_data(query):
            # Retrieve relevant documents
            docs = vectorstore.similarity_search(query, k=10)

            # Sort documents by original row index
            docs.sort(key=lambda x: x.metadata['row_index'])

            # Extract and return relevant information
            results = []
            for doc in docs:
                result = {
                    "content": doc.page_content,
                    "metadata": doc.metadata
                }
                results.append(result)
            return results

        retrieval_tool = Tool(
            name="DataRetriever",
            func=retrieve_data,
            description="Use this tool to retrieve relevant information from the CSV file."
        )
        all_tools.extend([retrieval_tool])

    # create and return agent
    return create_react_agent(
        llm,
        tools=all_tools,
        checkpointer=memory,
        state_modifier="You are a helpful agent that can interact onchain using the Coinbase Developer Platform Agentkit. "
                       "You are empowered to interact onchain using your tools. If you ever need funds, "
                       "you can request them from the faucet if you are on network ID `base-sepolia`. "
                       "If not, you can provide your wallet details and request funds from the user. "
                       "If someone asks you to do something you can't do with your currently available tools, "
                       "you must say so, and encourage them to implement it themselves using the CDP SDK + Agentkit,"
                       " recommend they go to docs.cdp.coinbase.com for more information. Be concise and helpful with "
                       "your responses. Refrain from restating your tools' descriptions unless it is "
                       "explicitly requested.",
    )


def create_memory():
    """
    create memory to store the conversation history.
    :return: memory saver and configuration
    """
    memory = MemorySaver()

    return memory


def get_spot_price(currency_pair):
    """
    get spot price for a currency pair
    :param currency_pair: base and quote currentcy pair
    :return: price in the quote currency
    """
    url = os.environ.get("BASE_SPOT_PRICE").format(currency_pair)
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data['data']['amount']
    else:
        return None


def get_base_currencies():
    """
    get base currencies on the base network
    :return: list of base currencies
    """
    url = os.environ.get("BASE_GET_PRODUCTS")
    response = requests.get(url)
    if response.status_code == 200:
        currencies = response.json()
        base_currencies = []
        for currency in currencies:
            base_currencies.append(currency['base_currency'])
        base_currencies = list(set(base_currencies))
        return base_currencies
    else:
        return None


def get_fiat_currencies():
    """
    fet fiat currencies on the base network
    :return: list of fiat currencies
    """
    url = os.environ.get("BASE_GET_PRODUCTS")
    response = requests.get(url)
    if response.status_code == 200:
        currencies = response.json()
        fiat_currencies = []
        for currency in currencies:
            fiat_currencies.append(currency['quote_currency'])
        fiat_currencies = list(set(fiat_currencies))
        return fiat_currencies
    else:
        return None


def get_base_products():
    """
    get products listed on base network
    :return: list of products
    """
    url = os.environ.get("BASE_GET_PRODUCTS")
    response = requests.get(url)
    if response.status_code == 200:
        products = response.json()
        return products
    else:
        return None


def create_wallet():
    """
    create a wallet
    :return: wallet details
    """
    wallet = Wallet.createRandom()
    address = wallet.address
    private_key = wallet.privateKey.hex()
    mnemonic = wallet.mnemonic.phrase

    wallet_info = {
        "address": address,
        "private_key": private_key,
        "mnemonic": mnemonic
    }

    print("Wallet created successfully!")
    print(f"Address: {address}")
    print(f"Private Key: {private_key}")
    print(f"Mnemonic Phrase: {mnemonic}")

    # Save wallet information to a JSON file
    with open("wallet_info.json", "w") as f:
        json.dump(wallet_info, f)

    print("Wallet information saved to wallet_info.json")

    return wallet_info


def update_spot_prices(symbols, output_file_path):
    """
    to fetch price of multiple symbols
    :param symbols: list of symbols
    :param output_file_path: output file path
    """

    now = datetime.datetime.now()
    current_time = now.strftime('%Y-%m-%d %H:%M:%S %Z')

    print(f"Current date and time: {current_time}")

    prices = {"time": current_time}

    for index, symbol in enumerate(symbols):
        # print(symbol)
        price = get_spot_price(f"{symbol}-USD")

        prices[symbol] = price
        # print(f"price:{price}")

        # wait for 1 second
        time.sleep(0.1)

    if os.path.exists(output_file_path):
        with open(output_file_path, "r") as f:
            existing_data = json.load(f)
            existing_data.extend([prices])
        with open(output_file_path, "w") as f:
            json.dump(existing_data, f)
    else:
        with open(output_file_path, "w") as f:
            json.dump([prices], f)

    print("Data updated successfully!")


def json_to_csv(json_file_path, csv_file_path):
    """
    convert a json file to csv
    :param json_file_path:
    :param csv_file_path:
    :return: None
    """
    with open(json_file_path, 'r') as json_file:
        data = json.load(json_file)

    df = pd.DataFrame(data)
    df.to_csv(csv_file_path, index=False)
