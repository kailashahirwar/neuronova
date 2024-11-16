import json
from langchain.tools import tool

from .utils import get_spot_price, update_spot_prices, json_to_csv


@tool
def get_spot_price_tool(currency_pair):
    """get spot price for a currency pair"""
    return get_spot_price(currency_pair)


def fetch_latest_price():
    print("fetching latest prices...")
    with open("base_agent/data/base_currencies.json", "r") as f:
        symbols = json.load(f)[:10]

    update_spot_prices(symbols, "base_agent/data/prices.json")

    json_to_csv("base_agent/data/prices.json", "base_agent/data/prices.csv")
    print("latest prices fetched successfully")
