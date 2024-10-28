const mongoose = require("mongoose");

const checkedListItemSchema = new mongoose.Schema({
	text: {
		type: String,
		required: true,
	},
	completed: {
		type: Boolean,
		default: false,
	},
});

const userTaskSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	selectedpriority: {
		type: String,
		required: true,
	},
	assignTo: {
		type: String,
		
	},
	checkedList: {
		type: [checkedListItemSchema],
		required: true,
	},
	duedate: {
		type: Date,
		default: null,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	status: {
		type: String,
		enum: ["backlog", "todo", "inProgress", "done"],
		default: "todo",
	},
	sharedUrl: { type: String },
});

module.exports = mongoose.model("UserTask",userTaskSchema);