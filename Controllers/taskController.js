const mongoose = require("mongoose");
const userTask = require("../Database/TaskDetails");
const User = require("../Database/User");

//creating the task
const createTask = async (req, res, next) => {
	try {
		const { title, selectedpriority, assignTo, checkedList, duedate } =
			req.body;

		if (
			!title ||
			!selectedpriority ||
			!checkedList ||
			checkedList.length === 0
		) {
			return res.status(400).json({ message: "Please fill all the fields" });
		}
		const formatCheckedList = checkedList
			.map((item) => {
				if (typeof item === "string") {
					return { text: item, completed: false };
				} else if (typeof item === "object" && item.text) {
					return { text: item.text, completed: !!item.completed };
				}
				return null;
			})
			.filter((item) => item != null);

		const newTask = new userTask({
			title,
			selectedpriority,
			assignTo,
			checkedList: formatCheckedList,
			userId: req.body.userId,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		if (duedate) {
			newTask.duedate = duedate;
		}
		await newTask.save();
		res
			.status(201)
			.json({ message: "Task created successfully", task: newTask });
	} catch (err) {
		console.error("Error creating task:", err);
		res.status(500).send(`Failed to create task: ${err.message}`);
		next(err);
	}
};

//Get task by Id
const getTaskById = async (req, res) => {
	try {
		const { id } = req.params;
		const task = await userTask.findById(id);
		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}
		res.status(200).json(task);
	} catch (err) {
		console.error("Error fetching task:", err);
		res.status(500).send(`Failed to fetch task: ${err.message}`);
	}
};

//update task by Id
const updateTask = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { checkedList, status } = req.body;

		//find the task by id
		const task = await userTask.findById(id);
		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}
		console.log("Task Found: ", task);

		//update the task
		task.status = status || task.status;

		//update the checkedList
		if (checkedList && Array.isArray(checkedList)) {
			task.checkedList = checkedList.map((item) => ({
				text: item.text,
				completed: item.completed,
			}));
		}

		//update the timetask
		task.updatedAt = new Date();

		const updatedTask = await task.save();
		res
			.status(200)
			.json({ message: "Task updated successfully", task: updatedTask });
	} catch (error) {
		next(error);
	}
};

//to delete task by Id
const deleteTask = async (req, res, next) => {
	try {
		const { id } = req.params;
		const task = await userTask.findByIdAndDelete(id);
		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}
		res.status(200).json({ message: "Task deleted successfully" });
	} catch (error) {
		console.error("Error deleting task:", err);
		res.status(500).send(`Failed to delete task: ${err.message}`);
		next(error);
	}
};

//update all task details by id -- title, priority, duedate, status, assignedTo, checkedList
const updateAllTaskDetailsById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const {
			title,
			selectedpriority,
			assignTo,
			checkedList,
			duedate,
			status,
			checkedListToDelete,
		} = req.body;

		// Extract logged-in user ID from request
		const loggedInUserId = req.user.userId;

		//find the task by id - checked if the task exists
		const task = await userTask.findById(id);
		if (!task) {
			return res.status(404).json({ message: "Task not found" });
		}

		//update the task
		task.title = title || task.title;
		task.selectedpriority = selectedpriority || task.selectedpriority;
		task.status = status || task.status;
		if (task.userId.toString() === loggedInUserId) {
			task.assignTo = assignTo || task.assignTo;
		}
		//Handle checklist items
		if (checkedList) {
			if (Array.isArray(checkedList)) {
				task.checkedList = checkedList.map((item) => ({
					text: item.text,
					completed: item.completed,
				}));
			}
		}

		//handle checklist items to delete
		if (checkedListToDelete && Array.isArray(checkedListToDelete)) {
			task.checkedList = task.checkedList.filter(
				(item) => !checkedListToDelete.includes(item._id.toString())
			);
		}

		//update the date if provided
		if (duedate) {
			task.duedate = duedate;
		}

		//update the timetask
		task.updatedAt = new Date();

		//save the update task
		const updatedTask = await task.save();
		res
			.status(200)
			.json({ message: "Task updated successfully", task: updatedTask });
	} catch (err) {
		next(err);
		console.error("Error updating task:", err);
		res.status(500).send(`Failed to update task: ${err.message}`);
	}
};

//Get tasks by userId -- filters (this week, this month, today)





