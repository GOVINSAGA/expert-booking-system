import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  expertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expert', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  timeSlot: { type: String, required: true }, // HH:mm
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'], 
    default: 'Pending' 
  }
}, { timestamps: true });

// Compound index to prevent double bookings at the database level
bookingSchema.index({ expertId: 1, date: 1, timeSlot: 1 }, { unique: true });

export const Booking = mongoose.model('Booking', bookingSchema);
