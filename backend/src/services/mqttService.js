import mqtt from "mqtt";
import SensorData from "../models/SensorData.js";
import "dotenv/config";

const THRESHOLDS = {
  temperature: 28,
  humidity: 85,
  aqi: 80,
  energy: 2000,
};

const initMQTT = () => {
  const client = mqtt.connect(process.env.MQTT_BROKER);

  client.on("connect", () => {
    console.log("MQTT Connected: Listening for IoThings Edge Data");
    client.subscribe(process.env.MQTT_TOPIC);
  });

  client.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      let shouldStore = false;

      if (data.type === "safety" || data.type === "security") {
        shouldStore = true;
      } else if (data.type === "actuator") {
        shouldStore = true;
      } else if (data.type === "environmental" || data.sensor === "aqi") {
        if (
          data.sensor === "temperature" &&
          data.value >= THRESHOLDS.temperature
        )
          shouldStore = true;
        if (data.sensor === "humidity" && data.value >= THRESHOLDS.humidity)
          shouldStore = true;
        if (data.sensor === "aqi" && data.value >= THRESHOLDS.aqi)
          shouldStore = true;
      } else if (data.type === "energy") {
        if (
          data.sensor === "grid_consumption" &&
          data.value >= THRESHOLDS.energy
        ) {
          shouldStore = true;
        }
      }

      if (shouldStore) {
        const entry = new SensorData(data);
        await entry.save();
        console.log(
          `[ALERT/LOG] Stored ${data.sensor} from ${data.room} (Value: ${data.value})`,
        );
      } else {
        console.log(`[SKIPPED] ${data.sensor} is within normal range.`);
      }
    } catch (err) {
      console.error("Ingestion Error:", err.message);
    }
  });
};

export default initMQTT;
