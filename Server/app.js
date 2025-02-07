const express = require('express');
const cors = require('cors');
const indexRoutes = require('./routes/index');
const passport = require('passport');
const configurePassport = require('./config/passport');
const errorHandler = require('./middlewares/errorHandler');

configurePassport();
const app = express();
app.use(express.json());
app.use(cors());
app.use(passport.initialize());

//Main routes
app.use('/api', indexRoutes);
app.use(errorHandler);

module.exports = app;