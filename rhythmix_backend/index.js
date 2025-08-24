// npm init : package.json -- This is a node project.
// npm i express : expressJs package install hogya. -- project came to know that we are using express
// We finally use express

const express = require("express");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const User = require("./models/User");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
const externalRoutes = require("./routes/external");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 8080;

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// connect mongodb to our node app.
// mongoose.connect() takes 2 arguments : 1. Which db to connect to (db url), 2. 2. Connection options
mongoose.connect(
    process.env.MONGODB_URI || "mongodb+srv://hitpatel5114:vGeO5ZoPBpt9kZw8@cluster0.wov13bn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then((x) => {
    console.log("Connected to Mongo!");
  })
  .catch((err) => {
    console.log("Error while connecting to Mongo",err);
  });

// setup passport-jwt
const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET || "thisKeyIsSupposedToBeSecret"; // Make sure this matches your token generation

passport.use(
  new JwtStrategy(opts, async function (jwt_payload, done) {
    try {
      console.log("JWT payload:", jwt_payload); // Debug log
      const user = await User.findOne({ _id: jwt_payload.identifier });
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    } catch (err) {
      console.error("JWT Strategy error:", err);
      return done(err, false);
    }
  })
);


// API : GET type : / : return text "Hello world"
app.get("/", (req, res) => {
  // req contains all data for the request
  // res contains all data for the response
  res.send("Hello World");
});
app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);
app.use("/external", externalRoutes);

// Now we want to tell express that our server will run on localhost:8000
app.listen(port, () => {
  console.log("App is running on port " + port);
});
