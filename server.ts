import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';

import { expertRouter } from './src/server/routes/experts';
import { bookingRouter } from './src/server/routes/bookings';
import { Expert } from './src/server/models/Expert';

export let io: Server | null = null;

async function seedDatabase() {
  const count = await Expert.countDocuments();
  if (count === 0) {
    const experts = [
      { name: 'Dr. Sarah Jenkins', category: 'Medical', experience: 10, rating: 4.8, bio: 'General Practitioner with 10 years experience.', availableDays: [1,2,3,4,5], slotDuration: 30, startHour: 9, endHour: 17 },
      { name: 'John Doe', category: 'Legal', experience: 15, rating: 4.9, bio: 'Corporate Lawyer focusing on tech startups.', availableDays: [1,3,5], slotDuration: 60, startHour: 10, endHour: 15 },
      { name: 'Alice Smith', category: 'Tech Consulting', experience: 8, rating: 4.7, bio: 'Senior Cloud Architect helping companies scale.', availableDays: [2,4], slotDuration: 45, startHour: 11, endHour: 18 },
      { name: 'Michael Brown', category: 'Finance', experience: 12, rating: 4.6, bio: 'Certified Financial Planner aiming to build your wealth.', availableDays: [1,2,3,4,5,6], slotDuration: 60, startHour: 9, endHour: 17 },
      { name: 'Emma Wilson', category: 'Mental Health', experience: 6, rating: 5.0, bio: 'Licensed Therapist specializing in CBT.', availableDays: [2,3,4], slotDuration: 60, startHour: 8, endHour: 14 }
    ];
    await Expert.insertMany(experts);
    console.log('Seeded Experts to database.');
  }
}

async function connectDB() {
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No valid MONGODB_URI found, using MongoDB Memory Server...");
    const mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
  } else {
    console.log("Using custom MONGODB_URI from environment variables.");
  }
  
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  await seedDatabase();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  await connectDB();

  const httpServer = createServer(app);
  io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // API routes
  app.use('/api/experts', expertRouter);
  app.use('/api/bookings', bookingRouter);

  // Fallback for missing api routes
  app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Server startup error:", err);
});
