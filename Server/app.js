const express = require('express');
const cors = require('cors');
const indexRoutes = require('./routes/index');

const app = express();
app.use(express.json());
app.use(cors());

//Main routes
app.use('/api', indexRoutes);
app.use(require('./middlewares/errorHandler'));

module.exports = app;