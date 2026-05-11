export type Expert = {
  _id: string;
  name: string;
  category: string;
  experience: number;
  rating: number;
  bio: string;
  availableDays: number[];
  slotDuration: number;
  startHour: number;
  endHour: number;
  createdAt: string;
};

export type Booking = {
  _id: string;
  expertId: string | Expert;
  name: string;
  email: string;
  phone: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
};
