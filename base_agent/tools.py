from langchain.tools import tool

from .utils import get_spot_price


@tool
def get_spot_price_tool(currency_pair):
    """get spot price for a currency pair"""
    return get_spot_price(currency_pair)
