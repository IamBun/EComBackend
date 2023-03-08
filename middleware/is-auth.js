const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  //xac minh bang cach lay token tu header gui len hoac token tu session
  //c1: gui token tu client len

  // const authHeader = req.get("Authorization");
  // try {
  //   if (!authHeader) {
  //     const error = new Error("Not authenticated !");
  //     error.statusCode = 401;
  //     throw error;
  //   }
  //   const token = authHeader;
  //   let decodedToken = jwt.verify(token, "secret");

  //   if (!decodedToken) {
  //     const error = new Error("Authenticated !");
  //     error.statusCode = 401;
  //     throw error;
  //   }
  //   req.userId = decodedToken.userId;
  //   req.role = decodedToken.role;
  //   req.name = decodedToken.name;
  //   next();
  // } catch (err) {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // }

  //c2: lay token tu session ( khoi phai gui token tu client len )
  const authHeader = req.session.token;
  try {
    if (!authHeader) {
      const error = new Error("Not authenticated !");
      error.statusCode = 401;
      throw error;
    }
    const token = authHeader;
    let decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      const error = new Error("Authenticated !");
      error.statusCode = 401;
      throw error;
    }
    req.userId = decodedToken.userId;
    req.role = decodedToken.role;
    req.name = decodedToken.name;
    next();
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
