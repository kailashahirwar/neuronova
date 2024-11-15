from dotenv import load_dotenv
load_dotenv()

from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

from cdp_langchain.agent_toolkits import CdpToolkit
from cdp_langchain.utils import CdpAgentkitWrapper

# Initialize CDP wrapper
cdp = CdpAgentkitWrapper()

# Create toolkit from wrapper
toolkit = CdpToolkit.from_cdp_agentkit_wrapper(cdp)

# Initialize LLM
llm = ChatOpenAI(model="gpt-4o-mini")

# Get tools and create agent
tools = toolkit.get_tools()
agent_executor = create_react_agent(llm, tools)

# Example usage
events = agent_executor.stream(
    {"messages": [("user", "Check my wallet balance?")]},
    stream_mode="values"
)

for event in events:
    event["messages"][-1].pretty_print()
