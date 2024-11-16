import requests

BASE_URL = "http://0.0.0.0:3000"
ENDPOINT = "/tdxquote"

url = f"{BASE_URL}{ENDPOINT}"

try:
    response = requests.get(url)
    if response.status_code == 200:
        quote_data = response.json()
        print("Quote Data Retrieved Successfully:")
        print(quote_data)
    else:
        print(f"Failed to fetch quote data. Status Code: {response.status_code}")
        print("Response:", response.text)

except requests.exceptions.RequestException as e:
    print(f"An error occurred while fetching the quote data: {e}")
