import express from "express";
import cors from "cors";
import 'dotenv/config'
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import compression from "compression";

import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import appointmentRouter from "./routes/appointmentRoute.js";

const app = express();
const port = process.env.PORT || 2000;

// Initialize connections
connectDB();
connectCloudinary();

// Optimize compression - compress all responses
app.use(compression({
  level: 6, // Compression level (1-9, 6 is good balance)
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
}));

// Security headers
app.disable('x-powered-by');

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
const allowedOrigin = process.env.FRONTEND_URL || true;
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
}));

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds timeout
  res.setTimeout(30000);
  next();
});

// API routes
app.use('/api/user', userRouter);
app.use('/api/doctor', doctorRouter);
app.use("/api/appointment", appointmentRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'DocPoint API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});