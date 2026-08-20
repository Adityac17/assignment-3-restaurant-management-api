const express = require('express');
const cors = require('cors');

const loggingMiddleware = require('./middleware/loggingMiddleware');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/auth');
const restaurantRoutes = require('./routes/restaurants');
const menuRoutes = require('./routes/menu');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(loggingMiddleware);

app.get('/', (req, res) => {
  res.status(200).json({ data: null, message: 'Welcome to Restaurant API', status: 200 });
});

app.use('/', authRoutes);
app.use('/restaurants', restaurantRoutes);
app.use('/menu', menuRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
