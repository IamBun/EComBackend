const express = require("express");
const isAuth = require("../middleware/is-auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

//get Dashboard
router.get("/dashboard", isAuth, adminController.getDashboard);

//Get All Product
router.get("/allProduct", isAuth, adminController.getAllProduct);

//get add product
router.get("/addproduct", isAuth, adminController.getDashboard);

//Create product
router.post("/addproduct", isAuth, adminController.postAddProduct);

//Get Product By ID
router.get("/product/:productId", isAuth, adminController.getProductById);

//edit Product
router.put("/product/:productId", isAuth, adminController.editProduct);

//delete product
router.delete("/product/:productId", isAuth, adminController.deleteProduct);

router.get("/message/:userId", isAuth, adminController.getUserMessage);

module.exports = router;
