const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const shopRoutes = require("./routes/shopRoute");
const authRoutes = require("./routes/authRoute");
const adminRoutes = require("./routes/adminRoute");

const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_NAME}:${process.env.MONGODB_PASS}@mongopractice.ddclk27.mongodb.net/${process.env.MONGODB_COLLECTION}?retryWrites=true&w=majority`;

const app = express();

//setup Store and File Filter Upload Image
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
  expires: 1000 * 60 * 60 * 24,
});
app.use(express.urlencoded());
// app.use(express.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://localhost:3001"],
  })
);
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("images", 4)
);
app.use("/images", express.static(path.join(__dirname, "images")));

//sessionMiddleware
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
  },
});
app.use(sessionMiddleware);
// session({
//   secret: "bunEcom",
//   resave: false,
//   saveUninitialized: false,
//   store: store,
//   cookie: {
//     httpOnly: true,
//     secure: false,
//     maxAge: 1000 * 60 * 60 * 24,
//   },
//   unset: "destroy",
// })
// );

app.use("/shop", shopRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/", (req, res, next) => {});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://bun:bunbun@mongopractice.ddclk27.mongodb.net/ecom?retryWrites=true&w=majority"
  )
  .then((result) => {
    const server = app.listen(process.env.PORT || 5000, () => {
      console.log("This app Ecom is running on port " + process.env.PORT);
    });

    //SOCKET
    const io = require("./socket.js").init(server);

    const wrap = (middleware) => (socket, next) =>
      middleware(socket.request, {}, next);

    io.use(wrap(sessionMiddleware));
    //Ket noi socket
    io.on("connection", (socket) => {
      console.log("Client connect !", socket.id);

      //Client sent message
      socket.on("client-sent", (clientMess) => {
        // console.log("Nhan duoc tin nhan client", clientMess);
        // socket.request.session.message.push(clientMess);
        // socket.request.session.save();
        io.emit("support-receive", clientMess);
      });
      socket.on("support-reply", (supportMess) => {
        io.emit("client-receive", supportMess);
      });
    });
    io.on("disconnect", (socket) => {
      console.log("Client disconnected !", socket.id);
    });
  });
