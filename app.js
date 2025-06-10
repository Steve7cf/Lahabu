require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const httRoutes = require("./routes/httpRoutes");
const cors = require("cors");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require('connect-mongodb-session')(session);
const helmet = require('helmet');
const logger = require('morgan');
const flash = require('connect-flash')

class App {
  constructor(port) {
    this.app = express();
    this.port = port;
    
    // Initialize MongoDB session store
    this.store = new MongoStore({
      uri: process.env.DBURL,
      collection: 'sessions',
      expires: 1000 * 60 * 60 * 24
    });
    
    this.initializeMiddleware();
  }

  initializeMiddleware() {
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET,
        store: this.store, // Use MongoDB for session storage
        saveUninitialized: false,
        resave: false,
        cookie: {
          maxAge: 60*60*1000, // 1 hour
          sameSite: 'strict',
          httpOnly: true, // Recommended for security
          secure: process.env.NODE_ENV === 'production' // Secure in production
        },
      })
    );

    this.app.use(flash());
  
    
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.set("view engine", "ejs");
    this.app.use(helmet());
    this.app.use(cors({
      origin: true, // Adjust according to your needs
      credentials: true // Required if using cross-origin sessions
    }));
    this.app.use(cookieParser()); // Fixed the variable name
    this.app.use(logger('dev'));
    this.app.use("/", httRoutes);
    this.app.use(express.static(path.join(__dirname, "public")));

    // Bootstrap
    this.app.use(
      express.static(path.join(__dirname, "node_modules/bootstrap/dist"))
    );
  }

  async start() {
    try {
      await mongoose.connect(process.env.DBURL);
      console.log("Connected to database");
      
      this.app.listen(this.port, () => {
        console.log(`Server running at http://localhost:${this.port}`);
      });
    } catch (error) {
      console.error("Database connection error:", error.message);
      process.exit(1);
    }
  }
}

const app = new App(process.env.PORT || 3000);
app.start();