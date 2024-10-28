const express = require("express");
const router = express.Router();
const {
	registerUser,
	loginUser,
	getUserById,
	updateUser,
	addPeople,
	getAddPeople,
} = require("../Controllers/userController");
const authRequiredToken = require("../Middlewares/authMiddleware");

//register user route
router.post("/register", registerUser);

//login user route
router.post("/login", loginUser);

//get user data by id route
router.get("/userdata/:userId", authRequiredToken, getUserById);

//update user data route
router.patch("/updateuserdata/:userId", authRequiredToken, updateUser);

//add people route
router.patch("/addpeople", authRequiredToken, addPeople);

// Get the list of added people
router.get("/getAddpeople/:userId", authRequiredToken, getAddPeople);

module.exports = router;
