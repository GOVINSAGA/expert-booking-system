import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format, addDays, startOfToday, parse, isBefore, isSameDay } from 'date-fns';
import { Star, Clock, Calendar, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Expert } from '../types';
import { BookingModal } from '../components/BookingModal';
import { cn } from '../lib/utils';

export function ExpertDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedDate, setSelectedDate] = useState(startOfToday());
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [socketId, setSocketId] = useState<string | null>(null);

  // Generate next 14 days for date picker
  const dates = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i));

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        const res = await fetch(`/api/experts/${id}`);
        if (!res.ok) throw new Error('Expert not found');
        setExpert(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExpert();
  }, [id]);

  const fetchBookedSlots = async (date: Date) => {
    if (!id) return;
    setLoadingSlots(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch(`/api/bookings/${id}/slots?date=${dateStr}`);
      if (res.ok) {
        const slots = await res.json();
        setBookedSlots(slots);
      }
    } catch (error) {
      console.error('Failed to fetch slots:', error);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    fetchBookedSlots(selectedDate);
    setSelectedSlot(null); // Reset selection when date changes
  }, [id, selectedDate]);

  useEffect(() => {
    // Connect to websocket to listen for new bookings
    const socket = io();

    socket.on('connect', () => {
      setSocketId(socket.id || null);
    });

    socket.on('slot_booked', (data: { expertId: string, date: string, timeSlot: string, clientId?: string }) => {
      if (data.expertId === id && data.date === format(selectedDate, 'yyyy-MM-dd')) {
        setBookedSlots(prev => prev.includes(data.timeSlot) ? prev : [...prev, data.timeSlot]);

        if (data.clientId === socket.id) {
          // If we booked this slot, no need to show the alert
          return;
        }

        // If the user had this slot selected, clear it
        if (selectedSlot === data.timeSlot) {
          setSelectedSlot(null);
          setIsModalOpen(false);
          alert('Sorry, this slot was just booked by someone else!');
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, selectedDate, selectedSlot]);

  // Generate available time slots based on expert's schedule
  const generateSlots = () => {
    if (!expert) return [];

    // Check if the selected date is a day the expert works (0=Sun, 1=Mon...6=Sat)
    const dayOfWeek = selectedDate.getDay();
    // Assuming backend availableDays maps exactly to getDay() (1-Mon... but our db might be different). Let's assume standard JS
    // If not in availableDays, return empty
    if (!expert.availableDays.includes(dayOfWeek === 0 ? 7 : dayOfWeek)) { // Some models map Sun to 7, but let's match JS Date
      // Simple adaptation assuming 1=Mon, 7=Sun
      const mappedDay = dayOfWeek === 0 ? 0 : dayOfWeek;
      if (!expert.availableDays.includes(mappedDay)) return [];
    }

    const slots = [];
    const { startHour, endHour, slotDuration } = expert;

    let currentMin = startHour * 60;
    const endMin = endHour * 60;

    const now = new Date();

    while (currentMin + slotDuration <= endMin) {
      const h = Math.floor(currentMin / 60);
      const m = currentMin % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      // If the selected date is today, disable past slots
      let isPast = false;
      if (isSameDay(selectedDate, now)) {
        const slotTime = parse(timeStr, 'HH:mm', new Date());
        if (isBefore(slotTime, now)) {
          isPast = true;
        }
      }

      slots.push({
        time: timeStr,
        isBooked: bookedSlots.includes(timeStr),
        isPast
      });

      currentMin += slotDuration;
    }

    return slots;
  };

  const dayOfWeekAdjustment = (day: number) => day === 0 ? 7 : day;

  if (loading) return <div className="text-center py-20 animate-pulse text-indigo-600 font-semibold tracking-wide">Loading Expert Profile...</div>;
  if (error || !expert) return <div className="text-center py-20 text-red-500 font-medium">{error || "Expert not found"}</div>;

  const slots = generateSlots();
  // We need to match JS `getDay()` with our `expert.availableDays` where 1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat,7=Sun
  const isDayAvailable = (d: Date) => {
    let day = d.getDay();
    if (day === 0) day = 7;
    return expert.availableDays.includes(day);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg transition-colors"
      >
        <ChevronLeft className="w-4 h-4 mr-1" /> Back
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
        <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-inner flex-shrink-0">
          {expert.name.charAt(0)}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-medium mb-4">
            <span className="flex items-center bg-gray-100 px-2.5 py-1 rounded-md text-gray-800">
              {expert.category}
            </span>
            <span className="flex items-center">
              <Star className="w-4 h-4 text-amber-500 mr-1.5 fill-current" />
              {expert.rating.toFixed(1)} Rating
            </span>
            <span>{expert.experience} years experience</span>
          </div>
          <p className="text-gray-600 leading-relaxed max-w-2xl text-base">{expert.bio}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center tracking-tight">
          <CalendarIcon className="w-5 h-5 mr-2 text-indigo-500" />
          Select a Date & Time
        </h2>

        {/* Date Picker */}
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          {dates.map((date) => {
            const available = isDayAvailable(date);
            const isSelected = isSameDay(date, selectedDate);
            return (
              <button
                key={date.toISOString()}
                disabled={!available}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-all duration-200 relative overflow-hidden",
                  isSelected
                    ? "border-indigo-600 bg-indigo-600 text-white shadow-md transform scale-105"
                    : available
                      ? "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                      : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed opacity-60"
                )}
              >
                <span className={cn("text-xs font-semibold mb-1", isSelected ? "text-indigo-100" : available ? "text-gray-500" : "text-gray-300")}>
                  {format(date, 'EEE')}
                </span>
                <span className="text-xl font-bold">
                  {format(date, 'd')}
                </span>
                {!available && <div className="absolute top-0 right-0 w-full h-full bg-gray-50/50 backdrop-blur-[1px]"></div>}
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
            Available Slots for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>

          {loadingSlots ? (
            <div className="flex gap-2 animate-pulse flex-wrap">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-24 h-11 bg-gray-100 rounded-lg"></div>)}
            </div>
          ) : slots.length === 0 ? (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg text-sm border border-amber-100 font-medium">
              No slots available on this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {slots.map(({ time, isBooked, isPast }) => {
                const disabled = isBooked || isPast;
                return (
                  <button
                    key={time}
                    disabled={disabled}
                    onClick={() => setSelectedSlot(time)}
                    className={cn(
                      "py-2.5 rounded-lg text-sm font-medium transition-all duration-200 border",
                      selectedSlot === time
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md ring-2 ring-indigo-200 ring-offset-1"
                        : disabled
                          ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed line-through decoration-gray-300"
                          : "bg-white border-gray-200 text-gray-700 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-sm"
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button
            disabled={!selectedSlot}
            onClick={() => setIsModalOpen(true)}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
          >
            Book Session {selectedSlot && `at ${selectedSlot}`}
          </button>
        </div>
      </div>

      {isModalOpen && selectedSlot && (
        <BookingModal
          expert={expert}
          date={selectedDate}
          timeSlot={selectedSlot}
          clientId={socketId}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            setSelectedSlot(null);
            fetchBookedSlots(selectedDate);
            navigate('/my-bookings', { state: { bookingSuccess: true } });
          }}
        />
      )}
    </div>
  );
}