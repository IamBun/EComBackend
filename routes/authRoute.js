const express = require("express");

const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.postRegister);

router.post("/login", authController.postLogin);

router.post("/adminlogin", authController.postAdminLogin);

router.post("/logout", authController.postLogout);

module.exports = router;
