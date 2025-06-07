require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const httRoutes = require("./routes/httpRoutes");
const cors = require("cors");
const path = require("path");
const cookie = require("cookie-parser");
const session = require("express-session");
const helmet = require('helmet')
const logger = require('morgan')

class App {
  constructor(port) {
    this.app = express();
    this.port = port;
    this.initializeMiddleware();
  }

  initializeMiddleware() {
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
          maxAge: 60*60*1000,
          sameSite: true,
          httpOnly: false,
          secure: true,
        },
      })
    );
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.set("view engine", "ejs");
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(cookie());
    this.app.use(logger('dev'));
    this.app.use("/", httRoutes);
    this.app.use(express.static(path.join(__dirname, "public")));

    // bootstrap
    this.app.use(
      express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
    );
  }

  start() {
    mongoose.connect(process.env.DBURL);
    const db = mongoose.connection;
    db.once("open", () => {
      console.log("connected to database");
      this.app.listen(this.port, () => {
        console.log(`http://localhost:${this.port}`);
      });
    });
    db.on("error", (e) => {
      console.log(e.message);
    });
  }
}

const app = new App(3000);
app.start();
