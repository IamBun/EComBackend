const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  image: [String],
  long_desc: {
    type: String,
  },
  short_desc: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
