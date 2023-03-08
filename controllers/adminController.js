const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const fs = require("fs");
const path = require("path");
const socket = require("../socket");

exports.getAllProduct = async (req, res, next) => {
  const userId = req.userId;
  const role = req.role;

  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const products = await Product.find();
    if (products.length == 0) {
      res.json({ message: "No products found !" });
    }
    res.status(200).json(products);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProductById = async (req, res, next) => {
  const userId = req.userId;
  const prodId = req.params.productId;
  const role = req.role;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error("Product not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json(product);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAddProduct = async (req, res, next) => {
  const userId = req.userId;
  const role = req.role;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    if (role !== "admin") {
      const error = new Error("Unauthorized !");
      error.statusCode = 403;
      throw error;
    }
    res.status(200).json(role);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postAddProduct = async (req, res, next) => {
  const userId = req.userId;
  const role = req.role;
  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const long_desc = req.body.long_desc;
  const short_desc = req.body.short_desc;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    if (role !== "admin") {
      const error = new Error("Unauthorized !");
      error.statusCode = 403;
      throw error;
    }
    if (!req.files || req.files.length == 0) {
      const error = new Error("No image provided !");
      error.statusCode = 422;
      throw error;
    }
    if (
      name == "" ||
      price == "" ||
      category == "" ||
      short_desc == "" ||
      long_desc == ""
    ) {
      const error = new Error("Missing field ! ");
      error.statusCode = 422;
      throw error;
    }
    const images = req.files.map((ele) => ele.path.replace(/\\/g, "/"));
    const product = new Product({
      name: name,
      price: price,
      category: category,
      short_desc: short_desc,
      long_desc: long_desc,
      image: images,
    });

    await product.save();
    res.status(200).json({ message: "Uploaded !" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const userId = req.userId;
  const role = req.role;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    if (role !== "admin") {
      const error = new Error("Unauthorized !");
      error.statusCode = 403;
      throw error;
    }
    if (!prodId) {
      const error = new Error("Product Not Found !");
      error.statusCode = 404;
      throw error;
    }
    const product = await Product.findById(prodId);
    product.image.forEach((ele) => clearImage(ele));
    // const product = await Product.findByIdAndDelete(prodId);
    await product.delete();
    res.status(200).json({ message: "Deleted !" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.editProduct = async (req, res, next) => {
  const prodId = req.params.productId;
  const userId = req.userId;
  const role = req.role;

  const name = req.body.name;
  const price = req.body.price;
  const category = req.body.category;
  const long_desc = req.body.long_desc;
  const short_desc = req.body.short_desc;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    if (role !== "admin") {
      const error = new Error("Unauthorized !");
      error.statusCode = 403;
      throw error;
    }

    if (
      name == "" ||
      price == "" ||
      category == "" ||
      short_desc == "" ||
      long_desc == ""
    ) {
      const error = new Error("Missing field ! ");
      error.statusCode = 422;
      throw error;
    }

    const product = await Product.findById(prodId);
    if (!product) {
      const error = new Error("No product found !");
      error.statusCode = 404;
      throw error;
    }
    const oldImages = product.image; // Save the old images array

    product.name = name;
    product.price = price;
    product.category = category;
    product.long_desc = long_desc;
    product.short_desc = short_desc;

    if (req.files && req.files.length > 0) {
      const images = req.files.map((ele) => ele.path.replace(/\\/g, "/"));
      product.image = images;
      oldImages.forEach((ele) => clearImage(ele)); //xoa anh cu trong file neu co anh moi
    }

    await product.save();
    res.status(200).json({ message: "Uploaded !" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getDashboard = async (req, res, next) => {
  const userId = req.userId;
  const role = req.role;
  try {
    if (!userId) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }
    if (role !== "admin") {
      const error = new Error("Unauthorized !");
      error.statusCode = 403;
      throw error;
    }

    const countUser = await User.find({ role: "user" }).countDocuments();
    const countOrder = await Order.find().countDocuments();
    const orders = await Order.find();

    let totalOrder = 0;
    orders.forEach((ele) => {
      totalOrder += ele.total;
    });

    res.status(200).json({
      countUser: countUser,
      countOrder: countOrder,
      orders: orders,
      totalOrder: totalOrder,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUserMessage = async (req, res, next) => {
  const userId = req.userId;

  try {
    //Do sth here
    socket.on("client-sent");
    res.status(200).json(req.session.message);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => console.log(err));
};
