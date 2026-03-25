const { getUserById, updateUser, logInteraction } = require("../../data/store");

module.exports = (req, res) => {
	const { id } = req.params;
	const payload = req.body;

	const user = getUserById(id);
	if (!user) {
		return res.status(404).json({ message: "User not found" });
	}

	const updated = updateUser(id, payload);

	if (payload.lastTopicRead) {
		logInteraction(id, {
			type: "topic-read",
			topic: payload.lastTopicRead
		});
	}

	return res.json({ user: updated });
};
