const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
let blacklist = require("./router/auth_users.js").blacklist;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

// Middleware to authenticate users using JWT
app.use("/customer/auth/*", function auth(req,res,next){
if (req.session.authorization) { // Get the authorization object stored in the session
    token = req.session.authorization['accessToken']; // Retrieve the token from authorization object
    if (blacklist.has(token)) {
      return res.status(403).json({ message: "Invalid user account. Please login again" });
    }
    jwt.verify(token, "access", (err, user) => { // Use JWT to verify token
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
