import express from 'express';
import { Booking } from '../models/Booking';
import { z } from 'zod';
import { io } from '../../../server';

export const bookingRouter = express.Router();

const bookingSchema = z.object({
  expertId: z.string().min(1, 'Expert ID is required'),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Valid phone number is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time slot format'),
  notes: z.string().optional()
});

bookingRouter.post('/', async (req, res) => {
  try {
    const data = bookingSchema.parse(req.body);
    
    // Check for existing booking
    const existing = await Booking.findOne({
      expertId: data.expertId,
      date: data.date,
      timeSlot: data.timeSlot,
      status: { $ne: 'Cancelled' }
    });

    if (existing) {
      return res.status(409).json({ error: 'Time slot is already booked' });
    }

    const booking = new Booking(data);
    await booking.save();

    // Emit real-time event to connected clients that this slot was booked
    if (io) {
      io.emit('slot_booked', {
        expertId: data.expertId,
        date: data.date,
        timeSlot: data.timeSlot
      });
    }

    res.status(201).json(booking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    // Handle mongoose duplicate key error (race condition mitigation)
    if ((error as any).code === 11000) {
      return res.status(409).json({ error: 'Time slot is already booked' });
    }
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

bookingRouter.get('/', async (req, res) => {
  try {
    const email = req.query.email as string;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const bookings = await Booking.find({ email }).populate('expertId', 'name category').sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

bookingRouter.get('/:expertId/slots', async (req, res) => {
  try {
    const { expertId } = req.params;
    const date = req.query.date as string;
    
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const bookings = await Booking.find({ 
      expertId, 
      date, 
      status: { $ne: 'Cancelled' } 
    }).select('timeSlot');

    res.json(bookings.map(b => b.timeSlot));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch booked slots' });
  }
});

bookingRouter.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});
