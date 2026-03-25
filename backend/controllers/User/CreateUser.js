const { createUser, getUserByEmail } = require("../../data/store");

module.exports = (req, res) => {
	const { name, email, role, interests, readingStyle } = req.body;

	if (!name || !email || !role) {
		return res.status(400).json({
			message: "name, email and role are required"
		});
	}

	const exists = getUserByEmail(email);
	if (exists) {
		return res.status(409).json({ message: "User already exists" });
	}

	const user = createUser({
		name,
		email,
		role,
		interests: interests || [],
		readingStyle: readingStyle || "short"
	});

	return res.status(201).json({ user });
};
