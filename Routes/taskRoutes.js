const express = require("express");
const router = express.Router();
const {
	createTask,
	getTaskById,
	updateTask,
	deleteTask,
	updateAllTaskDetailsById,
	getTasksByUserId,
	getAnalyticsData,
} = require("../Controllers/taskController");
const authRequiredToken = require("../Middlewares/authMiddleware");

router.get("/test", (req, res) => {
	res.status(200).send("Task Route testing!");
});

//create task route
router.post("/create", authRequiredToken, createTask);

//get task by user id route --filters
router.get("/getUser/:userId", authRequiredToken, getTasksByUserId);

//update task by id route
router.patch("/updateChecklist/:id", authRequiredToken, updateTask);

//delete task by id route
router.delete("/delete/:id", authRequiredToken, deleteTask);

//update all task details by id route
router.patch("/updateAll/:id", authRequiredToken, updateAllTaskDetailsById);

//get analytics data route
router.get("/analytics/:userId", authRequiredToken, getAnalyticsData);

//get task by id route -- share route no auth
router.get("/taskData/:id", getTaskById);

module.exports = router;
