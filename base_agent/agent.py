import os
import random
import uuid
from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper
from langchain.tools import Tool
from langchain_community.document_loaders import CSVLoader
from langchain_community.vectorstores import Chroma
from langchain_core.messages import HumanMessage
from langchain_openai import ChatOpenAI
from langchain_openai import OpenAIEmbeddings
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

from .utils import load_wallet
from .tools import get_spot_price_tool


def setup_agent():
    """
    set up agent with llm and wallet details
    :return: agent
    """
    llm = ChatOpenAI(model="gpt-4o-mini")

    wallet_details = load_wallet(os.environ.get("WALLET_DATA_FILE"))

    agent_executor = create_agent(llm=llm, wallet_details=wallet_details, tools=[get_spot_price_tool],
                                  csv_agent=True, csv_file_path="base_agent/data/prices.csv")

    return agent_executor


def run_agent(agent, prompt):
    """
    run agent on a particular prompt
    :param agent: agent to use
    :param prompt: prompt to pass to the agent
    :return: response
    """
    config = {"configurable": {"thread_id": random.randint(100000, 99999999),
                               "checkpoint_ns": "conversation",
                               "checkpoint_id": str(uuid.uuid4())}}

    try:
        final_response = ""
        for chunk in agent.stream(
                {"messages": [HumanMessage(content=prompt)]}, config
        ):
            if 'agent' in chunk:
                final_response = chunk["agent"]["messages"][0].content

        return final_response

    except Exception as e:
        print(f"Error:{str(e)}!")
        return None


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
    agent = create_react_agent(
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
                       "explicitly requested."
    )

    return agent
    # return AgentExecutor(agent=agent, tools=tools, verbose=True)


def create_memory():
    """
    create memory to store the conversation history.
    :return: memory saver and configuration
    """
    memory = MemorySaver()

    return memory
