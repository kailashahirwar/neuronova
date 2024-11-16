from dotenv import load_dotenv
load_dotenv()

import json

from base_agent.utils import update_spot_prices, json_to_csv

if __name__ == '__main__':
    with open("base_agent/data/base_currencies.json", "r") as f:
        symbols = json.load(f)[:10]

    update_spot_prices(symbols, "base_agent/data/prices.json")

    json_to_csv("base_agent/data/prices.json", "base_agent/data/prices.csv")
