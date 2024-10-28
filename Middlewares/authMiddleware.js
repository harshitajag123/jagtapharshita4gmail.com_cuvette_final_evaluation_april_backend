const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const authToken = (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		return res.status(401).json({
			message: "Unauthorized",
		});
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res.status(403).json({ message: "Invalid token" });
		}
		console.log("Decoded JWT payload : ", decoded);
		req.user = decoded;
		next();
	});
};

module.exports = authToken;
