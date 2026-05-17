import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";

import connectDB from "./src/config/database.js";
import initMQTT from "./src/services/mqttService.js";
import sensorRoutes from "./src/routes/sensorRoutes.js";

const app = express();

connectDB();

initMQTT();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/sensors", sensorRoutes);

app.get("/health", (req, res) => res.send("IoThings API is active."));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`SME Server running on port ${PORT}`));
