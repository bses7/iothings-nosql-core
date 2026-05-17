# IoThings Home Automation Core: NoSQL Infrastructure

<p align="center"> <img src="https://skillicons.dev/icons?i=nodejs,mongodb,docker,express,npm,linux" /> </p> <p align="center"> <img src="https://img.shields.io/badge/Node--RED-Dashboard%202.0-red?style=for-the-badge&logo=nodered" /> <img src="https://img.shields.io/badge/MQTT-Mosquitto-blue?style=for-the-badge" /> <img src="https://img.shields.io/badge/MongoDB-Replica%20Set-green?style=for-the-badge&logo=mongodb" /> <img src="https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express" /> </p>

## Project Overview

This repository contains the complete "Three-Cluster" NoSQL backend and edge simulation developed for **IoThings**. The system is designed to ingest high-frequency sensor data, perform exception-based filtering, and provide a high-availability storage solution using MongoDB Replica Sets.

## System Architecture

- **Edge Layer:** Node-RED Dashboard 2.0 (Simulates Environmental, Safety, and Security sensors).
- **Transport Layer:** MQTT (Eclipse Mosquitto) for lightweight messaging.
- **Ingestion & API Layer:** Node.js (Express) with Mongoose ODM.
- **Storage Layer:** MongoDB Three-Node Replica Set (`rs0`) for high availability and failover.

## Prerequisite: Local DNS Setup

To resolve the cluster nodes correctly from your host machine, add the following entry to your `hosts` file:

- **Windows:** `C:\Windows\System32\drivers\etc\hosts`
- **Linux/Mac:** `/etc/hosts`

```text
127.0.0.1 mongo1 mongo2 mongo3
```

## Installation & Deployment

1. **Clone the repository.**
2. **Automated Setup:**
   - On Windows: Run `setup.bat`
   - On Linux/Mac: Run `bash setup.sh`
3. **Start the Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

## Edge Simulation Setup (Node-RED)

To establish the sensor environment and user interface, follow these steps:

1. **Access Node-RED:** Open your browser and navigate to `http://localhost:1880`.
2. **Install Dependencies:**
   - Click the **Menu** (top right) > **Manage Palette**.
   - Go to the **Install** tab and search for `@flowfuse/node-red-dashboard`.
   - Click **Install**.
3. **Import Flow:**
   - Click **Menu** > **Import**.
   - Select the `home-automation.json` file from the `/simulation` folder or paste its contents.
   - Click **Import**.
4. **Deploy:** Click the red **Deploy** button in the top right corner.
5. **View Dashboard:** Access the professional home automation interface at:
   - **`http://localhost:1880/dashboard`**

## API Documentation

The system provides a RESTful API for data retrieval and cluster monitoring.

| Endpoint                | Method | Description                         | Parameters              |
| :---------------------- | :----- | :---------------------------------- | :---------------------- |
| `/api/v1/sensors`       | GET    | Retrieve filtered sensor logs       | `limit`, `type`, `room` |
| `/api/v1/sensors/:id`   | GET    | Get latest data for specific device | `deviceId`              |
| `/api/v1/system/status` | GET    | Verify MongoDB Replica Set Health   | N/A                     |

## Data Ingestion Strategy

To optimize database performance, the Node.js ingestion engine applies **Exception-Based Persistent Storage**:

- **Critical Data:** Safety (Smoke/Gas) and Security (Locks) are always persisted.
- **Environmental Data:** Temperature (>30°C), Humidity (>70%), and AQI (>50) are persisted only when thresholds are exceeded.
- **Actuators:** All state changes (Coffee Machine, Lights) are logged for audit purposes.
