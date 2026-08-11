const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config({ path: '../.env' }); // Adjust path as we'll run from server/

const app = express();
const PORT = process.env.PORT || 5001;

app.use(compression());
app.use(cors({ origin: true, credentials: true })); // Update CORS for cookies
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // increased for hackathon demo testing
  message: { success: false, error: 'Too many requests, please try again later.' }
});

const authRoutes = require('./routes/authRoutes');
const lostRoutes = require('./routes/lostRoutes');
const foundRoutes = require('./routes/foundRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const searchRoutes = require('./routes/searchRoutes');
const claimRoutes = require('./routes/claimRoutes');
const moderatorRoutes = require('./routes/moderatorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/lost', lostRoutes);
app.use('/api/found', foundRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/moderator', moderatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const http = require('http');
const socket = require('./utils/socket');

const server = http.createServer(app);
const io = socket.init(server);

io.on('connection', (socket) => {
  console.log('Authenticated Client connected:', socket.user?.id || socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.send('LostFound+ API is running with WebSockets');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
