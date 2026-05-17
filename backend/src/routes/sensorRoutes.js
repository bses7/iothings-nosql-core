import express from "express";
import {
  getLogs,
  getLatestByDevice,
  deleteOldLogs,
  getClusterStatus,
} from "../controller/sensorController.js";

const router = express.Router();

router.get("/", getLogs);
router.get("/:id", getLatestByDevice);
router.delete("/cleanup", deleteOldLogs);
router.get("/system/status", getClusterStatus);

export default router;
