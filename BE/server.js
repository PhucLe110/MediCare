const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB(); 

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const userRoutes = require('./routes/userRoutes');
const labResultRoutes = require('./routes/labResultRoutes');
const labRequestRoutes = require('./routes/labRequestRoutes');
const billingRoutes = require('./routes/billingRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const doctorRoutes = require('./routes/doctorRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lab-results', labResultRoutes);
app.use('/api/lab-requests', labRequestRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api', billingRoutes);

app.get('/', (req, res) => {
  res.send('MediCare API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));
