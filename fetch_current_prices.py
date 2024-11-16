import time

from dotenv import load_dotenv

load_dotenv()
from datetime import datetime

import json

from base_agent.utils import update_spot_prices, json_to_csv


def fetch_prices(num=None):
    while True:
        now = datetime.now()
        current_time = now.strftime('%Y-%m-%d %H:%M:%S %Z')
        print(f"fetching latest prices {current_time}...")
        with open("base_agent/data/base_currencies.json", "r") as f:
            if num is not None:
                symbols = json.load(f)[:num]
            else:
                symbols = json.load(f)

        update_spot_prices(symbols, "base_agent/data/prices.json")

        json_to_csv("base_agent/data/prices.json", "base_agent/data/prices.csv")
        print("latest prices fetched successfully")

        time.sleep(60 * 10)


if __name__ == '__main__':
    fetch_prices()
