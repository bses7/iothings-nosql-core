#!/bin/bash
echo "[IoThings] Starting Professional IoT Infrastructure..."
docker-compose down -v
docker-compose up -d

echo "[IoThings] Waiting 20 seconds for MongoDB Cluster to boot..."
sleep 20

echo "[IoThings] Initializing Three-Node Replica Set (rs0)..."
docker exec -it iothings_mongo_1 mongosh --port 27018 --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'mongo1:27018'},{_id:1,host:'mongo2:27019'},{_id:2,host:'mongo3:27020'}]})"

echo "[IoThings] Setup Complete!"