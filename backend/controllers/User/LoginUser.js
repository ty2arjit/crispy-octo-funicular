const { getUserByEmail } = require("../../data/store");

module.exports = (req, res) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({ message: "email is required" });
	}

	const user = getUserByEmail(email);
	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	return res.json({ user });
};
