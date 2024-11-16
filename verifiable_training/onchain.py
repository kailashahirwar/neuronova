from web3 import Web3

infura_url = "https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID"
web3 = Web3(Web3.HTTPProvider(infura_url))

# Check connection
if not web3.is_connected():
    print("Connection to Sepolia failed")
    exit()
else:
    print("Connected Successfully to Sepolia")

# Replace with your wallet details
private_key = ""
from_address = web3.to_checksum_address("")
to_address = web3.to_checksum_address("0x0000000000000000000000000000000000000000")  # Null address for data-only transactions

# Create transaction
nonce = web3.eth.get_transaction_count(from_address)
data = web3.to_hex(text="Hello Sepolia!")  # Data you want to store
tx = {
    'nonce': nonce,
    'to': to_address,
    'value': web3.to_wei(0.0001, 'ether'),  # Value to transfer
    'gas': 22000,
    'gasPrice': web3.to_wei('5', 'gwei'),
    'data': data,
    'chainId': 11155111,  # Sepolia chain ID
}

# Sign transaction
signed_tx = web3.eth.account.sign_transaction(tx, private_key)

# Send transaction
tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)

# Get transaction hash
print(f"Transaction sent! Hash: {web3.to_hex(tx_hash)}")

# Wait for the transaction receipt
tx_receipt = web3.eth.wait_for_transaction_receipt(tx_hash)
print(f"Transaction included in block {tx_receipt.blockNumber}")

block = web3.eth.get_block(tx_receipt.blockNumber)
print(block)