# API-Server-Project

1. Docker Build Command
```bash
docker build -t card-server:latest

2. Docker Run Command 
docker run -d -P --name card-server-container card-server:latest

3. How to View Website 
-  Run docker ps
- Find the port mapping 
    - For example: 0.0.0.0:32768->3000/tcp
- Open a browser and go to: http://localhost:32768/cards



