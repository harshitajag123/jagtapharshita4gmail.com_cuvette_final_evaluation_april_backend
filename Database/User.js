const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},

	addPeople: {
		type: [String],
		validate: {
			validator: function (v) {
				return v.every((email) => /.+@.+\..+/.test(email));
			},
			message: (props) => `${props.value} contains an invalid email address`,
		},
	},
});

module.exports = mongoose.model("User", userSchema);
