### Running Tappd Simulator Docker Image
docker pull phalanetwork/tappd-simulator:latest
docker run --rm -p 8090:8090 phalanetwork/tappd-simulator:latest

### Running application Dockerfile
docker build -t my-python-app:latest .
docker run --rm -p 3000:3000 my-python-app:latest