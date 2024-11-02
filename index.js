const port = process.env.PORT || 3000;
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const authRoutes = require("./Routes/userRoutes");
const taskRoutes = require("./Routes/taskRoutes");

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
	cors({
		origin: ["http://localhost:5000", "https://pro-manage-sepia.vercel.app"],
		// Frontend URL
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Allowed HTTP methods
		credentials: true, // Enable this if you're dealing with cookies
	})
);

const logStream = fs.createWriteStream(path.join(__dirname, "log.txt"), {
	flags: "a",
});
const errorStream = fs.createWriteStream(path.join(__dirname, "error.txt"), {
	flags: "a",
});

app.use((req, res, next) => {
	const now = new Date();
	const time = `${now.toLocaleTimeString()}`;
	const log = `${req.method} ${req.originalUrl} ${time}`;
	logStream.write(log + "\n");
	next();
});

//routes
app.use("/api/auth", authRoutes);
app.use("/api/task", taskRoutes);

app.get("/", (req, res) => {
	res.status(200).send("Hello World");
});

app.use((err, req, res, next) => {
	const now = new Date();
	const time = `${now.toLocaleTimeString()}`;
	const error = `${req.method} ${req.originalUrl} ${time}`;
	errorStream.write(error + err.stack + "\n");
	res.status(500).send("Internal Server Error");
});

app.use((req, res, next) => {
	const now = new Date();
	const time = `${now.toLocaleTimeString()}`;
	const error = `${req.method} ${req.originalUrl} ${time}`;
	errorStream.write(error + "\n");
	res.status(404).send("Route Not Found");
});

mongoose
	.connect(process.env.MONGODB_URI, {
		serverSelectionTimeoutMS: 20000, // 20-second timeout
	})
	.then(() => console.log("DB connected successfully"))
	.catch((e) => console.log(e));

app.listen(port, () => {
	console.log(`Server running on ${port}`);
});
//   promanage -- proManage
