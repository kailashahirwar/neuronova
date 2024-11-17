## Asynchronous Distributed Training on TEEs

Welcome to the future of secure and efficient machine learning! This repository explores the innovative fusion of **Asynchronous Distributed Training and Trusted Execution Environments (TEEs)**, enabling privacy-preserving collaboration on sensitive data across untrusted networks. By leveraging TEEs, we ensure that data and model integrity are uncompromised while achieving the scalability and performance needed for modern AI workloads. 

### Running Tappd Simulator Docker Image

The following command initializes Phala Network's TEE Simulator that enables us to attest ML computations allowing for verifiability of the entire training process.  

```bash
docker pull phalanetwork/tappd-simulator:latest

docker run --rm -p 8090:8090 phalanetwork/tappd-simulator:latest
```

### Running application Dockerfile

```bash
docker build -t my-python-app:latest .

docker run --rm -p 3000:3000 my-python-app:latest
```

### Running the Compute DApp
```bash
python3 -m uvicorn compute_dapp:compute_dapp --host=0.0.0.0 --port=3001
```
