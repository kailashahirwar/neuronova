import os
import requests
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
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


def create_agent(llm, wallet_details, tools):
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
