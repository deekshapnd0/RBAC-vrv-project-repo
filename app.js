const express = require('express');
const createHttpError = require('http-errors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const connectFlash = require('connect-flash');
const passport = require('passport');
const connectMongo = require('connect-mongo');
const { ensureLoggedIn } = require('connect-ensure-login');
const { roles } = require('./utils/constants');

// Initialization
const app = express();
app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize MongoStore for session storage using `connect-mongo` version 4.x.x+
const MongoStore = connectMongo.create({
  mongoUrl: process.env.MONGODB_URI, // MongoDB URI
  dbName: process.env.DB_NAME, // Database name
  collectionName: 'sessions', // Optional: Customize session collection name
});

// Init Session with MongoStore
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
    },
    store: MongoStore, // Store sessions in MongoDB using MongoStore
  })
);

// For Passport JS Authentication
app.use(passport.initialize());
app.use(passport.session());
require('./utils/passport.auth');

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// Connect Flash
app.use(connectFlash());
app.use((req, res, next) => {
  res.locals.messages = req.flash();
  next();
});

// Routes
app.use('/', require('./routes/index.route'));
app.use('/auth', require('./routes/auth.route'));
app.use(
  '/user',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  require('./routes/user.route')
);
app.use(
  '/admin',
  ensureLoggedIn({ redirectTo: '/auth/login' }),
  ensureAdmin, // Ensure only admins can access this route
  require('./routes/admin.route')
);

// 404 Handler
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

// Error Handler
app.use((error, req, res, next) => {
  error.status = error.status || 500;
  res.status(error.status);
  res.render('error_40x', { error });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: process.env.DB_NAME,
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => {
    console.log('💾 Connected to MongoDB...');
    const PORT = process.env.PORT || 3003; // Port to listen on
    app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.log('MongoDB connection error:', err.message);
    process.exit(1); // Exit the process if MongoDB connection fails
  });

// Ensure only admin users can access the admin route
function ensureAdmin(req, res, next) {
  if (req.user && req.user.role === roles.admin) {
    next();
  } else {
    req.flash('warning', 'You are not authorized to see this route');
    res.redirect('/');
  }
}

// Ensure user is logged in (for the user route)
function ensureLoggedInCustom(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/login');
  }
}
