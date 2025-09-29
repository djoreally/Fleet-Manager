import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001; // Backend will run on a different port than the frontend

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from our frontend
}));
app.use(express.json()); // Parse JSON bodies

import authRoutes from './routes/auth';
import vehicleRoutes from './routes/vehicles';
import { authenticateToken } from './middleware/auth';

// Basic route to confirm the server is up
app.get('/', (req, res) => {
  res.send('Fleet Management API is running!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', authenticateToken, vehicleRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

export default app;