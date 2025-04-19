import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js'; // include `.js` if using ES modules
import userRouter from './routes/userRoutes.js';
import imageRouter from './routes/imageRoutes.js';

dotenv.config();

const PORT = process.env.PORT || 4000;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.get('/', (req, res) => res.send("API working "));


// Start server after DB connects
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(" Could not start server:", err.message);
    process.exit(1);
  }
};

startServer();