const getTasksByUserId = async (req, res, next) => {
	try {
		const userId = req.user.userId;
		const filter = req.query.filter;
		console.log("User ID received in backend:", userId);
		console.log("Filter received:", filter);

		const now = new Date();
		let startDate;
		let endDate = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
			23,
			59,
			59,
			999
		); // End of today

		switch (filter) {
			case "today":
				startDate = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					0,
					0,
					0,
					0
				); // Start of today
				break;
			case "thisweek":
				startDate = new Date(now);
				startDate.setDate(now.getDate() - now.getDay()); // Start of this week (Sunday)
				startDate.setHours(0, 0, 0, 0);
				endDate = new Date(
					now.getFullYear(),
					now.getMonth(),
					now.getDate(),
					23,
					59,
					59,
					999
				); // End of today
				break;
			case "thismonth":
				startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of this month
				endDate = new Date(
					now.getFullYear(),
					now.getMonth() + 1,
					0,
					23,
					59,
					59,
					999
				); // End of this month
				break;
			default:
				startDate = null;
		}

		let query = { userId };
		if (startDate) {
			query.createdAt = { $gte: startDate, $lte: endDate };
		}

		const tasks = await userTask.find(query);
		res.status(200).json(tasks);
	} catch (err) {
		console.error("Error fetching tasks:", err);
		next(err);
	}
};




// //originalgetTasksByUserId
// const getTasksByUserId = async (req, res, next) => {
// 	try {
// 		const userId = req.user.userId; // Ensure this is an ObjectId
// 		const filter = req.query.filter; // Extract filter from query
// 		console.log("User ID received in backend:", userId);
// 		console.log("Filter received:", filter);

// 		const now = new Date();
// 		let startDate;
// 		let endDate = now;

// 		// Determine the startDate based on the filter
// 		switch (filter) {
// 			case "today":
// 				startDate = new Date(now.setHours(0, 0, 0, 0)); // Start of today
// 				break;
// 			case "thisweek":
// 				startDate = new Date(now.setDate(now.getDate() - now.getDay())); // Start of this week
// 				break;
// 			case "thismonth":
// 				startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of this month
// 				break;
// 			default:
// 				startDate = null; // No filter applied
// 		}

// 		let query = { userId }; // Set the userId filter
// 		if (startDate) {
// 			query.createdAt = { $gte: startDate, $lte: endDate }; // Add date filter
// 		}

// 		const tasks = await userTask.find(query); // Fetch tasks based on query
// 		res.status(200).json(tasks);
// 	} catch (err) {
// 		console.error("Error fetching tasks:", err);
// 		next(err); // Pass error to error handling middleware
// 	}
// };

//Analytics of data -- get all tasks and count them by status, priority, due date


const getAnalyticsData = async (req, res, next) => {
	try {
		const userId = req.user.userId; // extract userId from req.user

		// Logging the userId for debugging
		console.log("User ID received in backend:", userId);

		// Fetch tasks by userId
		const taskByUserId = await userTask.find({ userId });

		// Analytics data on tasks
		const analytics = {
			backlog: 0,
			todo: 0,
			inProgress: 0,
			done: 0,
			lowPriority: 0,
			moderatePriority: 0,
			highPriority: 0,
			dueDateTasks: 0,
		};

		taskByUserId.forEach((task) => {
			// Counting tasks by status
			if (task.status === "backlog") analytics.backlog++;
			if (task.status === "todo") analytics.todo++;
			if (task.status === "inProgress") analytics.inProgress++;
			if (task.status === "done") analytics.done++;

			// Counting tasks by priority
			if (task.selectedpriority === "LOW PRIORITY") analytics.lowPriority++;
			if (task.selectedpriority === "MODERATE PRIORITY")
				analytics.moderatePriority++;
			if (task.selectedpriority === "HIGH PRIORITY") analytics.highPriority++;

			// Counting tasks with due dates
			if (task.duedate) analytics.dueDateTasks++;
		});

		res.json(analytics);
	} catch (err) {
		console.error("Error fetching tasks:", err);
		next(err); // Use only next to handle the error and avoid duplicate responses
	}
};

module.exports = {
	createTask,
	getTaskById,
	updateTask,
	deleteTask,
	updateAllTaskDetailsById,
	getTasksByUserId,
	getAnalyticsData,
};
