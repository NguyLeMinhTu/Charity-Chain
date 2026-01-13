const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes);

const donationRoutes = require('./routes/donationRoutes');
app.use('/api/donations', donationRoutes);

const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

module.exports = app;
