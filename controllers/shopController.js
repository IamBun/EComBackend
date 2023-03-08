const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");

//gui email
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.SENDGRID_APIKEY,
    },
  })
);

exports.getAllProduct = async (req, res, next) => {
  try {
    const products = await Product.find();
    if (products.length == 0) {
      res.json({ message: "No products found !" });
    }
    res.status(200).json({ products: products });
  } catch (error) {
    console.log(error);
  }
};

exports.getProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ product: product });
  } catch (error) {
    console.log(error);
  }
};

exports.getCart = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found !");
      error.statusCode = 404;
      throw error;
    }
    //  const productInUserCart = user.cart.items.map((ele) => ele.productId);

    res.status(200).json(user.cart.items);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postCart = async (req, res, next) => {
  const userId = req.params.userId;
  const prodId = req.body.productId;
  let quantity = req.body.quantity;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found !");
      error.statusCode = 404;
      throw error;
    }
    const cartProductIndex = user.cart.items.findIndex((cp) => {
      return cp.productId.toString() === prodId.toString();
    });
    const updatedCartItems = [...user.cart.items];

    if (cartProductIndex >= 0) {
      quantity += user.cart.items[cartProductIndex].quantity;
      updatedCartItems[cartProductIndex].quantity = quantity;
    } else {
      updatedCartItems.push({
        productId: prodId,
        quantity: quantity,
      });
    }
    const updatedCart = { items: updatedCartItems };
    user.cart = updatedCart;
    await user.save();
    res.status(200).json({ message: "Cart added" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteCart = async (req, res, next) => {
  const prodId = req.body.productId;
  const userId = req.params.userId;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found !");
      error.statusCode = 404;
      throw error;
    }
    const newCart = user.cart.items.filter((ele) => {
      return ele.productId != prodId;
    });

    user.cart.items = newCart;
    await user.save();
    res.status(200).json({ message: "Deleted !" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
exports.putCart = async (req, res, next) => {
  const userId = req.params.userId;
  const prodId = req.body.productId;
  const quantity = req.body.quantity;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found !");
      error.statusCode = 404;
      throw error;
    }

    user.cart.items.forEach((ele) => {
      if (ele.productId == prodId) {
        ele.quantity = quantity;
      }
    });
    await user.save();
    res.status(200).json({ message: "Update quantity success !" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postOrder = async (req, res, next) => {
  const userId = req.userId;
  const name = req.body.name;
  const email = req.body.email;
  const phoneNumber = req.body.phoneNumber;
  const address = req.body.address;
  const total = req.body.total;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error("User not found !");
      error.statusCode = 404;
      throw error;
    }
    if (
      name.trim() === "" ||
      email.trim() == "" ||
      phoneNumber.trim() == "" ||
      address.trim() == ""
    ) {
      const error = new Error("Missing field ! Check and try again !");
      error.statusCode = 422;
      throw error;
    }

    const products = user.cart.items;

    const order = new Order({
      userId: req.userId,
      name: name,
      email: email,
      phoneNumber: phoneNumber,
      address: address,
      products: products,
      total: total,
    });

    await order.save();
    user.cart.items = [];
    await user.save();
    await transporter.sendMail({
      to: req.body.email,
      from: "nhuchon971110@gmail.com",
      subject: "Order Success !",
      html: "<h1>You order has been success ! </h1>",
    });
    res.status(200).json({ message: "Order Created !", order: order });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  const userId = req.userId;

  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const orders = await Order.find({ userId: userId });
    if (!orders) {
      const error = new Error("No order found !");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(orders);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  const orderId = req.params.orderId;
  const userId = req.userId;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error("No order found !");
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json(order);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
