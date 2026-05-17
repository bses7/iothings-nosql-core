import mongoose from "mongoose";

const sensorDataSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true, index: true },
    room: { type: String, required: true },
    deviceId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    sensor: { type: String, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    unit: { type: String },
    status: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

const SensorData = mongoose.model("SensorData", sensorDataSchema);
export default SensorData;
