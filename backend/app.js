/**
 * InvenX Backend
 * ==============================
 * Author: Dana Klinger
 * Class: CS-499
 * Application: InvenX: Inventory Manager
 * Date: July 2025
 * ===============================
 * Entry point for the Express backend server.
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();
require('./models/user'); 
require('./config/passport');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const apiRoutes = require('./routes/index');
app.use('/api', apiRoutes);

app.use((req, res, next) => {
  res
  .status(404)
  .json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));