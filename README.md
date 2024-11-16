# NeuroNova
NeuroNova - AI Agent

#### install dependencies
```
pip install -r requirements.txt
```

#### install rust
```
curl --proto '=https' --tlsv1.3 https://sh.rustup.rs -sSf | sh
```

#### set environment variables
```
CDP_API_KEY_NAME=<CDP_API_KEY_NAME>
CDP_API_KEY_PRIVATE_KEY=<CDP_API_KEY_PRIVATE_KEY>
OPENAI_API_KEY=<OPENAI_API_KEY>
NETWORK_ID=base-sepolia

BASE_GET_PRODUCTS=https://api.exchange.coinbase.com/products
BASE_SPOT_PRICE=https://api.coinbase.com/v2/prices/{}/spot
WALLET_DATA_FILE=wallet_details.txt
AGENT_RUN_INTERVAL=60
```

#### run flask server
```
python flask_server.py
```

#### start celery workers
```
celery -A flask_server.celery_app worker --loglevel INFO --concurrency 2
```

#### start the fetch_current_prices.py service
```
python fetch_current_prices.py
```