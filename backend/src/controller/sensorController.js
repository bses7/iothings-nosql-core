import SensorData from "../models/SensorData.js";
import mongoose from "mongoose";

export const getLogs = async (req, res) => {
  try {
    const { room, type, sensor, limit } = req.query;
    let query = {};

    if (room) query.room = room;
    if (type) query.type = type;
    if (sensor) query.sensor = sensor;

    const displayLimit = parseInt(limit) || 10;

    const logs = await SensorData.find(query)
      .sort({ timestamp: -1 })
      .limit(displayLimit);

    res.status(200).json({
      success: true,
      count: logs.length,
      limitRequested: displayLimit,
      data: logs,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getLatestByDevice = async (req, res) => {
  try {
    const data = await SensorData.findOne({ deviceId: req.params.id }).sort({
      timestamp: -1,
    });

    if (!data)
      return res.status(404).json({ success: false, msg: "Device not found" });

    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const deleteOldLogs = async (req, res) => {
  try {
    const result = await SensorData.deleteMany({
      timestamp: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    res.json({
      success: true,
      message: `${result.deletedCount} old logs cleared.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getClusterStatus = async (req, res) => {
  try {
    // This command asks MongoDB for the internal Replica Set status
    const status = await mongoose.connection.db
      .admin()
      .command({ replSetGetStatus: 1 });

    // Clean up the response for a professional API view
    const clusterInfo = {
      set: status.set,
      date: status.date,
      members: status.members.map((m) => ({
        name: m.name,
        health: m.health === 1 ? "UP" : "DOWN",
        stateStr: m.stateStr,
        uptime: m.uptime,
        lastHeartbeat: m.lastHeartbeat,
      })),
    };

    res.status(200).json({ success: true, cluster: clusterInfo });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
