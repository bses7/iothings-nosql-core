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
    const status = await mongoose.connection.db
      .admin()
      .command({ replSetGetStatus: 1 });

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

export const createLog = async (req, res) => {
  try {
    const newLog = new SensorData(req.body);
    await newLog.save();
    res.status(201).json({ success: true, data: newLog });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const updateLogStatus = async (req, res) => {
  try {
    const log = await SensorData.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    res.status(200).json({ success: true, data: log });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const deleteLog = async (req, res) => {
  try {
    await SensorData.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Log deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await SensorData.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$deviceId",
          latestTimestamp: { $first: "$timestamp" },
          room: { $first: "$room" },
          sensor: { $first: "$sensor" },
          type: { $first: "$type" },
          value: { $first: "$value" },
          status: { $first: "$status" },
        },
      },
      { $sort: { room: 1 } },
    ]);

    res.status(200).json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getHouseAnalytics = async (req, res) => {
  try {
    const analytics = await SensorData.aggregate([
      {
        $facet: {
          safetyAlertsByRoom: [
            { $match: { type: "safety" } },
            { $group: { _id: "$room", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ],
          environmentalAverages: [
            {
              $match: {
                type: "environmental",
                sensor: { $in: ["temperature", "humidity"] },
              },
            },
            {
              $group: {
                _id: "$sensor",
                avgValue: { $avg: "$value" },
                min: { $min: "$value" },
                max: { $max: "$value" },
              },
            },
          ],
          topActuators: [
            { $match: { type: "actuator" } },
            { $group: { _id: "$sensor", activations: { $sum: 1 } } },
            { $sort: { activations: -1 } },
          ],
        },
      },
    ]);

    res.status(200).json({ success: true, data: analytics[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
