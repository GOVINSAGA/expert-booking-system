import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Search, MapPin, Calendar, Clock, Video, Loader2 } from 'lucide-react';
import { Booking } from '../types';
import { cn } from '../lib/utils';

export function MyBookings() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const showSuccessBanner = location.state?.bookingSuccess as boolean;

  const fetchBookings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setHasSearched(true);
    
    try {
      const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      setBookings(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {showSuccessBanner && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-emerald-800">Booking Confirmed!</h3>
            <p className="text-sm text-emerald-600 mt-1">Your session has been successfully booked. You can track its status below.</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">My Bookings</h1>
        <p className="text-gray-500">Enter your email address to view and manage your scheduled expert sessions.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <form onSubmit={fetchBookings} className="flex gap-3">
          <input
            type="email"
            required
            placeholder="Enter your email address..."
            className="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading || !email}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-semibold text-sm shadow-sm hover:bg-indigo-700 disabled:opacity-75 transition-colors flex items-center justify-center whitespace-nowrap"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
            Find Bookings
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {hasSearched && !loading && !error && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">Results for "{email}"</h2>
          
          {bookings.length === 0 ? (
            <div className="bg-white rounded-xl p-10 border border-gray-100 shadow-sm text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-900 font-medium">No bookings found</p>
              <p className="text-gray-500 text-sm mt-1">We couldn't find any scheduled sessions for this email.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const expertName = typeof booking.expertId === 'object' ? (booking.expertId as any).name : 'Expert';
                const expertCategory = typeof booking.expertId === 'object' ? (booking.expertId as any).category : '';
                
                return (
                  <div key={booking._id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-colors overflow-hidden">
                    <div className="p-5 flex flex-col sm:flex-row justify-between gap-5">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 font-bold text-lg rounded-full flex items-center justify-center border-2 border-white ring-1 ring-indigo-100 flex-shrink-0">
                          {expertName.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{expertName}</h3>
                          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-3">{expertCategory}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600 font-medium">
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {format(parseISO(booking.date), 'MMMM d, yyyy')}
                            </div>
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {booking.timeSlot}
                            </div>
                            <div className="flex items-center">
                              <Video className="w-4 h-4 mr-2 text-gray-400" />
                              Video Call Link will be provided
                            </div>
                          </div>
                          
                          {booking.notes && (
                            <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-700 italic border-l-4 border-l-gray-300">
                              <span className="not-italic font-semibold block text-xs text-gray-500 mb-1 uppercase tracking-wide">Notes provided:</span>
                              "{booking.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end justify-between sm:pl-4 sm:border-l border-gray-100 min-w-[120px]">
                        <span className={cn(
                          "px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm uppercase tracking-wider whitespace-nowrap",
                          getStatusColor(booking.status)
                        )}>
                          {booking.status}
                        </span>
                        
                        <div className="text-xs text-gray-400 mt-auto pt-4 font-medium text-right">
                          Booked on <br/>{format(new Date(booking.createdAt), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
