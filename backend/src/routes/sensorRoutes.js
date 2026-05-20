import express from "express";
import {
  getLogs,
  getLatestByDevice,
  deleteOldLogs,
  getClusterStatus,
  deleteLog,
  updateLogStatus,
  createLog,
  getDashboardSummary,
  getHouseAnalytics,
} from "../controller/sensorController.js";

export const router = express.Router();

router.route("/").post(createLog).get(getLogs);

router.route("/system/status").get(getClusterStatus);

router.route("/cleanup").delete(deleteOldLogs);

router.get("/system/summary", getDashboardSummary);
router.get("/system/analytics", getHouseAnalytics);

router
  .route("/:id")
  .delete(deleteLog)
  .get(getLatestByDevice)
  .patch(updateLogStatus);

export default router;
