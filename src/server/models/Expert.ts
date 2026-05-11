import mongoose from 'mongoose';

const expertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  experience: { type: Number, required: true },
  rating: { type: Number, required: true },
  bio: { type: String, required: true },
  availableDays: { type: [Number], required: true }, // e.g. [1,2,3,4,5] for Mon-Fri
  slotDuration: { type: Number, default: 60 }, // minutes
  startHour: { type: Number, default: 9 }, // 9 AM
  endHour: { type: Number, default: 17 } // 5 PM
}, { timestamps: true });

export const Expert = mongoose.model('Expert', expertSchema);
