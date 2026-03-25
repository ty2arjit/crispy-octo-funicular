const express = require("express");

const createUser = require("../controllers/User/CreateUser");
const loginUser = require("../controllers/User/LoginUser");
const updateUser = require("../controllers/User/UpdateUser");

const router = express.Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.patch("/:id", updateUser);

module.exports = router;
