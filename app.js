const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const morgan = require("morgan"); // Morgan for logging purpose to server - If any request comes to the server then we can log it
const exphbs = require("express-handlebars"); // templating engine
const methodOverride = require("method-override");
const passport = require("passport");
const session = require("express-session");
const { json } = require("express");
const MongoStore = require("connect-mongo")(session);

const connectDb = require(__dirname + "/config/db");

// Load Config File
dotenv.config({ path: __dirname + "/config/config.env" });

// Load Passport File
require(__dirname + "/config/passport")(passport);

// Connecting to MongoDB - function present in db.js
connectDb();

// Initializing Express
const app = express();

// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // look in urlencoded POST bodies and delete it
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// LOGGING - Want morgan to run only in DEV mode
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev")); // Can pass diiferent arguments but for dev purpose just pass 'dev'
}

// Handlebars Helpers
const {
  formatDate,
  stripTags,
  truncate,
  editIcon,
  select,
} = require(__dirname + "/helpers/hbs");

// Handlebars
app.engine(
  ".hbs",
  exphbs({
    helpers: { formatDate, stripTags, truncate, editIcon, select },
    defaultLayout: "main",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");

// Session
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set global Variable
app.use(function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", require(__dirname + "/routes/index"));
app.use("/auth", require(__dirname + "/routes/auth"));
app.use("/stories", require(__dirname + "/routes/stories"));

const PORT = process.env.PORT || 3000;

app.listen(
  PORT,
  console.log(`server running in ${process.env.NODE_ENV} mode on ${PORT}`)
);
