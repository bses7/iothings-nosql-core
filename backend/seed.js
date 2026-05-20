import mongoose from "mongoose";
import SensorData from "./src/models/SensorData.js";
import "dotenv/config";

const generateData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Cluster for Seeding...");

    await SensorData.deleteMany({});

    const rooms = ["Living Room", "Kitchen", "Master Bedroom", "Hallway"];
    const sensorTypes = [
      { sensor: "temperature", type: "environmental", unit: "°C" },
      { sensor: "smoke", type: "safety", unit: "alert" },
      { sensor: "motion", type: "security", unit: "boolean" },
    ];

    let historicalData = [];

    for (let i = 0; i < 100; i++) {
      const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
      const config =
        sensorTypes[Math.floor(Math.random() * sensorTypes.length)];

      historicalData.push({
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 604800000)),
        room: randomRoom,
        deviceId: `${randomRoom.substring(0, 3).toUpperCase()}-${config.sensor.toUpperCase()}-01`,
        type: config.type,
        sensor: config.sensor,
        value:
          config.sensor === "temperature"
            ? (Math.random() * 15 + 18).toFixed(1)
            : Math.random() > 0.8,
        unit: config.unit,
        status: "Historical",
      });
    }

    await SensorData.insertMany(historicalData);
    console.log(
      `Successfully seeded ${historicalData.length} sensor activations.`,
    );
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

generateData();
