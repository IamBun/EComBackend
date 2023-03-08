const express = require("express");

const router = express.Router();
const shopController = require("../controllers/shopController");
const isAuth = require("../middleware/is-auth");

//get All products
router.get("/allProduct", shopController.getAllProduct);

//get product
router.get("/product/:productId", shopController.getProduct);

//get cart
router.get("/cart/:userId", isAuth, shopController.getCart);

//post cart
router.post("/cart/:userId", isAuth, shopController.postCart);

//update product in cart
router.put("/cart/:userId", isAuth, shopController.putCart);

//delete product in cart
router.delete("/cart/:userId", isAuth, shopController.deleteCart);

//create order
router.post("/order", isAuth, shopController.postOrder);

//get user order
router.get("/order", isAuth, shopController.getOrder);

//get order by Id
router.get("/order/:orderId", isAuth, shopController.getOrderById);

module.exports = router;
