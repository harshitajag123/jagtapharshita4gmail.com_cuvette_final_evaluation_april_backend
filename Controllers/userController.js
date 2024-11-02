const User = require("../Database/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateToken = require("../Utils/generateToken");

//register user
const registerUser = async (req, res, next) => {
	try {
		//extract name, email and password from req.body
		const { name, email, password } = req.body;
		if (!name || !email || !password) {
			return res.status(404).send("please fill all the fields.");
		}

		//check if user is already register -- findOne()
		const CheckUserExist = await User.findOne({ email });

		//if exist return msg user exists
		if (CheckUserExist) {
			// Return a structured response with a specific message
			return res.status(400).json({ message: "User already exists." });
		}

		const hashPassword = await bcrypt.hash(password, 10);
		//create user
		const newUser = new User({
			name,
			email,
			password: hashPassword,
		});
		// save user
		await newUser.save();
		res
			.status(201)
			.json({ message: "success" })
			.send("User created/registered successfully.");
	} catch (error) {
		next(error);
	}
};

//login user
const loginUser = async (req, res, next) => {
	try {
		//extract email and password from req.body
		const { email, password } = req.body;

		//validations --
		//check if the email and password fields are fill
		if (!email || !password) {
			return res.status(400).send("Please fill all the fields.");
		}

		//checked if user email id exists (user is register)
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).send("User not found. Please register.");
		}

		//checked if password is correct
		const isPasswordCorrect = await bcrypt.compare(password, user.password);
		if (!isPasswordCorrect) {
			return res.status(401).send("Invalid Credentials.");
		}

		//generate token and return success response
		const token = generateToken(user._id);
		res.status(200).json({
			status: "success",
			message: "Login Successful",
			token,
			userId: user._id,
			name: user.name,
			email: user.email,
		});
	} catch (err) {
		next(err);
	}
};

//get user by id
const getUserById = async (req, res) => {
	try {
		//extract userId from req.params
		const userId = req.user.userId;
		console.log(userId);

		//find user by userId
		const user = await User.findById(userId);
		res.status(200).json(user);

		//if user not found
		if (!user) {
			res.status(404).json({ message: "User not found" });
		}
	} catch (err) {
		console.error("Error fetching user:", err); // Log any errors that occur
		res.status(500).send({ message: "Server error" });
	}
};

//update user

const updateUser = async (req, res, next) => {
	try {
		const userId = req.user.userId;
		const { name, email, oldPassword, newPassword } = req.body;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		let updateFields = {};
		if (name) {
			user.name = name;
			updateFields.name = name;
		}

		if (email) {
			const existEmail = await User.findOne({ email });
			if (existEmail && existEmail._id.toString() !== userId) {
				return res.status(400).json({ message: "Email already exists" });
			}
			user.email = email;
			updateFields.email = email;
		}

		// Update password if oldPassword and newPassword are provided
		if (oldPassword && newPassword) {
			const isPasswordCorrect = await bcrypt.compare(
				oldPassword,
				user.password
			);
			if (!isPasswordCorrect) {
				return res.status(400).json({ message: "Invalid old password" });
			}

			// Hash the new password and update it
			const hashedNewPassword = await bcrypt.hash(newPassword, 10);
			user.password = hashedNewPassword;
			updateFields.password = "updated";
		}

		// Save updated user details
		await user.save();

		const response = {
			message: "User updated successfully.",
			user: {
				name: user.name,
				email: user.email,
			},
		};

		console.log("Updated fields:", updateFields);
		res.status(200).json(response);
	} catch (err) {
		next(err);
	}
};
//solves the password error

//add people route
const addPeople = async (req, res, next) => {
	try {
		const userId = req.user.userId;
		const { emails } = req.body;

		if (!emails || !Array.isArray(emails)) {
			return res.status(400).json({ message: "Invalid email list." });
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		user.addPeople = [...new Set([...user.addPeople, ...emails])];
		await user.save();

		res.status(200).json({
			message: "Emails added successfully",
			addPeople: user.addPeople,
		});
	} catch (err) {
		next(err);
	}
};

//get addPeople list
const getAddPeople = async (req, res, next) => {
	try {
		const userId = req.params.userId; // Get userId from route parameter
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({ addPeople: user.addPeople }); // Respond with the user’s addPeople data
	} catch (error) {
		next(error);
	}
};

module.exports = {
	registerUser,
	loginUser,
	getUserById,
	updateUser,
	addPeople,
	getAddPeople,
};
